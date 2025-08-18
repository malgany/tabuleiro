import { jest } from '@jest/globals';

const ui = await import('../js/ui.js');
const { passTurn, stopTurnTimer } = ui;
const { units, setActiveId } = await import('../js/units.js');
const { checkGameOver, gameOver, startBattle } = await import('../js/main.js');

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
    expect(overlay?.firstChild?.textContent).toBe('Derrota!');
    const btn = overlay?.querySelector('button');
    expect(btn?.textContent).toBe('Sair');
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
    expect(overlay?.firstChild?.textContent).toBe('Derrota!');
    const btn = overlay?.querySelector('button');
    expect(btn?.textContent).toBe('Sair');
  });

  test('startBattle removes chest and loot after victory', async () => {
    document.body.innerHTML = '<div class="board"></div>';
    gameOver('vitoria');
    jest.advanceTimersByTime(1000);
    const chest = document.querySelector('.chest');
    expect(chest).not.toBeNull();
    chest?.dispatchEvent(new Event('click'));
    expect(document.querySelector('.loot')).not.toBeNull();
    const p = startBattle();
    expect(document.querySelector('.chest')).toBeNull();
    expect(document.querySelector('.loot')).toBeNull();
    for (let i = 0; i < 3; i++) {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    }
    await p;
    jest.runOnlyPendingTimers();
  }, 10000);
});

