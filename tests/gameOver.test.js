import { jest } from '@jest/globals';
const { gameOver } = await import('../js/main.js');
const { units } = await import('../js/units.js');
const ui = await import('../js/ui.js');
const { itemsConfig } = await import('../js/config.js');

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
      'Causa 3 de dano em T',
    ]);
  });

  test('selecting a consumable item stores it and advances stage', () => {
    // Ensure deterministic loot: pick the healing item
    jest.spyOn(Math, 'random').mockReturnValue(0);
    units.blue.pv = 8;
    gameOver('vitoria');
    jest.advanceTimersByTime(1000);
    document.querySelector('.chest')?.dispatchEvent(new Event('click'));
    const lootItem = document.querySelector('.loot-item');
    lootItem?.dispatchEvent(new Event('click'));
    expect(localStorage.getItem('stage')).toBe('1');
    const slots = document.querySelectorAll('.slot');
    expect(slots[1].children.length).toBe(1);
  });

  test('selecting a usable item stores it in a slot and can be used later', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.2);
    gameOver('vitoria');
    jest.advanceTimersByTime(1000);
    document.querySelector('.chest')?.dispatchEvent(new Event('click'));
    const lootItem = document.querySelector('.loot-item');
    lootItem?.dispatchEvent(new Event('click'));

    const slots = document.querySelectorAll('.slot');
    const slot = slots[1];
    const card = slot.firstElementChild;
    expect(card?.textContent).toBe('🗡️3');
    expect(units.blue.attack).toBeUndefined();

    // Clicking the slot toggles selection but does not change stats
    slot.dispatchEvent(new Event('click'));
    expect(units.blue.attack).toBeUndefined();
    expect(ui.uiState.selectedItem?.item.id).toBe('espada');

    // Deselecting keeps the card for later use
    slot.dispatchEvent(new Event('click'));
    expect(ui.uiState.selectedItem).toBeNull();
    expect(slots[1].children.length).toBe(1);
  });

  test('using a consumable card removes it from the slot', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.05);
    gameOver('vitoria');
    jest.advanceTimersByTime(1000);
    document.querySelector('.chest')?.dispatchEvent(new Event('click'));
    const lootItem = document.querySelector('.loot-item');
    lootItem?.dispatchEvent(new Event('click'));

    const slots = document.querySelectorAll('.slot');
    const slot = slots[1];
    const card = slot.firstElementChild;
    expect(card?.textContent).toBe('💖+2');

    units.blue.pv = 8;
    slot.dispatchEvent(new Event('click'));
    expect(units.blue.pv).toBe(10);
    expect(slots[1].children.length).toBe(0);
  });

  test('shield increases PV and maxPv passively without being consumed', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.8);
    units.blue.maxPv = 10;
    units.blue.pv = 10;
    gameOver('vitoria');
    jest.advanceTimersByTime(1000);
    document.querySelector('.chest')?.dispatchEvent(new Event('click'));
    const lootItem = document.querySelector('.loot-item');
    lootItem?.dispatchEvent(new Event('click'));

    const slots = document.querySelectorAll('.slot');
    expect(slots[1].children.length).toBe(1);
    expect(units.blue.maxPv).toBe(13);
    expect(units.blue.pv).toBe(13);

    const card = slots[1].firstElementChild;
    card?.dispatchEvent(new Event('click'));
    expect(units.blue.maxPv).toBe(13);
    expect(units.blue.pv).toBe(13);
    expect(slots[1].children.length).toBe(1);
  });

  test('requires replacing item before returning to map when inventory is full', () => {
    const items = itemsConfig.slice(0, 3);
    items.forEach(it => ui.addItemCard(it));

    gameOver('vitoria');
    jest.advanceTimersByTime(1000);
    document.querySelector('.chest')?.dispatchEvent(new Event('click'));
    const lootItem = document.querySelector('.loot-item');
    lootItem?.dispatchEvent(new Event('click'));

    expect(localStorage.getItem('stage')).toBeNull();
    const boardScreen = document.getElementById('board-screen');
    const mapScreen = document.getElementById('map-screen');
    expect(boardScreen?.style.display).not.toBe('none');
    expect(mapScreen?.style.display).toBe('none');
    const preReplaceOverlay = Array.from(document.querySelectorAll('.overlay')).some(o =>
      o.textContent.includes('Inventário cheio'),
    );
    expect(preReplaceOverlay).toBe(true);

    const slots = document.querySelectorAll('.turn-panel .slot');
    slots[2].dispatchEvent(new Event('click'));

    expect(localStorage.getItem('stage')).toBe('1');
    expect(boardScreen?.style.display).toBe('none');
    expect(mapScreen?.style.display).toBe('');
    const postReplaceOverlay = Array.from(document.querySelectorAll('.overlay')).some(o =>
      o.textContent.includes('Inventário cheio'),
    );
    expect(postReplaceOverlay).toBe(false);
  });
});
