import { jest } from '@jest/globals';

const ui = await import('../js/ui.js');
const { passTurn, stopTurnTimer } = ui;
const { units, setActiveId } = await import('../js/units.js');
const { checkGameOver } = await import('../js/main.js');

describe('game over logic', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    units.blue.pv = 10;
    units.red.pv = 10;
    setActiveId('blue');
  });

  afterEach(() => {
    stopTurnTimer();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  test('checkGameOver triggers victory overlay when red PV <= 0', () => {
    units.red.pv = 0;
    checkGameOver();
    const overlay = document.querySelector('.overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toBe('Vitória!');
  });

  test('checkGameOver triggers defeat overlay when blue PV <= 0', () => {
    units.blue.pv = 0;
    checkGameOver();
    const overlay = document.querySelector('.overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toBe('Derrota!');
  });

  test('passTurn checks for game over (victory)', () => {
    units.red.pv = 0;
    passTurn();
    const overlay = document.querySelector('.overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toBe('Vitória!');
  });

  test('passTurn checks for game over (defeat)', () => {
    units.blue.pv = 0;
    passTurn();
    const overlay = document.querySelector('.overlay');
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toBe('Derrota!');
  });
});

