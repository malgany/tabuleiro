describe('map progression', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = `
      <div id="map-screen">
        <div class="map-container" id="map"></div>
        <button id="play"></button>
      </div>
      <div id="board-screen"></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('advances to next node after victory', async () => {
    localStorage.setItem('stage', '1');
    localStorage.setItem('played', 'true');
    await import('../js/main.js');
    const nodes = document.querySelectorAll('.map-node');
    const currentIndex = Array.from(nodes).findIndex(n =>
      n.classList.contains('current'),
    );
    expect(currentIndex).toBe(1);
    expect(localStorage.getItem('played')).toBeNull();
  });
});
