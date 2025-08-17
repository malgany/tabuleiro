import { COLS, ROWS, indexToRowCol, rowColToIndex } from './board-utils.js';
import { computeReachable, buildPath } from './pathfinding.js';
import {
  units,
  initUnits,
  getActive,
  getInactive,
  showReachableFor,
  mountUnit,
  clearSocoAlcance,
  showFloatingText,
} from './units.js';
import { initUI, updateBluePanel, initEnemyTooltip, uiState, startTurnTimer } from './ui.js';
import { getRandomItems } from './config.js';
import { showOverlay } from './overlay.js';

export async function startBattle() {
  showOverlay('Desafio contra vermelho', { duration: 3000 });
  for (let i = 3; i > 0; i--) {
    await new Promise(r => setTimeout(r, 1000));
  }
  startTurnTimer();
}

async function moveUnitAlongPath(unit, path, cost) {
  for (const step of path.slice(1)) {
    unit.pos = step;
    mountUnit(unit);
    await new Promise(r => setTimeout(r, 300));
  }
  showFloatingText(unit, `-${cost}`, 'pm');
}

async function animateAttack(attacker, defender, paCost, damage) {
  defender.el.classList.add('shake');
  setTimeout(() => {
    defender.el.classList.remove('shake');
  }, 300);
  showFloatingText(attacker, `-${paCost}`, 'pa');
  showFloatingText(defender, `-${damage}`, 'pv');
  await new Promise(r => setTimeout(r, 600));
}

export function gameOver(result) {
  if (result !== 'vitoria') return;
  units.red.el?.remove();
  setTimeout(() => {
    const board = document.querySelector('.board');
    if (!board) return;
    const chest = document.createElement('div');
    chest.className = 'chest';
    chest.innerHTML = '<div class="lid"></div><div class="box"></div>';
    board.appendChild(chest);

    chest.addEventListener(
      'click',
      () => {
        const loot = document.createElement('div');
        loot.className = 'loot';
        const items = getRandomItems(3);
        items.forEach(it => {
          const el = document.createElement('div');
          el.className = 'loot-item';
          el.textContent = it.icon || it.id;
          loot.appendChild(el);
        });
        board.appendChild(loot);
      },
      { once: true }
    );
  }, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid');
  if (!grid) return;

  const cards = Array.from(grid.children);
  cards.forEach((el, i) => {
    const { row, col } = indexToRowCol(i);
    el.dataset.row = String(row);
    el.dataset.col = String(col);
    el.dataset.color = el.classList.contains('blue') ? 'blue' : 'red';
  });

  const isBlue = (r, c) => {
    const idx = rowColToIndex(r, c);
    const el = cards[idx];
    return el && el.dataset.color === 'blue';
  };
  const isRed = (r, c) => {
    const idx = rowColToIndex(r, c);
    const el = cards[idx];
    return el && el.dataset.color === 'red';
  };

  initUnits(cards, isBlue, isRed);
  initEnemyTooltip();
  initUI();

  Object.values(units).forEach(u => {
    u.el.addEventListener('mouseenter', () => {
      if (getActive().id !== u.id) return;
      showReachableFor(u);
    });
  });

  grid.addEventListener('click', async (ev) => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    const cell = target.closest('.card');
    if (!cell) return;

    const active = getActive();
    if (uiState.socoSelecionado && cell.classList.contains('attackable')) {
      const r = Number(cell.dataset.row);
      const c = Number(cell.dataset.col);
      const enemy = getInactive();
      if (enemy.pos.row === r && enemy.pos.col === c && active.pa >= 3) {
        const paCost = 3;
        const damage = 2;
        active.pa -= paCost;
        enemy.pv -= damage;
        await animateAttack(active, enemy, paCost, damage);
        updateBluePanel(units.blue);
        mountUnit(enemy);
      }
      uiState.socoSelecionado = false;
      uiState.socoSlot.classList.remove('is-selected');
      clearSocoAlcance();
      return;
    }

    if (!cell.classList.contains('reachable')) return;

    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);
    const dist = computeReachable(active.pos, active.pm, active.allow);
    const path = buildPath(active.pos, { row: r, col: c }, dist, active.allow);
    if (!path) return;

    const cost = dist[r][c];
    if (!Number.isFinite(cost) || cost <= 0 || cost > active.pm) return;

    active.pm -= cost;
    await moveUnitAlongPath(active, path, cost);
    updateBluePanel(units.blue);

    // Atualiza destaque conforme PM restante
    showReachableFor(active);
  });

  console.log('[Tabuleiro] Unidades inicializadas', units);
});

export { showOverlay };
