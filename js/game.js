const path = [
  { x: 80, y: 420 },
  { x: 80, y: 320 },
  { x: 80, y: 220 },
  { x: 80, y: 120 },
  { x: 80, y: 20 },
];

const stageKey = 'stage';
const playedKey = 'played';

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
  const container = document.getElementById('map');
  const playBtn = document.getElementById('play');
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

import {
  units,
  mountUnit,
  showReachableFor,
  resetUnits,
} from './units.js';
import {
  resetUI,
  loadInventory,
  startTurnTimer,
} from './ui.js';
import { showOverlay, showPopup } from './overlay.js';

export async function startBattle() {
  document.querySelectorAll('.chest, .loot').forEach(el => el.remove());
  resetUnits();
  resetUI();
  loadInventory();
  // Recalcula a posição das unidades após o tabuleiro ficar visível. Caso os
  // elementos sejam montados enquanto o tabuleiro está oculto (`display: none`),
  // `getBoundingClientRect` retorna dimensões zero e as unidades desaparecem.
  // Montá-las novamente garante que largura, altura e posição sejam atualizadas
  // corretamente quando a batalha inicia.
  mountUnit(units.blue);
  mountUnit(units.red);

  const overlay = showOverlay('Desafio contra vermelho', { persist: true });
  for (let i = 3; i > 0; i--) {
    overlay.textContent = String(i);
    await new Promise(r => setTimeout(r, 1000));
  }
  overlay.classList.add('fade-out');
  setTimeout(() => overlay.remove(), 300);
  startTurnTimer();
  showPopup('Iniciando turno do jogador azul', {
    corner: 'top-left',
  });
  // Mostra casas alcançáveis para o jogador inicial sem exigir hover
  if (units.blue.allow) showReachableFor(units.blue);
}
