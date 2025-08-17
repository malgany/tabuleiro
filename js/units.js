import { ROWS, COLS, rowColToIndex, isInside } from './board-utils.js';
import { computeReachable } from './pathfinding.js';

let cards = [];

export const units = {
  blue: {
    id: 'blue',
    pv: 10,
    pm: 3,
    pa: 6,
    pos: { row: 5, col: 3 },
    allow: null,
    el: null,
  },
  red: {
    id: 'red',
    pv: 10,
    pm: 3,
    pa: 6,
    pos: { row: 0, col: 0 },
    allow: null,
    el: null,
  },
};

let activeId = 'blue';
export const getActive = () => units[activeId];
export const getInactive = () => units[activeId === 'blue' ? 'red' : 'blue'];
export function setActiveId(id) {
  activeId = id;
  reflectActiveStyles();
}

export function initUnits(cardEls, isBlue, isRed) {
  cards = cardEls;
  units.blue.allow = isBlue;
  units.red.allow = isRed;
  units.blue.el = createUnitEl('blue');
  units.red.el = createUnitEl('red');
  mountUnit(units.blue);
  mountUnit(units.red);
  reflectActiveStyles();
}

export function createUnitEl(id) {
  const el = document.createElement('div');
  el.className = `unit unit-${id}`;
  el.title = 'Unidade (hover p/ alcance, clique em verde p/ mover)';
  return el;
}

export function mountUnit(unit) {
  const idx = rowColToIndex(unit.pos.row, unit.pos.col);
  const host = cards[idx];
  if (!host) return;
  host.appendChild(unit.el);
}

export function reflectActiveStyles() {
  Object.values(units).forEach(u => {
    if (!u.el) return;
    if (u.id === activeId) u.el.classList.add('is-active');
    else u.el.classList.remove('is-active');
  });
}

export function clearReachable() {
  cards.forEach(c => c.classList.remove('reachable'));
}

export function showReachableFor(unit) {
  clearReachable();
  if (unit.pm <= 0) return;
  const dist = computeReachable(unit.pos, unit.pm, unit.allow);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!unit.allow(r, c)) continue;
      const d = dist[r][c];
      if (Number.isFinite(d) && d > 0 && d <= unit.pm) {
        const idx = rowColToIndex(r, c);
        cards[idx].classList.add('reachable');
      }
    }
  }
}

export function clearSocoAlcance() {
  cards.forEach(c => c.classList.remove('attackable'));
}

export function showSocoAlcance(unit) {
  clearSocoAlcance();
  const { row, col } = unit.pos;
  const deltas = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  deltas.forEach(([dr, dc]) => {
    const r = row + dr;
    const c = col + dc;
    if (!isInside(r, c)) return;
    const idx = rowColToIndex(r, c);
    const card = cards[idx];
    if (card) card.classList.add('attackable');
  });
}
