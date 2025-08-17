import { jest } from '@jest/globals';

const { passTurn, stopTurnTimer, startTurnTimer } = await import('../js/ui.js');
const { units, setActiveId } = await import('../js/units.js');
const { startBattle } = await import('../js/main.js');

describe('passTurn', () => {
  afterEach(() => {
    stopTurnTimer();
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
});

describe('startBattle', () => {
  afterEach(() => {
    stopTurnTimer();
  });

  test('timer starts only after countdown', async () => {
    const spy = jest.spyOn(global, 'setInterval');
    startBattle();
    expect(spy).not.toHaveBeenCalled();
    await new Promise(r => setTimeout(r, 3100));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  }, 10000);
});
