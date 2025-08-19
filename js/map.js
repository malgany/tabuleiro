import { renderMap, startBattle } from './game.js';
import { showOverlay } from './overlay.js';

const mapScreen = document.getElementById('map-screen');
const boardScreen = document.getElementById('board-screen');
const playBtn = document.getElementById('play');
const startScreen = document.getElementById('start-screen');
const newBtn = document.getElementById('new-game');
const continueBtn = document.getElementById('continue-game');

function updateContinueButton() {
  if (continueBtn) continueBtn.disabled = !localStorage.getItem('stage');
}

function initStartScreen() {
  if (startScreen) startScreen.style.display = '';
  if (mapScreen) mapScreen.style.display = 'none';
  if (boardScreen) boardScreen.style.display = 'none';
  updateContinueButton();
}

initStartScreen();
renderMap();

playBtn?.addEventListener('click', () => {
  const stage = Number(localStorage.getItem('stage')) || 0;
  localStorage.setItem('stage', String(stage));
  if (mapScreen) mapScreen.style.display = 'none';
  if (boardScreen) boardScreen.style.display = '';
  showOverlay();
  startBattle();
});

newBtn?.addEventListener('click', () => {
  localStorage.clear();
  renderMap();
  if (startScreen) startScreen.style.display = 'none';
  if (mapScreen) mapScreen.style.display = '';
});

continueBtn?.addEventListener('click', () => {
  renderMap();
  if (startScreen) startScreen.style.display = 'none';
  if (mapScreen) mapScreen.style.display = '';
});
