import {
  units,
  getActive,
  setActiveId,
  clearReachable,
  showReachableFor,
  showSocoAlcance as showSocoAlcanceUnits,
  clearSocoAlcance as clearSocoAlcanceUnits,
  showItemAlcance as showItemAlcanceUnits,
  clearItemAlcance as clearItemAlcanceUnits,
} from './units.js';
import { showOverlay, showPopup } from './overlay.js';
import { checkGameOver } from './main.js';
import { itemsConfig } from './config.js';

export const uiState = {
  socoSlot: null,
  socoSelecionado: false,
  selectedItem: null,
};

function showSocoAlcance() {
  const active = getActive();
  showSocoAlcanceUnits(active);
}

function clearSocoAlcance() {
  clearSocoAlcanceUnits();
}

function showItemAlcance(item) {
  const active = getActive();
  showItemAlcanceUnits(active, item);
}

function clearItemAlcance() {
  clearItemAlcanceUnits();
}

let bluePanelRefs = null;

export function updateBluePanel(state) {
  if (!bluePanelRefs) return;
  bluePanelRefs.pv.textContent = `${state.pv}`;
  bluePanelRefs.maxPv.textContent = `${state.maxPv}`;
  bluePanelRefs.pa.textContent = `${state.pa}`;
  bluePanelRefs.pm.textContent = `${state.pm}`;
}

export function recalculatePvBonus() {
  const slots = document.querySelectorAll('.turn-panel .slot');
  const ids = Array.from(slots)
    .slice(1)
    .map(slot => slot.querySelector('.card-item')?.dataset.itemId)
    .filter(Boolean);
  let bonus = 0;
  ids.forEach(id => {
    const item = itemsConfig.find(i => i.id === id);
    if (item?.pvBonus && !item.consumable) bonus += item.pvBonus;
  });
  const prevMax = units.blue.maxPv;
  units.blue.maxPv = 10 + bonus;
  const diff = units.blue.maxPv - prevMax;
  units.blue.pv = Math.min(units.blue.pv + diff, units.blue.maxPv);
  updateBluePanel(units.blue);
}

const TURN_SECONDS = 30;
let timeLeft = TURN_SECONDS;
let intervalId = null;
let passBtn = null;
let timerEl = null;

let shortcutsBound = false;

function handleShortcuts(ev) {
  if (ev.code === 'Space') {
    ev.preventDefault();
    passTurn();
    return;
  }
  const key = ev.key;
  if (!['1', '2', '3', '4'].includes(key)) return;
  if (getActive().id !== 'blue') return;
  const slots = document.querySelectorAll('.turn-panel .slot');
  const idx = Number(key) - 1;
  const slot = slots[idx];
  if (!slot) return;
  slot.click();
}

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

export function gameOver(result) {
  stopTurnTimer();
  if (result === 'derrota') {
    const overlay = showOverlay('Derrota!', { persist: true });
    const exitBtn = document.createElement('button');
    exitBtn.type = 'button';
    exitBtn.className = 'overlay-btn';
    exitBtn.textContent = 'Sair';
    overlay.appendChild(exitBtn);
    exitBtn.addEventListener(
      'click',
      () => {
        localStorage.clear();
        const board = document.getElementById('board-screen');
        const map = document.getElementById('map-screen');
        if (board) board.style.display = 'none';
        if (map) map.style.display = '';
        window.location.reload();
      },
      { once: true },
    );
  } else {
    const msg = result === 'vitoria' ? 'Vitória!' : 'Derrota!';
    showOverlay(msg);
  }
}

