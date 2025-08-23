import { jest } from '@jest/globals';
import { ROWS, COLS } from '../js/board-utils.js';
import * as unitsModule from '../js/units.js';
import {
  units,
  initUnits,
  getActive,
  setActiveId,
  createUnitEl,
  showReachableFor,
  showSocoAlcance,
  showFloatingText,
  resetUnits,
} from '../js/units.js';

function createCards() {
  return Array.from({ length: ROWS * COLS }, () => document.createElement('div'));
}

describe('units module', () => {
  let cards;

  beforeEach(() => {
    document.body.innerHTML = '';
    cards = createCards();
    initUnits(cards, () => true, () => true);
    setActiveId('blue');
  });

  test('createUnitEl creates element with proper class and title', () => {
    const el = createUnitEl('test');
    expect(el.className).toBe('unit unit-test');
    expect(el.title).toContain('Unidade');
  });

  test('setActiveId switches active unit and updates styles', () => {
    expect(getActive().id).toBe('blue');
    expect(units.blue.el.classList.contains('is-active')).toBe(true);
    expect(units.red.el.classList.contains('is-active')).toBe(false);

    setActiveId('red');
    expect(getActive().id).toBe('red');
    expect(units.red.el.classList.contains('is-active')).toBe(true);
    expect(units.blue.el.classList.contains('is-active')).toBe(false);
  });

  test('showReachableFor highlights reachable tiles based on movement', () => {
    showReachableFor(units.blue);
    const reachable = cards
      .map((c, i) => (c.classList.contains('reachable') ? i : null))
      .filter(i => i !== null)
      .sort((a, b) => a - b);

    expect(reachable).toEqual([15, 18, 19, 21, 22]);
  });

  test('showSocoAlcance marks adjacent tiles as attackable', () => {
    showSocoAlcance(units.blue);
    const attackable = cards
      .map((c, i) => (c.classList.contains('attackable') ? i : null))
      .filter(i => i !== null)
      .sort((a, b) => a - b);

    expect(attackable).toEqual([19, 22]);
  });

  test('showFloatingText attaches and removes floating span', () => {
    const parent = document.createElement('div');
    showFloatingText(parent, 'Hi', 'test');
    const span = parent.querySelector('span.float-text.test');
    expect(span).not.toBeNull();
    expect(span.textContent).toBe('Hi');

    span.dispatchEvent(new Event('animationend'));
    expect(parent.querySelector('span.float-text.test')).toBeNull();
  });

  test('resetUnits reattaches hover listeners', () => {
    resetUnits();
    units.blue.el.dispatchEvent(new Event('mouseenter'));
    const hasReachable = cards.some(c => c.classList.contains('reachable'));
    expect(hasReachable).toBe(true);
  });
});

