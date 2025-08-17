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
} from './units.js';
import { initUI, updateBluePanel, initEnemyTooltip, uiState } from './ui.js';

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

  units.blue.el.addEventListener('mouseenter', () => {
    if (getActive().id !== 'blue') return;
    showReachableFor(units.blue);
  });
  units.red.el.addEventListener('mouseenter', () => {
    if (getActive().id !== 'red') return;
    showReachableFor(units.red);
  });

  grid.addEventListener('click', (ev) => {
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
        active.pa -= 3;
        enemy.pv -= 2;
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
    active.pos = { row: r, col: c };
    mountUnit(active);
    updateBluePanel(units.blue);

    // Atualiza destaque conforme PM restante
    showReachableFor(active);
  });

  console.log('[Tabuleiro] Unidades inicializadas', units);
});
