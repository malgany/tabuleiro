import { jest } from '@jest/globals';
import { ROWS, COLS } from '../js/board-utils.js';
import { units, setActiveId } from '../js/units.js';
import * as ui from '../js/ui.js';
import { moveUnitAlongPath } from '../js/main.js';

function setupBoard() {
  document.body.innerHTML = '<div class="page"><div class="board"><div class="grid"></div></div></div>';
  const grid = document.querySelector('.grid');
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const card = document.createElement('div');
      card.className = `card back ${r < ROWS / 2 ? 'red' : 'blue'}`;
      grid.appendChild(card);
    }
  }
}

describe('soco attack', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    setupBoard();
    units.blue.pos = { row: 1, col: 0 };
    units.red.pos = { row: 0, col: 0 };
    units.blue.pa = 6;
    units.red.pv = 10;
    setActiveId('blue');
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  test('clicking enemy unit consumes PA and deals damage', async () => {
    ui.uiState.socoSlot.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    units.red.el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
    await Promise.resolve();
    expect(units.red.pv).toBe(8);
    expect(units.blue.pa).toBe(3);
  });

  test('attack works after units have moved', async () => {
    let promise = moveUnitAlongPath(
      units.blue,
      [
        { row: 1, col: 0 },
        { row: 2, col: 0 },
      ],
      1,
    );
    units.blue.el.dispatchEvent(new Event('transitionend'));
    await promise;

    promise = moveUnitAlongPath(
      units.red,
      [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
      ],
      1,
    );
    units.red.el.dispatchEvent(new Event('transitionend'));
    await promise;

    ui.uiState.socoSlot.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    units.red.el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    jest.runAllTimers();
    await Promise.resolve();
    expect(units.red.pv).toBe(8);
    expect(units.blue.pa).toBe(3);
  });
});
