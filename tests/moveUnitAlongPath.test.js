import { jest } from '@jest/globals';

const getCoords = jest.fn((row, col) => ({ x: col * 10, y: row * 10 }));
const showFloatingText = jest.fn();

jest.unstable_mockModule('../js/units.js', () => ({
  units: {},
  initUnits: jest.fn(),
  getActive: jest.fn(),
  getInactive: jest.fn(),
  showReachableFor: jest.fn(),
  mountUnit: jest.fn(),
  clearSocoAlcance: jest.fn(),
  showFloatingText,
  getCoords,
  resetUnits: jest.fn(),
}));

jest.unstable_mockModule('../js/ui.js', () => ({
  initUI: jest.fn(),
  updateBluePanel: jest.fn(),
  initEnemyTooltip: jest.fn(),
  startTurnTimer: jest.fn(),
}));

jest.unstable_mockModule('../js/overlay.js', () => ({
  showOverlay: jest.fn(),
  showPopup: jest.fn(),
}));

jest.unstable_mockModule('../js/config.js', () => ({
  getRandomItems: jest.fn(),
}));

const { moveUnitAlongPath } = await import('../js/main.js');

test('moveUnitAlongPath snaps unit to destination without extra transition', async () => {
  const el = document.createElement('div');
  el.style.transition = 'transform 0.3s linear';
  let transitionCount = 0;
  el.addEventListener('transitionend', () => transitionCount++);

  const unit = { el, x: 0, y: 0, pos: { row: 0, col: 0 } };
  const path = [
    { row: 0, col: 0 },
    { row: 1, col: 2 },
  ];

  const promise = moveUnitAlongPath(unit, path, 1);
  // simulate end of movement transition
  el.dispatchEvent(new Event('transitionend'));
  await promise;

  expect(el.style.transform).toBe('translate(-50%, -50%)');
  expect(transitionCount).toBe(1);
});

