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
  getCoords,
} from './units.js';

import * as ui from './ui.js';

const { initUI, updateBluePanel, initEnemyTooltip, startTurnTimer } = ui;
import { getRandomItems } from './config.js';
import { showOverlay, showPopup } from './overlay.js';
import { renderMap } from './map.js';

export function checkGameOver() {
  if (units.blue.pv <= 0) ui.gameOver('derrota');
  else if (units.red.pv <= 0) gameOver('vitoria');
}

export async function startBattle() {
  // Recalcula a posição das unidades após o tabuleiro ficar visível. Caso os
  // elementos sejam montados enquanto o tabuleiro está oculto (`display: none`),
  // `getBoundingClientRect` retorna dimensões zero e as unidades desaparecem.
  // Montá-las novamente garante que largura, altura e posição sejam atualizadas
  // corretamente quando a batalha inicia.
  mountUnit(units.blue);
  mountUnit(units.red);

  const overlay = showOverlay('Desafio contra vermelho', { persist: true });
  for (let i = 3; i > 0; i--) {
    overlay.textContent = String(i);
    await new Promise(r => setTimeout(r, 1000));
  }
  overlay.classList.add('fade-out');
  setTimeout(() => overlay.remove(), 300);
  startTurnTimer();
  showPopup('Iniciando turno do jogador azul', {
    corner: 'top-left',
  });
}

export async function moveUnitAlongPath(unit, path, cost) {
  if (path.length < 2) {
    showFloatingText(unit, `-${cost}`, 'pm');
    return;
  }
  const dest = path[path.length - 1];
  const { x: endX, y: endY } = getCoords(dest.row, dest.col);
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

  unit.pos = dest;
  unit.x = endX;
  unit.y = endY;
  unit.el.dataset.row = String(dest.row);
  unit.el.dataset.col = String(dest.col);

  // Temporarily disable transform transitions to avoid a second animation
  const el = unit.el;
  const prevTransition = el.style.transition;
  el.style.transition = 'none';
  el.style.left = `${endX}px`;
  el.style.top = `${endY}px`;
  el.style.transform = 'translate(-50%, -50%)';
  // Force reflow so the transition reset takes effect
  void el.offsetWidth;
  el.style.transition = prevTransition;

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

          // When the player chooses an item we either consume it immediately or
          // move it to an inventory slot, then transition back to the map
          // screen advancing the stage.
          el.addEventListener(
            'click',
            () => {
              if (it.consumable && !it.usable) {
                it.apply?.(units.blue);
                updateBluePanel(units.blue);
              } else if (it.usable) {
                ui.addItemCard(it);
              }

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
              renderMap();
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
      return;
    }

    if (!cell.classList.contains('reachable')) return;

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
