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
    jest.restoreAllMocks();
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

  test('loot items have effect as title attribute', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.2)
      .mockReturnValueOnce(0.4);
    gameOver('vitoria');
    jest.advanceTimersByTime(1000);
    document.querySelector('.chest')?.dispatchEvent(new Event('click'));
    const items = Array.from(document.querySelectorAll('.loot-item'));
    expect(items.map(i => i.title)).toEqual([
      'Cura 2 PV',
      'Aumenta ataque em 3',
      'Aumenta ataque em 4',
    ]);
  });

  test('selecting a consumable item applies effect and advances stage', () => {
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
    const slots = document.querySelectorAll('.slot');
    expect(slots[1].children.length).toBe(0);
  });

  test('selecting a usable item stores it in a slot and can be used later', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.2);
    gameOver('vitoria');
    jest.advanceTimersByTime(1000);
    document.querySelector('.chest')?.dispatchEvent(new Event('click'));
    const lootItem = document.querySelector('.loot-item');
    lootItem?.dispatchEvent(new Event('click'));

    const slots = document.querySelectorAll('.slot');
    const card = slots[1].firstElementChild;
    expect(card?.textContent).toBe('🗡️');
    expect(units.blue.attack).toBeUndefined();

    card?.dispatchEvent(new Event('click'));
    expect(units.blue.attack).toBe(3);
    // sword is not consumable, so card remains
    expect(slots[1].children.length).toBe(1);
  });

  test('using a consumable card removes it from the slot', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.55);
    gameOver('vitoria');
    jest.advanceTimersByTime(1000);
    document.querySelector('.chest')?.dispatchEvent(new Event('click'));
    const lootItem = document.querySelector('.loot-item');
    lootItem?.dispatchEvent(new Event('click'));

    const slots = document.querySelectorAll('.slot');
    const card = slots[1].firstElementChild;
    expect(card?.textContent).toBe('💣');

    units.blue.pv = 10;
    card?.dispatchEvent(new Event('click'));
    expect(units.blue.pv).toBe(5);
    expect(slots[1].children.length).toBe(0);
  });
});
