import { computeReachable, buildPath } from '../js/pathfinding.js';

describe('computeReachable', () => {
  test('computes distances within movement points', () => {
    const dist = computeReachable({ row: 0, col: 0 }, 2, () => true);
    expect(dist[0][0]).toBe(0);
    expect(dist[0][1]).toBe(1);
    expect(dist[1][1]).toBe(2);
    expect(dist[2][0]).toBe(2);
    expect(Number.isFinite(dist[3][0])).toBe(false);
  });

  test('respects blocked tiles', () => {
    const isAllowed = (r, c) => !(r === 0 && c === 1);
    const dist = computeReachable({ row: 0, col: 0 }, 2, isAllowed);
    expect(Number.isFinite(dist[0][1])).toBe(false);
    expect(dist[1][0]).toBe(1);
  });
});

describe('buildPath', () => {
  test('reconstructs shortest path', () => {
    const start = { row: 0, col: 0 };
    const dest = { row: 1, col: 1 };
    const dist = computeReachable(start, 2, () => true);
    const path = buildPath(start, dest, dist, () => true);
    expect(path).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 1 },
    ]);
  });

  test('returns null when target is unreachable', () => {
    const start = { row: 0, col: 0 };
    const isAllowed = (r, c) => !(r === 0 && c === 1);
    const dist = computeReachable(start, 2, isAllowed);
    const dest = { row: 0, col: 2 };
    const path = buildPath(start, dest, dist, isAllowed);
    expect(path).toBeNull();
  });
});

