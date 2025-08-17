import { jest } from '@jest/globals';
const { gameOver } = await import('../js/main.js');
const { units } = await import('../js/units.js');

describe('gameOver victory chest', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div class="board"></div>';
    units.red.el = document.createElement('div');
    units.red.el.className = 'unit unit-red';
    document.querySelector('.board').appendChild(units.red.el);
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  test('shows 3 items after clicking chest', () => {
    gameOver('vitoria');
    jest.advanceTimersByTime(1000);
    const chest = document.querySelector('.chest');
    expect(chest).not.toBeNull();
    chest.dispatchEvent(new Event('click'));
    const items = document.querySelectorAll('.loot-item');
    expect(items.length).toBe(3);
  });
});
