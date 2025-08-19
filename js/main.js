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
  clearItemAlcance,
  showFloatingText,
  getCoords,
  getTPatternCells,
  getCrossPatternCells,
  clearPathHighlight,
} from './units.js';

import * as ui from './ui.js';

const {
  initUI,
  updateBluePanel,
  initEnemyTooltip,
} = ui;
import { getRandomItems } from './config.js';
import { showOverlay } from './overlay.js';

export function checkGameOver() {
  if (units.blue.pv <= 0) ui.gameOver('derrota');
  else if (units.red.pv <= 0) gameOver('vitoria');
}


export async function moveUnitAlongPath(unit, path, cost) {
  if (path.length < 2) {
    showFloatingText(unit, `-${cost}`, 'pm');
    return;
  }
  for (let i = 1; i < path.length; i++) {
    const step = path[i];
    const { x: endX, y: endY } = getCoords(step.row, step.col);
    const dx = endX - unit.x;
    const dy = endY - unit.y;

    await new Promise(resolve => {
      if (dx === 0 && dy === 0) {
        resolve();
        return;
      }
      const handler = () => resolve();
      unit.el.addEventListener('transitionend', handler, { once: true });
      unit.el.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;
    });

    unit.pos = step;
    unit.x = endX;
    unit.y = endY;
    unit.el.dataset.row = String(step.row);
    unit.el.dataset.col = String(step.col);

    // snap to the new cell before next step
    const el = unit.el;
    const prevTransition = el.style.transition;
    el.style.transition = 'none';
    el.style.left = `${endX}px`;
    el.style.top = `${endY}px`;
    el.style.transform = 'translate(-50%, -50%)';
    void el.offsetWidth;
    el.style.transition = prevTransition;
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
  ui.stopTurnTimer();
  const overlay = showOverlay('Vitória!', { duration: 3000 });
  units.red.el?.remove();
  setTimeout(() => {
    const board = document.querySelector('.board');
    if (!board) return;
    const chest = document.createElement('div');
    chest.className = 'chest';
    chest.innerHTML = '<div class="lid"></div><div class="box"></div>';
    board.appendChild(chest);

    // Allow the player to click the chest while keeping the victory message on
    // screen. Without disabling pointer events, the overlay element would sit
    // above the board and swallow all click interactions, blocking the chest.
    overlay.style.pointerEvents = 'none';

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
          el.title = it.effect;

          // When the player chooses an item it is stored in an inventory slot,
          // then the game transitions back to the map screen advancing the
          // stage.
          el.addEventListener(
            'click',
            () => {
              ui.addItemCard(it, () => {
                // Advance stage and show the map screen again
                const stageKey = 'stage';
                const stage = Number(localStorage.getItem(stageKey)) || 0;
                localStorage.setItem(stageKey, String(stage + 1));
                const playedKey = 'played';
                localStorage.setItem(playedKey, 'true');
                const boardScreen = document.getElementById('board-screen');
                const mapScreen = document.getElementById('map-screen');
                if (boardScreen) boardScreen.style.display = 'none';
                if (mapScreen) mapScreen.style.display = '';
                import('./game.js').then(m => m.renderMap());
              });
            },
            { once: true },
          );

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
  const boardEl = document.querySelector('.board');
  if (!grid || !boardEl) return;

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

  boardEl.addEventListener('click', async ev => {
    const target = ev.target;
    if (!(target instanceof HTMLElement)) return;
    let cell = target.closest('.card');
    let r, c;
    if (cell) {
      r = Number(cell.dataset.row);
      c = Number(cell.dataset.col);
    } else {
      const unitEl = target.closest('.unit');
      if (unitEl) {
        r = Number(unitEl.dataset.row);
        c = Number(unitEl.dataset.col);
        const idx = rowColToIndex(r, c);
        cell = cards[idx];
      }
    }
    if (!cell || r === undefined || c === undefined) return;

    const active = getActive();
    const selected = ui.uiState.selectedItem;
    if (selected && cell.classList.contains('attackable')) {
      const enemy = getInactive();
      const { item, card, slot } = selected;
      if (item.pattern === 'T') {
        const cells = getTPatternCells(active, enemy);
        const hit = cells.some(
          p => p.row === enemy.pos.row && p.col === enemy.pos.col,
        );
        if (hit && active.pa >= item.paCost) {
          active.pa -= item.paCost;
          enemy.pv -= item.damage;
          await animateAttack(active, enemy, item.paCost, item.damage);
          updateBluePanel(units.blue);
          mountUnit(enemy);
          checkGameOver();
        }
      } else if (item.pattern === 'cross') {
        if (active.pa >= item.paCost) {
          const cells = getCrossPatternCells({ row: r, col: c });
          active.pa -= item.paCost;
          showFloatingText(active, `-${item.paCost}`, 'pa');
          [units.blue, units.red].forEach(u => {
            if (
              cells.some(p => p.row === u.pos.row && p.col === u.pos.col)
            ) {
              u.pv -= item.damage;
              showFloatingText(u, `-${item.damage}`, 'pv');
            }
          });
          updateBluePanel(units.blue);
          mountUnit(units.red);
          mountUnit(units.blue);
          checkGameOver();
        }
      } else if (
        enemy.pos.row === r &&
        enemy.pos.col === c &&
        active.pa >= item.paCost
      ) {
        active.pa -= item.paCost;
        enemy.pv -= item.damage;
        await animateAttack(active, enemy, item.paCost, item.damage);
        updateBluePanel(units.blue);
        mountUnit(enemy);
        checkGameOver();
      }
      if (item.consumable) card.remove();
      slot.classList.remove('is-selected');
      ui.uiState.selectedItem = null;
      clearItemAlcance();
      // Após usar o item, reexibe alcance de movimento caso haja PM
      if (active.allow) showReachableFor(active);
      return;
    }
    if (ui.uiState.socoSelecionado && cell.classList.contains('attackable')) {
      const enemy = getInactive();
      if (enemy.pos.row === r && enemy.pos.col === c && active.pa >= 3) {
        const paCost = 3;
        const damage = 2;
        active.pa -= paCost;
        enemy.pv -= damage;
        await animateAttack(active, enemy, paCost, damage);
        updateBluePanel(units.blue);
        mountUnit(enemy);
        checkGameOver();
      }
      ui.uiState.socoSelecionado = false;
      ui.uiState.socoSlot.classList.remove('is-selected');
      clearSocoAlcance();
       // Após atacar, reexibe alcance de movimento caso haja PM
      if (active.allow) showReachableFor(active);
      return;
    }

    if (!cell.classList.contains('reachable')) return;

    const dist = computeReachable(active.pos, active.pm, active.allow);
    const path = buildPath(active.pos, { row: r, col: c }, dist, active.allow);
    if (!path) return;

    const cost = dist[r][c];
    if (!Number.isFinite(cost) || cost <= 0 || cost > active.pm) return;

    clearPathHighlight();
    active.pm -= cost;
    await moveUnitAlongPath(active, path, cost);
    updateBluePanel(units.blue);

    // Atualiza destaque conforme PM restante
    showReachableFor(active);
  });

  console.log('[Tabuleiro] Unidades inicializadas', units);
});
