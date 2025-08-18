import { ROWS, COLS, rowColToIndex, isInside } from './board-utils.js';
import { computeReachable } from './pathfinding.js';

let cards = [];
let board = null;

export const units = {
  blue: {
    id: 'blue',
    pv: 10,
    pm: 3,
    pa: 6,
    pos: { row: 5, col: 3 },
    x: 0,
    y: 0,
    allow: null,
    el: null,
  },
  red: {
    id: 'red',
    pv: 10,
    pm: 3,
    pa: 6,
    pos: { row: 0, col: 0 },
    x: 0,
    y: 0,
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
  board = document.querySelector('.board') || document.body;
  units.blue.allow = isBlue;
  units.red.allow = isRed;
  units.blue.el = createUnitEl('blue');
  units.red.el = createUnitEl('red');
  mountUnit(units.blue);
  mountUnit(units.red);
  reflectActiveStyles();
}

export function resetUnits() {
  units.blue.pos = { row: 5, col: 3 };
  units.blue.pv = 10;
  units.blue.pm = 3;
  units.blue.pa = 6;
  units.red.pos = { row: 0, col: 0 };
  units.red.pv = 10;
  units.red.pm = 3;
  units.red.pa = 6;
  Object.values(units).forEach(u => {
    u.el?.remove();
    u.el = createUnitEl(u.id);
  });
  setActiveId('blue');
}

export function createUnitEl(id) {
  const el = document.createElement('div');
  el.className = `unit unit-${id}`;
  el.title = 'Unidade (hover p/ alcance, clique em verde p/ mover)';
  return el;
}

export function getCoords(row, col) {
  const idx = rowColToIndex(row, col);
  const host = cards[idx];
  if (!host || !board) return { x: 0, y: 0, size: 0 };
  const boardRect = board.getBoundingClientRect();
  const rect = host.getBoundingClientRect();
  const x = rect.left - boardRect.left + rect.width / 2;
  const y = rect.top - boardRect.top + rect.height / 2;
  const size = rect.width * 0.6;
  return { x, y, size };
}

export function mountUnit(unit) {
  if (!board) return;
  const { x, y, size } = getCoords(unit.pos.row, unit.pos.col);
  unit.x = x;
  unit.y = y;
  unit.el.style.width = `${size}px`;
  unit.el.style.height = `${size}px`;
  unit.el.style.left = `${x}px`;
  unit.el.style.top = `${y}px`;
  unit.el.style.transform = 'translate(-50%, -50%)';
  unit.el.dataset.row = String(unit.pos.row);
  unit.el.dataset.col = String(unit.pos.col);
  if (unit.el.parentElement !== board) board.appendChild(unit.el);
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

export function showFloatingText(target, text, className = '') {
  const el = target?.el ?? target;
  if (!el) return;
  const span = document.createElement('span');
  span.className = `float-text${className ? ` ${className}` : ''}`;
  span.textContent = text;
  el.appendChild(span);
  span.addEventListener(
    'animationend',
    () => {
      span.remove();
    },
    { once: true }
  );
}
