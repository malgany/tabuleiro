import { passTurn, stopTurnTimer } from '../js/ui.js';
import { units, setActiveId } from '../js/units.js';

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

