import { jest } from '@jest/globals';
import { passTurn, stopTurnTimer } from '../js/ui.js';
import { units, setActiveId } from '../js/units.js';

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

