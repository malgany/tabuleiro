import { COLS, ROWS, isInside } from './board-utils.js';

export function computeReachable(start, pm, isAllowed) {
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

export function buildPath(from, to, dist, isAllowed) {
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
