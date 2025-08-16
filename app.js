(() => {
  'use strict';

  const COLS = 4;
  const ROWS = 6;

  function indexToRowCol(index) {
    return { row: Math.floor(index / COLS), col: index % COLS };
  }

  function rowColToIndex(row, col) {
    return row * COLS + col;
  }

  function isInside(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLS;
  }

  let bluePanelRefs = null;
  function updateBluePanel(state) {
    if (!bluePanelRefs) return;
    bluePanelRefs.pv.textContent = `${state.pv}/10`;
    bluePanelRefs.pa.textContent = `${state.pa}`;
    bluePanelRefs.pm.textContent = `${state.pm}`;
  }

  function computeReachable(start, pm, isAllowed) {
    const deltas = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const dist = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));
    const queue = [];
    dist[start.row][start.col] = 0;
    queue.push(start);

    while (queue.length) {
      const cur = queue.shift();
      for (const [dr, dc] of deltas) {
        const nr = cur.row + dr;
        const nc = cur.col + dc;
        if (!isInside(nr, nc)) continue;
        if (!isAllowed(nr, nc)) continue; // respeita cor do lado
        const nd = dist[cur.row][cur.col] + 1;
        if (nd <= pm && nd < dist[nr][nc]) {
          dist[nr][nc] = nd;
          queue.push({ row: nr, col: nc });
        }
      }
    }

    return dist; // contém distâncias; Infinity significa inalcançável
  }

  function buildPath(from, to, dist, isAllowed) {
    // retrocede por vizinhos com distância decrescente
    const path = [];
    let cur = { ...to };
    if (!Number.isFinite(dist[to.row][to.col])) return null;

    while (!(cur.row === from.row && cur.col === from.col)) {
      path.push(cur);
      const neighbors = [
        { row: cur.row + 1, col: cur.col },
        { row: cur.row - 1, col: cur.col },
        { row: cur.row, col: cur.col + 1 },
        { row: cur.row, col: cur.col - 1 },
      ];
      let moved = false;
      for (const n of neighbors) {
        if (!isInside(n.row, n.col)) continue;
        if (!isAllowed(n.row, n.col)) continue;
        if (dist[n.row][n.col] === dist[cur.row][cur.col] - 1) {
          cur = n;
          moved = true;
          break;
        }
      }
      if (!moved) return null;
    }
    path.push(from);
    path.reverse();
    return path;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    if (!grid) return;

    const cards = Array.from(grid.children);
    // Indexa as células e define data attributes
    cards.forEach((el, i) => {
      const { row, col } = indexToRowCol(i);
      el.dataset.row = String(row);
      el.dataset.col = String(col);
      el.dataset.color = el.classList.contains('blue') ? 'blue' : 'red';
    });

    const isBlue = (r, c) => {
      const idx = rowColToIndex(r, c);
      const el = cards[idx];
      return el && el.dataset.color === 'blue';
    };
    const isRed = (r, c) => {
      const idx = rowColToIndex(r, c);
      const el = cards[idx];
      return el && el.dataset.color === 'red';
    };

    // Estado das unidades
    const units = {
      blue: {
        id: 'blue',
        pv: 10,
        pm: 3,
        pa: 3,
        pos: { row: 5, col: 3 },
        allow: isBlue,
        el: null,
      },
      red: {
        id: 'red',
        pv: 10,
        pm: 3,
        pa: 3,
        pos: { row: 0, col: 0 },
        allow: isRed,
        el: null,
      },
    };

    let activeId = 'blue';
    const getActive = () => units[activeId];
    const getInactive = () => units[activeId === 'blue' ? 'red' : 'blue'];

    updateBluePanel(units.blue);

    // Cria o elemento da unidade
    function createUnitEl(id) {
      const el = document.createElement('div');
      el.className = `unit unit-${id}`;
      el.title = 'Unidade (hover p/ alcance, clique em verde p/ mover)';
      return el;
    }

    function mountUnit(unit) {
      const idx = rowColToIndex(unit.pos.row, unit.pos.col);
      const host = cards[idx];
      if (!host) return;
      host.appendChild(unit.el);
    }

    // Instancia ambas as unidades
    units.blue.el = createUnitEl('blue');
    units.red.el = createUnitEl('red');

    const enemyTooltip = document.createElement('div');
    enemyTooltip.className = 'enemy-tooltip';
    enemyTooltip.style.display = 'none';
    document.body.appendChild(enemyTooltip);

    mountUnit(units.blue);
    mountUnit(units.red);

    function reflectActiveStyles() {
      Object.values(units).forEach(u => {
        if (!u.el) return;
        if (u.id === activeId) u.el.classList.add('is-active');
        else u.el.classList.remove('is-active');
      });
    }
    reflectActiveStyles();

    function clearReachable() {
      cards.forEach(c => c.classList.remove('reachable'));
    }

    function showReachableFor(unit) {
      clearReachable();
      if (unit.pm <= 0) return;
      const dist = computeReachable(unit.pos, unit.pm, unit.allow);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!unit.allow(r, c)) continue;
          const d = dist[r][c];
          if (Number.isFinite(d) && d > 0 && d <= unit.pm) {
            const idx = rowColToIndex(r, c);
            cards[idx].classList.add('reachable');
          }
        }
      }
    }

    // Exibe alcance quando o mouse entra na unidade ativa
    units.blue.el.addEventListener('mouseenter', () => {
      if (activeId !== 'blue') return;
      showReachableFor(units.blue);
    });
    units.red.el.addEventListener('mouseenter', () => {
      if (activeId !== 'red') return;
      showReachableFor(units.red);
    });

    units.red.el.addEventListener('mouseenter', ev => {
      enemyTooltip.innerHTML = `PV: ${units.red.pv}<br>PA: ${units.red.pa}<br>PM: ${units.red.pm}`;
      const rect = units.red.el.getBoundingClientRect();
      enemyTooltip.style.left = `${rect.right + 8 + window.scrollX}px`;
      enemyTooltip.style.top = `${rect.top + window.scrollY}px`;
      enemyTooltip.style.display = 'block';
    });

    units.red.el.addEventListener('mouseleave', () => {
      enemyTooltip.style.display = 'none';
    });

    // Clique para mover para uma célula alcançável
    grid.addEventListener('click', (ev) => {
      const target = ev.target;
      if (!(target instanceof HTMLElement)) return;
      const cell = target.closest('.card');
      if (!cell) return;
      if (!cell.classList.contains('reachable')) return;

      const r = Number(cell.dataset.row);
      const c = Number(cell.dataset.col);
      const active = getActive();
      const dist = computeReachable(active.pos, active.pm, active.allow);
      const path = buildPath(active.pos, { row: r, col: c }, dist, active.allow);
      if (!path) return;

      const cost = dist[r][c];
      if (!Number.isFinite(cost) || cost <= 0 || cost > active.pm) return;

      active.pm -= cost;
      active.pos = { row: r, col: c };
      mountUnit(active);
      updateBluePanel(units.blue);

      // Atualiza destaque conforme PM restante
      showReachableFor(active);
    });

    // --- Sistema de turnos ---
    const TURN_SECONDS = 30;
    let timeLeft = TURN_SECONDS;
    let intervalId = null;

    function startTurnTimer() {
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

    function stopTurnTimer() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    // Painel inferior com slots, métricas e botão de passar vez
    const panel = document.createElement('div');
    panel.className = 'turn-panel';

    const slots = document.createElement('div');
    slots.className = 'slots';
    for (let i = 0; i < 4; i++) {
      const slot = document.createElement('div');
      slot.className = 'slot';
      slots.appendChild(slot);
    }

    const metrics = document.createElement('div');
    metrics.className = 'metrics';
    metrics.innerHTML = `
      <div class="metric"><span class="k">PV</span><span class="v pv"></span></div>
      <div class="metric"><span class="k">PA</span><span class="v pa"></span></div>
      <div class="metric"><span class="k">PM</span><span class="v pm"></span></div>
    `;

    const passBtn = document.createElement('button');
    passBtn.className = 'pass-btn';
    passBtn.type = 'button';

    const timerEl = document.createElement('span');
    timerEl.className = 'turn-timer';

    function updatePassButton() {
      passBtn.textContent = 'Passar Vez';
      timerEl.textContent = `(${Math.max(0, timeLeft)}s)`;
    }

    panel.appendChild(slots);
    panel.appendChild(metrics);
    panel.appendChild(passBtn);
    panel.appendChild(timerEl);
    document.body.appendChild(panel);

    bluePanelRefs = {
      pv: metrics.querySelector('.pv'),
      pa: metrics.querySelector('.pa'),
      pm: metrics.querySelector('.pm'),
    };
    updateBluePanel(units.blue);

    function passTurn() {
      // Reseta PM do que terminou
      const finished = getActive();
      finished.pm = 3;

      // Troca o ativo
      activeId = activeId === 'blue' ? 'red' : 'blue';
      reflectActiveStyles();
      clearReachable();
      updateBluePanel(units.blue);
      startTurnTimer();
    }

    passBtn.addEventListener('click', passTurn);

    // Inicia o primeiro turno
    reflectActiveStyles();
    startTurnTimer();

    console.log('[Tabuleiro] Unidades inicializadas', units);
  });
})();


