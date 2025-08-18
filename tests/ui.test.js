import { jest } from '@jest/globals';
const { passTurn, stopTurnTimer, startTurnTimer, initUI, addItemCard, uiState } = await import('../js/ui.js');
const { units, setActiveId } = await import('../js/units.js');
const { startBattle, gameOver } = await import('../js/main.js');

describe('passTurn', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    stopTurnTimer();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.body.innerHTML = '';
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
