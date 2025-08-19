import { jest } from '@jest/globals';
const {
  passTurn,
  stopTurnTimer,
  startTurnTimer,
  initUI,
  addItemCard,
  uiState,
  resetUI,
  loadInventory,
} = await import('../js/ui.js');
const { units, setActiveId, getActive } = await import('../js/units.js');
const { startBattle, gameOver } = await import('../js/main.js');
const { itemsConfig } = await import('../js/config.js');

describe('passTurn', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    stopTurnTimer();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.body.innerHTML = '';
    localStorage.clear();
  });

  test('refills PA for the unit that ended its turn', () => {
    setActiveId('blue');
    units.blue.pa = 1;
    passTurn();
    expect(units.blue.pa).toBe(6);
  });

  test('refills PA for the opposing unit as well', () => {
    setActiveId('red');
    units.red.pa = 2;
    passTurn();
    expect(units.red.pa).toBe(6);
  });

  test('displays popup when passing the turn', () => {
    setActiveId('blue');
    passTurn();
    const popup = document.querySelector('.popup');
    expect(popup).not.toBeNull();
    expect(popup.textContent).toBe('Iniciando turno do jogador red');
    stopTurnTimer();
    jest.advanceTimersByTime(1000);
    jest.advanceTimersByTime(300);
    expect(document.querySelector('.popup')).toBeNull();
  });
});

describe('startBattle', () => {
  afterEach(() => {
    stopTurnTimer();
    document.body.innerHTML = '';
    localStorage.clear();
  });

  test('timer starts only after countdown', async () => {
    const spy = jest.spyOn(global, 'setInterval');
    startBattle();
    expect(spy).not.toHaveBeenCalled();
    await new Promise(r => setTimeout(r, 3100));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  }, 10000);

  test('displays popup for blue turn at top-left', async () => {
    startBattle();
    await new Promise(r => setTimeout(r, 3100));
    const popup = document.querySelector('.popup');
    expect(popup).not.toBeNull();
    expect(popup.textContent).toBe('Iniciando turno do jogador azul');
    expect(document.querySelector('.popup-container.top-left')).not.toBeNull();
  }, 10000);

  test('startBattle resets UI after game over', async () => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div class="page"></div>';
    initUI();
    addItemCard({ id: 'x', icon: 'x', effect: '', consumable: true });
    uiState.socoSlot.classList.add('is-selected');
    uiState.socoSelecionado = true;
    gameOver('vitoria');
    jest.advanceTimersByTime(1000);
    const p = startBattle();
    const slots = document.querySelectorAll('.turn-panel .slot');
    expect(slots[0].children.length).toBe(1);
    expect(slots[0].classList.contains('is-selected')).toBe(false);
    expect(slots[1].children.length).toBe(0);
    for (let i = 0; i < 3; i++) {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    }
    await p;
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  }, 10000);
});

