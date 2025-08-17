import { jest } from '@jest/globals';
const { gameOver } = await import('../js/main.js');
const { units } = await import('../js/units.js');
const ui = await import('../js/ui.js');

describe('gameOver victory chest', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    document.body.innerHTML = `
      <div id="map-screen" style="display:none"></div>
      <div class="page" id="board-screen"><div class="board"></div></div>
    `;
    units.red.el = document.createElement('div');
    units.red.el.className = 'unit unit-red';
    document.querySelector('.board').appendChild(units.red.el);
    ui.initUI();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  test('overlay does not block chest interaction', () => {
    gameOver('vitoria');
    jest.advanceTimersByTime(1000);
    const overlay = document.querySelector('.overlay');
    expect(overlay).not.toBeNull();
    // After the chest appears the overlay should allow pointer events to pass
    // through so the player can click the chest.
    expect(overlay?.style.pointerEvents).toBe('none');
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

  test('selecting an item applies effect and advances stage', () => {
    // Ensure deterministic loot: pick the coffee item to restore PA
    jest.spyOn(Math, 'random').mockReturnValue(0.95);
    units.blue.pa = 6;
    gameOver('vitoria');
    jest.advanceTimersByTime(1000);
    document.querySelector('.chest')?.dispatchEvent(new Event('click'));
    const lootItem = document.querySelector('.loot-item');
    lootItem?.dispatchEvent(new Event('click'));
    expect(localStorage.getItem('stage')).toBe('1');
    const paEl = document.querySelector('.pa');
    expect(paEl?.textContent).toBe('8');
  });
});
