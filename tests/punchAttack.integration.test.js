import { jest } from '@jest/globals';
import { ROWS, COLS } from '../js/board-utils.js';

let units;
let ui;

beforeEach(async () => {
  jest.useFakeTimers();
  jest.resetModules();
  document.body.innerHTML = '<div class="page"><div class="board"><div class="grid"></div></div></div>';
  const grid = document.querySelector('.grid');
  for (let i = 0; i < ROWS * COLS; i++) {
    const card = document.createElement('div');
    card.className = `card ${i < (ROWS * COLS) / 2 ? 'red' : 'blue'}`;
    grid.appendChild(card);
  }
  units = await import('../js/units.js');
  ui = await import('../js/ui.js');
  await import('../js/main.js');
  document.dispatchEvent(new Event('DOMContentLoaded'));

  units.setActiveId('blue');
  units.units.blue.pos = { row: 2, col: 2 };
  units.units.red.pos = { row: 2, col: 3 };
  units.mountUnit(units.units.blue);
  units.mountUnit(units.units.red);
});

afterEach(() => {
  ui.stopTurnTimer();
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  document.body.innerHTML = '';
});

test('punch attack updates PV/PA and renders floating text', async () => {
  ui.uiState.socoSlot.click();
  const enemyCard = document.querySelector(`.card[data-row="${units.units.red.pos.row}"][data-col="${units.units.red.pos.col}"]`);
  expect(enemyCard?.classList.contains('attackable')).toBe(true);

  enemyCard.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  jest.advanceTimersByTime(600);
  await Promise.resolve();

  expect(units.units.blue.pa).toBe(3);
  expect(units.units.red.pv).toBe(8);

  const paText = units.units.blue.el.querySelector('.float-text.pa');
  const pvText = units.units.red.el.querySelector('.float-text.pv');
  expect(paText?.textContent).toBe('-3');
  expect(pvText?.textContent).toBe('-2');
});

