import { jest } from '@jest/globals';
const uiModule = await import('../js/ui.js');
const { passTurn, stopTurnTimer, startTurnTimer } = uiModule;
const { units, setActiveId } = await import('../js/units.js');
const { startBattle } = await import('../js/main.js');

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

  test('refills PM for the unit that ended its turn', () => {
    setActiveId('blue');
    units.blue.pm = 0;
    passTurn();
    expect(units.blue.pm).toBe(3);
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
});

describe('turn timer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    stopTurnTimer();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('automatically passes the turn when time runs out', () => {
    setActiveId('blue');
    units.blue.pa = 1;
    startTurnTimer();
    jest.advanceTimersByTime(30000);
    expect(units.blue.pa).toBe(6);
  });
});