describe('addItemCard', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    units.blue.maxPv = 10;
    units.blue.pv = 10;
    units.blue.pa = 6;
    units.blue.pm = 3;
  });

  test('using heal item subtracts PA cost once', () => {
    document.body.innerHTML = '<div class="page"></div>';
    initUI();
    units.blue.pa = 6;
    units.blue.pv = 8;
    const heart = itemsConfig.find(i => i.id === 'vida+2');
    addItemCard(heart);
    const card = document.querySelector('.card-item');
    card.click();
    expect(units.blue.pa).toBe(5);
    expect(units.blue.pv).toBe(10);
    expect(document.querySelector('.card-item')).toBeNull();
  });

  test('attack items display their damage value', () => {
    document.body.innerHTML = '<div class="page"></div>';
    initUI();
    const hammer = itemsConfig.find(i => i.id === 'martelo');
    addItemCard(hammer);
    const card = document.querySelector('.card-item');
    const atk = card.querySelector('.atk');
    expect(atk).not.toBeNull();
    expect(atk.textContent).toBe(String(hammer.damage));
  });

  test('defensive items display life bonus in red', () => {
    document.body.innerHTML = '<div class="page"></div>';
    initUI();
    const shield = itemsConfig.find(i => i.id === 'escudo');
    addItemCard(shield);
    const card = document.querySelector('.card-item');
    const hp = card.querySelector('.hp');
    expect(hp).not.toBeNull();
    expect(hp.textContent).toBe(`+${shield.pvBonus}`);
  });

  test('selecting an attack item highlights its slot', () => {
    document.body.innerHTML = '<div class="page"></div>';
    initUI();
    const sword = itemsConfig.find(i => i.id === 'espada');
    addItemCard(sword);
    const slot = document.querySelector('.turn-panel .slot:nth-child(2)');
    slot?.dispatchEvent(new Event('click'));
    expect(slot?.classList.contains('is-selected')).toBe(true);
  });

  test('shield item passively increases PV and max PV without being consumed', () => {
    document.body.innerHTML = '<div class="page"></div>';
    initUI();
    units.blue.pv = 10;
    units.blue.maxPv = 10;
    const shield = itemsConfig.find(i => i.id === 'escudo');
    addItemCard(shield);
    expect(units.blue.maxPv).toBe(10 + shield.pvBonus);
    expect(units.blue.pv).toBe(10 + shield.pvBonus);
    const card = document.querySelector('.card-item');
    card.click();
    expect(units.blue.maxPv).toBe(10 + shield.pvBonus);
    expect(units.blue.pv).toBe(10 + shield.pvBonus);
    expect(document.querySelector('.card-item')).not.toBeNull();
  });
});

describe('inventory management', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '<div class="page"></div>';
    initUI();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  test('selected loot is stored in first empty slot and persists', () => {
    const heart = itemsConfig.find(i => i.id === 'vida+2');
    addItemCard(heart);
    expect(JSON.parse(localStorage.getItem('inventory'))).toEqual(['vida+2']);
    resetUI();
    loadInventory();
    const card = document.querySelector('.slot:nth-child(2) .card-item');
    expect(card).not.toBeNull();
    expect(card.dataset.itemId).toBe('vida+2');
  });

  test('shows replace interface when slots are full', () => {
    const items = itemsConfig.slice(0, 4);
    items.slice(0, 3).forEach(it => addItemCard(it));
    addItemCard(items[3]);
    const overlay = document.querySelector('.overlay');
    expect(overlay).not.toBeNull();
    const slots = document.querySelectorAll('.turn-panel .slot');
    slots[2].click();
    expect(document.querySelector('.overlay')).toBeNull();
    const card = slots[2].querySelector('.card-item');
    expect(card.dataset.itemId).toBe(items[3].id);
  });
});

describe('keyboard shortcuts', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = '<div class="page"></div>';
    initUI();
  });

  afterEach(() => {
    stopTurnTimer();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.body.innerHTML = '';
    uiState.socoSelecionado = false;
    uiState.selectedItem = null;
  });

  test('spacebar passes the turn', () => {
    setActiveId('blue');
    const evt = new KeyboardEvent('keydown', { code: 'Space' });
    document.dispatchEvent(evt);
    expect(getActive().id).toBe('red');
  });

  test('number keys select corresponding slots for blue turn', () => {
    setActiveId('blue');
    const sword = itemsConfig.find(i => i.id === 'espada');
    addItemCard(sword);
    const hammer = itemsConfig.find(i => i.id === 'martelo');
    addItemCard(hammer);
    const slots = document.querySelectorAll('.turn-panel .slot');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    expect(slots[0].classList.contains('is-selected')).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '3' }));
    expect(slots[0].classList.contains('is-selected')).toBe(false);
    expect(slots[2].classList.contains('is-selected')).toBe(true);
    expect(uiState.selectedItem?.item).toBe(hammer);
    expect(uiState.selectedItem?.slot).toBe(slots[2]);
  });

  test('number keys ignored when it is not blue turn', () => {
    setActiveId('red');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    expect(uiState.socoSelecionado).toBe(false);
  });
});
