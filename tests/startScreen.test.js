import { jest } from '@jest/globals';

describe('start screen', () => {
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    document.body.innerHTML = `
      <div id="start-screen">
        <button id="new-game"></button>
        <button id="continue-game"></button>
      </div>
      <div id="map-screen" style="display:none">
        <div class="map-container" id="map"></div>
        <button id="play"></button>
      </div>
      <div id="board-screen"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('exibe tela inicial ao carregar', async () => {
    await import('../js/main.js');
    expect(document.getElementById('start-screen').style.display).toBe('');
    expect(document.getElementById('map-screen').style.display).toBe('none');
    expect(document.getElementById('board-screen').style.display).toBe('none');
  });

  test('starts a new game clearing storage', async () => {
    localStorage.setItem('stage', '2');
    localStorage.setItem('foo', 'bar');
    await import('../js/main.js');
    document.getElementById('new-game').click();
    expect(localStorage.getItem('foo')).toBeNull();
    expect(localStorage.getItem('stage')).toBe('0');
    expect(document.getElementById('start-screen').style.display).toBe('none');
    expect(document.getElementById('map-screen').style.display).toBe('');
  });

  test('continues existing game without clearing storage', async () => {
    localStorage.setItem('stage', '1');
    await import('../js/main.js');
    document.getElementById('continue-game').click();
    expect(localStorage.getItem('stage')).toBe('1');
    expect(document.getElementById('start-screen').style.display).toBe('none');
    expect(document.getElementById('map-screen').style.display).toBe('');
  });
});