export function passTurn() {
  const finished = getActive();
  finished.pm = 3;
  finished.pa = 6;
  const next = finished.id === 'blue' ? 'red' : 'blue';
  setActiveId(next);
  showPopup(`Iniciando turno do jogador ${next}`, {
    corner: 'top-left',
    duration: 1000,
  });
  clearReachable();
  const selectedSlots = document.querySelectorAll('.turn-panel .slot.is-selected');
  const socoWasSelected = uiState.socoSlot?.classList.contains('is-selected');
  selectedSlots.forEach(slot => slot.classList.remove('is-selected'));
  uiState.selectedItem = null;
  clearItemAlcance();
  uiState.socoSelecionado = false;
  if (socoWasSelected) {
    clearSocoAlcance();
  }
  updateBluePanel(units.blue);
  // Destaca alcance de movimento da unidade ativa sem depender de hover
  const activeUnit = getActive();
  if (activeUnit.allow) showReachableFor(activeUnit);
  checkGameOver();
  if (units.blue.pv > 0 && units.red.pv > 0) {
    startTurnTimer();
  }
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
      uiState.selectedItem?.slot?.classList.remove('is-selected');
      uiState.selectedItem = null;
      clearItemAlcance();
      showSocoAlcance();
    } else {
      clearSocoAlcance();
    }
  });

  const metrics = document.createElement('div');
  metrics.className = 'metrics';
  metrics.innerHTML = `
      <div class="metric">❤️ <span class="v pv"></span> /<span class="v maxPv"></span></div>
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
    maxPv: metrics.querySelector('.maxPv'),
    pa: metrics.querySelector('.pa'),
    pm: metrics.querySelector('.pm'),
  };
  updateBluePanel(units.blue);

  passBtn.addEventListener('click', passTurn);

  if (!shortcutsBound) {
    document.addEventListener('keydown', handleShortcuts);
    shortcutsBound = true;
  }
}

function updateInventoryStorage() {
  const slots = document.querySelectorAll('.turn-panel .slot');
  const ids = Array.from(slots)
    .slice(1)
    .map(slot => slot.querySelector('.card-item')?.dataset.itemId)
    .filter(Boolean);
  localStorage.setItem('inventory', JSON.stringify(ids));
  recalculatePvBonus();
}

export function loadInventory() {
  const saved = JSON.parse(localStorage.getItem('inventory') || '[]');
  saved.forEach(id => {
    const item = itemsConfig.find(i => i.id === id);
    if (item) addItemCard(item);
  });
  recalculatePvBonus();
}

export function addItemCard(item) {
  const slots = document.querySelector('.turn-panel .slots');
  if (!slots) return;

  const card = document.createElement('div');
  card.className = 'card-item';
  card.textContent = item.icon || item.id;
  card.title = item.effect;
  card.dataset.itemId = item.id;

  if (item.type === 'attack') {
    const atk = document.createElement('span');
    atk.className = 'atk';
    atk.textContent = String(item.damage);
    card.appendChild(atk);
  } else if (item.pvBonus) {
    const hp = document.createElement('span');
    hp.className = 'hp';
    hp.textContent = `+${item.pvBonus}`;
    card.appendChild(hp);
  }

  const bindSlot = slot => {
    const onSlotClick = () => {
      if (!slot.contains(card)) return;
      if (getActive().id !== 'blue') return;
      if (item.type === 'attack') {
        if (uiState.selectedItem?.slot === slot) {
          slot.classList.remove('is-selected');
          uiState.selectedItem = null;
          clearItemAlcance();
        } else {
          uiState.selectedItem?.slot?.classList.remove('is-selected');
          uiState.socoSelecionado = false;
          uiState.socoSlot?.classList.remove('is-selected');
          clearSocoAlcance();
          uiState.selectedItem = { item, card, slot };
          slot.classList.add('is-selected');
          showItemAlcance(item);
        }
        return;
      }
      if (item.pvBonus && !item.consumable) {
        // Passive item, effect handled automatically
        return;
      }
      if (units.blue.pa < item.paCost) return;
      units.blue.pa -= item.paCost;
      updateBluePanel(units.blue);
      item.apply?.(units.blue);
      updateBluePanel(units.blue);
      if (item.consumable) {
        card.remove();
        slot.classList.remove('is-selected');
        slot.removeEventListener('click', onSlotClick);
        updateInventoryStorage();
      }
    };
    slot.addEventListener('click', onSlotClick);
  };

  const empty = Array.from(slots.children).find(s => s.children.length === 0);
  if (empty) {
    bindSlot(empty);
    empty.appendChild(card);
    updateInventoryStorage();
    return card;
  }

  // Inventory full: allow replacing an existing item
  const overlay = showOverlay('Inventário cheio! Selecione um item para substituir.', {
    persist: true,
  });
  overlay.style.pointerEvents = 'none';

  const slotArr = Array.from(slots.children);
  const onReplace = e => {
    const slot = e.currentTarget;
    if (slot === uiState.socoSlot) return;
    slot.innerHTML = '';
    bindSlot(slot);
    slot.appendChild(card);
    overlay.remove();
    slotArr.forEach(s => s.removeEventListener('click', onReplace));
    updateInventoryStorage();
  };

  slotArr.forEach(s => {
    if (s !== uiState.socoSlot) s.addEventListener('click', onReplace);
  });

  return card;
}

export function resetUI() {
  const slots = document.querySelectorAll('.turn-panel .slot');
  slots.forEach((slot, idx) => {
    if (idx === 0) {
      const soco = slot.querySelector('.card-soco');
      slot.innerHTML = '';
      if (soco) slot.appendChild(soco);
      slot.classList.remove('is-selected');
    } else {
      slot.innerHTML = '';
      slot.classList.remove('is-selected');
    }
  });
  uiState.socoSelecionado = false;
  uiState.selectedItem?.slot?.classList.remove('is-selected');
  uiState.selectedItem = null;
  clearItemAlcance();
  clearSocoAlcance();
  updateBluePanel(units.blue);
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

export { showOverlay, showPopup };
