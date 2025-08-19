import { ROWS, COLS, rowColToIndex, isInside } from './board-utils.js';
import { computeReachable, buildPath } from './pathfinding.js';

let cards = [];
let board = null;

export const units = {
  blue: {
    id: 'blue',
    maxPv: 10,
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
    maxPv: 10,
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
  units.blue.maxPv = 10;
  units.blue.pv = units.blue.maxPv;
  units.blue.pm = 3;
  units.blue.pa = 6;
  units.red.pos = { row: 0, col: 0 };
  units.red.maxPv = 10;
  units.red.pv = units.red.maxPv;
  units.red.pm = 3;
  units.red.pa = 6;
  Object.values(units).forEach(u => {
    u.el?.remove();
    u.el = createUnitEl(u.id);
    u.el.addEventListener('mouseenter', () => {
      if (getActive().id !== u.id) return;
      showReachableFor(u);
    });
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

export function clearPathHighlight() {
  cards.forEach(c => c.classList.remove('path'));
}

export function clearReachable() {
  cards.forEach(c => {
    c.classList.remove('reachable');
    c.onmouseenter = null;
    c.onmouseleave = null;
  });
  clearPathHighlight();
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
        const card = cards[idx];
        card.classList.add('reachable');
        card.onmouseenter = () => {
          clearPathHighlight();
          const path = buildPath(unit.pos, { row: r, col: c }, dist, unit.allow);
          if (!path) return;
          path.slice(1).forEach(({ row: pr, col: pc }) => {
            const pIdx = rowColToIndex(pr, pc);
            cards[pIdx].classList.add('path');
          });
        };
        card.onmouseleave = clearPathHighlight;
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

export function clearItemAlcance() {
  cards.forEach(c => c.classList.remove('attackable'));
}

export function getTPatternCells(unit, enemy) {
  const { row, col } = unit.pos;
  // Determine orientation towards enemy or default to facing up/down based on unit id
  let dr = 0;
  let dc = 0;
  if (enemy) {
    const dRow = enemy.pos.row - row;
    const dCol = enemy.pos.col - col;
    if (Math.abs(dRow) >= Math.abs(dCol)) {
      dr = Math.sign(dRow) || (unit.id === 'red' ? 1 : -1);
    } else {
      dc = Math.sign(dCol) || (unit.id === 'red' ? 1 : -1);
    }
  } else {
    // Default orientation if no enemy provided
    dr = unit.id === 'red' ? 1 : -1;
  }

  const cells = [];
  for (let i = 1; i <= 3; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (isInside(r, c)) cells.push({ row: r, col: c });
  }

  const farRow = row + dr * 3;
  const farCol = col + dc * 3;
  if (dr !== 0) {
    const sides = [
      { row: farRow, col: farCol - 1 },
      { row: farRow, col: farCol + 1 },
    ];
    sides.forEach(pos => {
      if (isInside(pos.row, pos.col)) cells.push(pos);
    });
  } else {
    const sides = [
      { row: farRow - 1, col: farCol },
      { row: farRow + 1, col: farCol },
    ];
    sides.forEach(pos => {
      if (isInside(pos.row, pos.col)) cells.push(pos);
    });
  }

  return cells;
}

export function getCrossPatternCells(center) {
  const { row, col } = center;
  const deltas = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  const cells = [];
  deltas.forEach(([dr, dc]) => {
    const r = row + dr;
    const c = col + dc;
    if (isInside(r, c)) cells.push({ row: r, col: c });
  });
  return cells;
}

export function showItemAlcance(unit, item) {
  clearItemAlcance();
  if (item.pattern === 'T') {
    const cells = getTPatternCells(unit, getInactive());
    cells.forEach(({ row: r, col: c }) => {
      if (!isInside(r, c)) return;
      const idx = rowColToIndex(r, c);
      const card = cards[idx];
      if (card) card.classList.add('attackable');
    });
    return;
  }
  if (item.pattern === 'cross') {
    const { row, col } = unit.pos;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const d = Math.abs(r - row) + Math.abs(c - col);
        if (d <= item.range) {
          const idx = rowColToIndex(r, c);
          const card = cards[idx];
          if (card) card.classList.add('attackable');
        }
      }
    }
    return;
  }

  const { row, col } = unit.pos;
  const deltas = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  deltas.forEach(([dr, dc]) => {
    for (let i = 1; i <= item.range; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (!isInside(r, c)) break;
      const idx = rowColToIndex(r, c);
      const card = cards[idx];
      if (card) card.classList.add('attackable');
    }
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
