import {
  units,
  getActive,
  setActiveId,
  clearReachable,
  showSocoAlcance as showSocoAlcanceUnits,
  clearSocoAlcance as clearSocoAlcanceUnits,
} from './units.js';

export const uiState = {
  socoSlot: null,
  socoSelecionado: false,
};

function showSocoAlcance() {
  const active = getActive();
  showSocoAlcanceUnits(active);
}

function clearSocoAlcance() {
  clearSocoAlcanceUnits();
}

let bluePanelRefs = null;

export function updateBluePanel(state) {
  if (!bluePanelRefs) return;
  bluePanelRefs.pv.textContent = `${state.pv}`;
  bluePanelRefs.pa.textContent = `${state.pa}`;
  bluePanelRefs.pm.textContent = `${state.pm}`;
}

const TURN_SECONDS = 30;
let timeLeft = TURN_SECONDS;
let intervalId = null;
let passBtn = null;
let timerEl = null;

function updatePassButton() {
  if (!passBtn || !timerEl) return;
  passBtn.textContent = 'Passar Vez';
  timerEl.textContent = `(${Math.max(0, timeLeft)}s)`;
}

export function startTurnTimer() {
  stopTurnTimer();
  timeLeft = TURN_SECONDS;
  updatePassButton();
  intervalId = setInterval(() => {
    timeLeft -= 1;
    updatePassButton();
    if (timeLeft <= 0) {
      passTurn();
    }
  }, 1000);
}

export function stopTurnTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function passTurn() {
  const finished = getActive();
  finished.pm = 3;
  finished.pa = 6;
  const next = finished.id === 'blue' ? 'red' : 'blue';
  setActiveId(next);
  clearReachable();
  updateBluePanel(units.blue);
  startTurnTimer();
}

export function initUI() {
  const panel = document.createElement('div');
  panel.className = 'turn-panel';

  const slots = document.createElement('div');
  slots.className = 'slots';
  for (let i = 0; i < 4; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slots.appendChild(slot);
  }

  const socoSlot = slots.children[0];
  uiState.socoSlot = socoSlot;
  const cardSoco = document.createElement('div');
  cardSoco.className = 'card-soco';
  cardSoco.textContent = '👊';
  const atk = document.createElement('span');
  atk.className = 'atk';
  atk.textContent = '2';
  cardSoco.appendChild(atk);
  socoSlot.appendChild(cardSoco);
  socoSlot.addEventListener('click', () => {
    if (getActive().id !== 'blue') return;
    uiState.socoSelecionado = !uiState.socoSelecionado;
    socoSlot.classList.toggle('is-selected', uiState.socoSelecionado);
    if (uiState.socoSelecionado) {
      showSocoAlcance();
    } else {
      clearSocoAlcance();
    }
  });

  const metrics = document.createElement('div');
  metrics.className = 'metrics';
  metrics.innerHTML = `
      <div class="metric">❤️ <span class="v pv"></span> /10</div>
      <div class="metric">⭐ <span class="v pa"></span></div>
      <div class="metric">🥾 <span class="v pm"></span></div>
    `;

  passBtn = document.createElement('button');
  passBtn.className = 'pass-btn';
  passBtn.type = 'button';

  timerEl = document.createElement('span');
  timerEl.className = 'turn-timer';

  panel.appendChild(slots);
  panel.appendChild(metrics);
  panel.appendChild(passBtn);
  panel.appendChild(timerEl);
  const page = document.querySelector('.page');
  if (page) {
    page.appendChild(panel);
  }

  bluePanelRefs = {
    pv: metrics.querySelector('.pv'),
    pa: metrics.querySelector('.pa'),
    pm: metrics.querySelector('.pm'),
  };
  updateBluePanel(units.blue);

  passBtn.addEventListener('click', passTurn);
}

export function initEnemyTooltip() {
  const enemyTooltip = document.createElement('div');
  enemyTooltip.className = 'enemy-tooltip';
  enemyTooltip.style.display = 'none';
  document.body.appendChild(enemyTooltip);

  const enemy = units.red;
  enemy.el.addEventListener('mouseenter', () => {
    enemyTooltip.innerHTML = `PV: ${enemy.pv}<br>PA: ${enemy.pa}<br>PM: ${enemy.pm}`;
    const rect = enemy.el.getBoundingClientRect();
    enemyTooltip.style.left = `${rect.right + 8 + window.scrollX}px`;
    enemyTooltip.style.top = `${rect.top + window.scrollY}px`;
    enemyTooltip.style.display = 'block';
  });

  enemy.el.addEventListener('mouseleave', () => {
    enemyTooltip.style.display = 'none';
  });
}
