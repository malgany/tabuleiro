const path = [
  { x: 80, y: 420 },
  { x: 80, y: 320 },
  { x: 80, y: 220 },
  { x: 80, y: 120 },
  { x: 80, y: 20 },
];

const stageKey = 'stage';
const playedKey = 'played';

let stage = Number(localStorage.getItem(stageKey));
if (Number.isNaN(stage)) {
  stage = 0;
}

if (localStorage.getItem(playedKey)) {
  stage = Number(localStorage.getItem(stageKey)) || stage;
  localStorage.removeItem(playedKey);
}

localStorage.setItem(stageKey, stage);

const container = document.getElementById('map');
const mapScreen = document.getElementById('map-screen');
const boardScreen = document.getElementById('board-screen');

path.forEach((node, idx) => {
  const el = document.createElement('div');
  el.className = 'map-node' + (idx === stage ? ' current' : '');
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

import { showOverlay, startBattle } from './main.js';

const playBtn = document.getElementById('play');
const current = path[stage];
if (current) {
  playBtn.style.left = `${current.x + 40}px`;
  playBtn.style.top = `${current.y - 7}px`;
} else {
  playBtn.disabled = true;
  playBtn.style.display = 'none';
}

playBtn.addEventListener('click', () => {
  localStorage.setItem(stageKey, stage);
  if (mapScreen) mapScreen.style.display = 'none';
  if (boardScreen) boardScreen.style.display = '';
  showOverlay();
  startBattle();
});
