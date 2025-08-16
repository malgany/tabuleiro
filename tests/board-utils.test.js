import { indexToRowCol, rowColToIndex, isInside } from '../js/board-utils.js';

describe('board-utils', () => {
  test('indexToRowCol converts index to row and col', () => {
    expect(indexToRowCol(0)).toEqual({ row: 0, col: 0 });
    expect(indexToRowCol(5)).toEqual({ row: 1, col: 1 });
    expect(indexToRowCol(23)).toEqual({ row: 5, col: 3 });
  });

  test('rowColToIndex converts coordinates back to index', () => {
    expect(rowColToIndex(0, 0)).toBe(0);
    expect(rowColToIndex(1, 2)).toBe(6);
    expect(rowColToIndex(5, 3)).toBe(23);
  });

  test('isInside validates board boundaries', () => {
    expect(isInside(0, 0)).toBe(true);
    expect(isInside(5, 3)).toBe(true);
    expect(isInside(-1, 0)).toBe(false);
    expect(isInside(0, -1)).toBe(false);
    expect(isInside(6, 0)).toBe(false);
    expect(isInside(0, 4)).toBe(false);
  });
});

