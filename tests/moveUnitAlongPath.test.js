import { jest } from '@jest/globals';
import { ROWS, COLS } from '../js/board-utils.js';
const unitsModule = await import('../js/units.js');
const { moveUnitAlongPath } = await import('../js/main.js');

describe('moveUnitAlongPath', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = '';
  });

  test('updates unit position and handles a single transition', async () => {
    const cards = Array.from({ length: ROWS * COLS }, () => document.createElement('div'));
    cards[5].getBoundingClientRect = () => ({
      left: 10,
      top: 20,
      width: 0,
      height: 0,
      right: 10,
      bottom: 20,
    });
    unitsModule.initUnits(cards, () => true, () => true);

    const unit = {
      pos: { row: 0, col: 0 },
      x: 0,
      y: 0,
      el: document.createElement('div'),
    };
    document.body.appendChild(unit.el);

    const addSpy = jest.spyOn(unit.el, 'addEventListener');
    const path = [
      { row: 0, col: 0 },
      { row: 1, col: 1 },
    ];
    const promise = moveUnitAlongPath(unit, path, 1);
    unit.el.dispatchEvent(new Event('transitionend'));
    await promise;

    expect(unit.pos).toEqual({ row: 1, col: 1 });
    expect(unit.x).toBe(10);
    expect(unit.y).toBe(20);
    expect(unit.el.style.left).toBe('10px');
    expect(unit.el.style.top).toBe('20px');
    expect(unit.el.style.transform).toBe('translate(-50%, -50%)');

    const spans = unit.el.querySelectorAll('.float-text.pm');
    expect(spans).toHaveLength(1);
    expect(spans[0].textContent).toBe('-1');
    expect(addSpy).toHaveBeenCalledWith('transitionend', expect.any(Function), { once: true });

    unit.el.dispatchEvent(new Event('transitionend'));
    expect(unit.el.querySelectorAll('.float-text.pm')).toHaveLength(1);
  });
});

