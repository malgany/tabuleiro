export const COLS = 4;
export const ROWS = 6;

export function indexToRowCol(index) {
  return { row: Math.floor(index / COLS), col: index % COLS };
}

export function rowColToIndex(row, col) {
  return row * COLS + col;
}

export function isInside(row, col) {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}
