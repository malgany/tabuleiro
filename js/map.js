const path = [
  { x: 80, y: 420 },
  { x: 80, y: 320 },
  { x: 80, y: 220 },
  { x: 80, y: 120 },
  { x: 80, y: 20 },
];

const stageKey = 'stage';
const playedKey = 'played';

const container = document.getElementById('map');
const mapScreen = document.getElementById('map-screen');
const boardScreen = document.getElementById('board-screen');
const playBtn = document.getElementById('play');

function getStage() {
  let stage = Number(localStorage.getItem(stageKey));
  if (Number.isNaN(stage)) stage = 0;
  if (localStorage.getItem(playedKey)) {
    stage = Number(localStorage.getItem(stageKey)) || stage;
    localStorage.removeItem(playedKey);
  }
  localStorage.setItem(stageKey, String(stage));
  return stage;
}

export function renderMap() {
  if (!container || !playBtn) return;

  const stage = getStage();

  container
    .querySelectorAll('.map-node, .map-connection')
    .forEach(el => el.remove());

  path.forEach((node, idx) => {
    const el = document.createElement('div');
    el.className = 'map-node';
    if (idx === stage) el.classList.add('current');
    else if (idx < stage) el.classList.add('past');
    el.style.left = `${node.x}px`;
    el.style.top = `${node.y}px`;
    container.appendChild(el);

    if (idx > 0) {
      const prev = path[idx - 1];
      const conn = document.createElement('div');
      conn.className = 'map-connection';
      conn.style.left = `${prev.x + 10}px`;
      conn.style.top = `${Math.min(prev.y, node.y) + 12}px`;
      conn.style.height = `${Math.abs(node.y - prev.y)}px`;
      container.appendChild(conn);
    }
  });

  const current = path[stage];
  if (current) {
    playBtn.style.left = `${current.x + 12}px`;
    playBtn.style.top = `${current.y + 40}px`;
    playBtn.style.transform = 'translate(-50%, 0)';
    playBtn.disabled = false;
    playBtn.style.display = '';
  } else {
    playBtn.disabled = true;
    playBtn.style.display = 'none';
  }
}

import { showOverlay, startBattle } from './main.js';

renderMap();

playBtn?.addEventListener('click', () => {
  const stage = Number(localStorage.getItem(stageKey)) || 0;
  localStorage.setItem(stageKey, String(stage));
  if (mapScreen) mapScreen.style.display = 'none';
  if (boardScreen) boardScreen.style.display = '';
  showOverlay();
  startBattle();
});

