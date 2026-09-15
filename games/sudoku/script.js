const SIZE = 9;
const BOX = 3;
const PROGRESS_KEY = "sudoku.progress";
// How long Restart / New puzzle stay armed after their first click before the
// confirm window lapses - see makeConfirmButton().
const CONFIRM_WINDOW_MS = 5000;

// A small fixed set of hand-picked puzzles, each pre-verified (by
// tests/sudoku-puzzles.test.js) to have exactly one solution. See "Puzzle
// data" in DESIGN.md for why no solver runs here at all — `solution` is kept
// on each entry but never read by any check below.
const PUZZLES = [
  {
    givens: [
      [0, 0, 6, 0, 0, 8, 0, 0, 0],
      [3, 0, 0, 2, 0, 0, 0, 0, 0],
      [0, 0, 7, 0, 0, 0, 2, 0, 4],
      [8, 0, 0, 0, 0, 5, 0, 0, 6],
      [2, 0, 0, 0, 0, 6, 0, 0, 3],
      [7, 0, 0, 4, 0, 0, 0, 9, 0],
      [0, 0, 0, 0, 7, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 3, 0, 8],
      [0, 3, 0, 6, 0, 1, 4, 2, 0],
    ],
    solution: [
      [9, 2, 6, 1, 4, 8, 7, 3, 5],
      [3, 5, 4, 2, 6, 7, 9, 8, 1],
      [1, 8, 7, 5, 3, 9, 2, 6, 4],
      [8, 9, 3, 7, 2, 5, 1, 4, 6],
      [2, 4, 1, 8, 9, 6, 5, 7, 3],
      [7, 6, 5, 4, 1, 3, 8, 9, 2],
      [4, 1, 8, 3, 7, 2, 6, 5, 9],
      [6, 7, 2, 9, 5, 4, 3, 1, 8],
      [5, 3, 9, 6, 8, 1, 4, 2, 7],
    ],
  },
  {
    givens: [
      [0, 0, 0, 0, 9, 0, 0, 0, 0],
      [6, 0, 0, 8, 1, 0, 4, 0, 0],
      [0, 0, 8, 0, 0, 2, 0, 9, 0],
      [3, 6, 4, 0, 0, 0, 0, 7, 0],
      [7, 0, 0, 0, 3, 5, 0, 0, 0],
      [5, 0, 0, 0, 4, 0, 0, 6, 1],
      [0, 0, 0, 0, 0, 8, 0, 1, 6],
      [0, 0, 0, 4, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 0, 8, 0, 5],
    ],
    solution: [
      [2, 3, 1, 7, 9, 4, 6, 5, 8],
      [6, 9, 5, 8, 1, 3, 4, 2, 7],
      [4, 7, 8, 5, 6, 2, 1, 9, 3],
      [3, 6, 4, 1, 8, 9, 5, 7, 2],
      [7, 1, 2, 6, 3, 5, 9, 8, 4],
      [5, 8, 9, 2, 4, 7, 3, 6, 1],
      [9, 4, 7, 3, 5, 8, 2, 1, 6],
      [8, 5, 6, 4, 2, 1, 7, 3, 9],
      [1, 2, 3, 9, 7, 6, 8, 4, 5],
    ],
  },
  {
    givens: [
      [0, 0, 9, 0, 0, 8, 0, 0, 5],
      [7, 0, 0, 0, 0, 3, 6, 0, 0],
      [0, 4, 0, 0, 5, 0, 0, 0, 9],
      [0, 0, 0, 9, 0, 0, 0, 8, 0],
      [0, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 4, 8, 0, 0, 0, 0],
      [0, 2, 8, 0, 0, 0, 3, 0, 0],
      [0, 9, 0, 0, 2, 0, 0, 1, 0],
      [4, 0, 1, 0, 0, 7, 9, 0, 0],
    ],
    solution: [
      [3, 1, 9, 6, 4, 8, 7, 2, 5],
      [7, 5, 2, 1, 9, 3, 6, 4, 8],
      [8, 4, 6, 7, 5, 2, 1, 3, 9],
      [2, 6, 4, 9, 3, 1, 5, 8, 7],
      [9, 8, 3, 2, 7, 5, 4, 6, 1],
      [1, 7, 5, 4, 8, 6, 2, 9, 3],
      [6, 2, 8, 5, 1, 9, 3, 7, 4],
      [5, 9, 7, 3, 2, 4, 8, 1, 6],
      [4, 3, 1, 8, 6, 7, 9, 5, 2],
    ],
  },
  {
    givens: [
      [6, 4, 5, 0, 0, 0, 0, 0, 2],
      [0, 0, 0, 0, 0, 4, 0, 0, 0],
      [9, 0, 0, 3, 1, 0, 7, 0, 0],
      [3, 0, 0, 0, 9, 2, 0, 4, 0],
      [4, 0, 1, 0, 0, 5, 0, 0, 0],
      [0, 0, 0, 6, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 6, 0, 9, 0, 0],
      [0, 0, 7, 0, 0, 3, 0, 2, 0],
      [0, 9, 0, 4, 2, 0, 0, 1, 0],
    ],
    solution: [
      [6, 4, 5, 8, 7, 9, 1, 3, 2],
      [7, 1, 3, 2, 5, 4, 8, 6, 9],
      [9, 8, 2, 3, 1, 6, 7, 5, 4],
      [3, 7, 8, 1, 9, 2, 6, 4, 5],
      [4, 6, 1, 7, 3, 5, 2, 9, 8],
      [5, 2, 9, 6, 4, 8, 3, 7, 1],
      [2, 3, 4, 5, 6, 1, 9, 8, 7],
      [1, 5, 7, 9, 8, 3, 4, 2, 6],
      [8, 9, 6, 4, 2, 7, 5, 1, 3],
    ],
  },
  {
    givens: [
      [0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 7, 0, 2],
      [0, 3, 9, 2, 0, 0, 0, 0, 6],
      [1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 8, 0, 5, 7, 0, 0, 0],
      [7, 0, 5, 9, 0, 0, 1, 0, 0],
      [3, 0, 0, 7, 0, 0, 2, 9, 0],
      [0, 1, 0, 0, 0, 2, 0, 0, 5],
      [0, 9, 0, 0, 8, 0, 0, 0, 0],
    ],
    solution: [
      [2, 7, 4, 5, 6, 1, 8, 3, 9],
      [6, 5, 1, 8, 3, 9, 7, 4, 2],
      [8, 3, 9, 2, 7, 4, 5, 1, 6],
      [1, 4, 3, 6, 2, 8, 9, 5, 7],
      [9, 2, 8, 1, 5, 7, 4, 6, 3],
      [7, 6, 5, 9, 4, 3, 1, 2, 8],
      [3, 8, 6, 7, 1, 5, 2, 9, 4],
      [4, 1, 7, 3, 9, 2, 6, 8, 5],
      [5, 9, 2, 4, 8, 6, 3, 7, 1],
    ],
  },
  {
    givens: [
      [6, 0, 0, 0, 0, 0, 0, 0, 1],
      [0, 5, 0, 8, 0, 0, 0, 3, 0],
      [0, 1, 0, 0, 3, 2, 0, 0, 8],
      [1, 0, 0, 0, 8, 0, 0, 0, 7],
      [0, 0, 0, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 4, 6, 1, 0, 0, 0],
      [8, 0, 0, 0, 0, 6, 7, 2, 0],
      [0, 0, 2, 5, 0, 0, 0, 6, 0],
      [0, 4, 0, 0, 0, 0, 8, 0, 0],
    ],
    solution: [
      [6, 8, 3, 7, 5, 9, 2, 4, 1],
      [2, 5, 7, 8, 1, 4, 9, 3, 6],
      [4, 1, 9, 6, 3, 2, 5, 7, 8],
      [1, 2, 4, 9, 8, 3, 6, 5, 7],
      [3, 6, 8, 2, 7, 5, 4, 1, 9],
      [9, 7, 5, 4, 6, 1, 3, 8, 2],
      [8, 9, 1, 3, 4, 6, 7, 2, 5],
      [7, 3, 2, 5, 9, 8, 1, 6, 4],
      [5, 4, 6, 1, 2, 7, 8, 9, 3],
    ],
  },
  {
    givens: [
      [0, 6, 0, 0, 0, 0, 0, 3, 0],
      [0, 0, 1, 0, 3, 0, 6, 0, 0],
      [0, 7, 9, 0, 0, 0, 0, 4, 0],
      [0, 0, 5, 0, 9, 0, 8, 0, 2],
      [9, 0, 7, 0, 0, 1, 5, 0, 0],
      [0, 0, 4, 0, 0, 5, 0, 0, 0],
      [0, 0, 0, 4, 0, 0, 0, 8, 9],
      [0, 0, 0, 0, 2, 0, 0, 1, 0],
      [0, 1, 0, 9, 0, 0, 0, 0, 0],
    ],
    solution: [
      [5, 6, 8, 1, 4, 2, 9, 3, 7],
      [2, 4, 1, 7, 3, 9, 6, 5, 8],
      [3, 7, 9, 5, 6, 8, 2, 4, 1],
      [1, 3, 5, 6, 9, 4, 8, 7, 2],
      [9, 2, 7, 3, 8, 1, 5, 6, 4],
      [6, 8, 4, 2, 7, 5, 1, 9, 3],
      [7, 5, 2, 4, 1, 6, 3, 8, 9],
      [4, 9, 6, 8, 2, 3, 7, 1, 5],
      [8, 1, 3, 9, 5, 7, 4, 2, 6],
    ],
  },
  {
    givens: [
      [0, 9, 0, 0, 0, 0, 0, 0, 1],
      [7, 0, 0, 0, 0, 9, 2, 0, 3],
      [0, 0, 2, 4, 6, 0, 0, 7, 0],
      [0, 5, 0, 2, 0, 0, 0, 0, 0],
      [0, 0, 9, 0, 0, 0, 0, 6, 0],
      [0, 0, 3, 0, 4, 0, 0, 8, 0],
      [0, 0, 0, 5, 0, 0, 0, 0, 4],
      [2, 0, 4, 8, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 7, 0, 8, 0, 0],
    ],
    solution: [
      [8, 9, 5, 7, 3, 2, 6, 4, 1],
      [7, 4, 6, 1, 8, 9, 2, 5, 3],
      [3, 1, 2, 4, 6, 5, 9, 7, 8],
      [6, 5, 8, 2, 9, 1, 4, 3, 7],
      [4, 7, 9, 3, 5, 8, 1, 6, 2],
      [1, 2, 3, 6, 4, 7, 5, 8, 9],
      [9, 8, 7, 5, 2, 6, 3, 1, 4],
      [2, 6, 4, 8, 1, 3, 7, 9, 5],
      [5, 3, 1, 9, 7, 4, 8, 2, 6],
    ],
  },
  {
    givens: [
      [0, 3, 4, 0, 0, 0, 0, 2, 0],
      [0, 0, 6, 3, 0, 0, 4, 0, 0],
      [2, 0, 0, 0, 0, 0, 0, 0, 7],
      [1, 0, 0, 0, 0, 6, 9, 8, 0],
      [0, 0, 0, 9, 0, 2, 0, 0, 0],
      [0, 5, 3, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 8, 0, 0, 0, 4, 0],
      [0, 0, 0, 0, 6, 9, 1, 0, 0],
      [6, 0, 2, 0, 0, 0, 0, 0, 8],
    ],
    solution: [
      [7, 3, 4, 1, 9, 8, 6, 2, 5],
      [5, 8, 6, 3, 2, 7, 4, 1, 9],
      [2, 9, 1, 6, 5, 4, 8, 3, 7],
      [1, 2, 7, 5, 3, 6, 9, 8, 4],
      [4, 6, 8, 9, 7, 2, 3, 5, 1],
      [9, 5, 3, 4, 8, 1, 7, 6, 2],
      [3, 7, 9, 8, 1, 5, 2, 4, 6],
      [8, 4, 5, 2, 6, 9, 1, 7, 3],
      [6, 1, 2, 7, 4, 3, 5, 9, 8],
    ],
  },
  {
    givens: [
      [0, 7, 0, 0, 0, 0, 0, 6, 2],
      [0, 6, 0, 1, 0, 0, 8, 0, 0],
      [0, 0, 0, 3, 0, 0, 0, 5, 0],
      [0, 3, 0, 0, 0, 5, 0, 9, 0],
      [8, 0, 2, 0, 0, 0, 0, 1, 0],
      [0, 0, 7, 0, 0, 0, 5, 0, 0],
      [0, 0, 8, 4, 9, 0, 0, 0, 0],
      [0, 0, 0, 0, 5, 0, 0, 8, 0],
      [0, 4, 3, 0, 0, 7, 0, 0, 6],
    ],
    solution: [
      [9, 7, 1, 5, 4, 8, 3, 6, 2],
      [3, 6, 5, 1, 7, 2, 8, 4, 9],
      [2, 8, 4, 3, 6, 9, 7, 5, 1],
      [1, 3, 6, 7, 8, 5, 2, 9, 4],
      [8, 5, 2, 9, 3, 4, 6, 1, 7],
      [4, 9, 7, 6, 2, 1, 5, 3, 8],
      [6, 2, 8, 4, 9, 3, 1, 7, 5],
      [7, 1, 9, 2, 5, 6, 4, 8, 3],
      [5, 4, 3, 8, 1, 7, 9, 2, 6],
    ],
  },
  {
    givens: [
      [2, 4, 0, 0, 7, 0, 5, 0, 0],
      [0, 0, 0, 0, 0, 0, 6, 0, 0],
      [0, 0, 7, 5, 0, 0, 0, 0, 9],
      [0, 3, 0, 0, 0, 0, 1, 0, 0],
      [0, 2, 0, 0, 5, 7, 0, 0, 0],
      [0, 0, 0, 0, 3, 0, 0, 8, 0],
      [3, 7, 2, 4, 0, 0, 0, 6, 0],
      [0, 1, 0, 9, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 6, 0, 0, 5],
    ],
    solution: [
      [2, 4, 6, 3, 7, 9, 5, 1, 8],
      [9, 5, 3, 8, 4, 1, 6, 2, 7],
      [1, 8, 7, 5, 6, 2, 3, 4, 9],
      [7, 3, 4, 2, 9, 8, 1, 5, 6],
      [8, 2, 1, 6, 5, 7, 4, 9, 3],
      [5, 6, 9, 1, 3, 4, 7, 8, 2],
      [3, 7, 2, 4, 8, 5, 9, 6, 1],
      [6, 1, 5, 9, 2, 3, 8, 7, 4],
      [4, 9, 8, 7, 1, 6, 2, 3, 5],
    ],
  },
  {
    givens: [
      [4, 0, 1, 3, 7, 0, 0, 0, 9],
      [7, 6, 0, 0, 0, 0, 8, 0, 0],
      [0, 0, 0, 4, 0, 0, 0, 0, 0],
      [1, 4, 0, 0, 0, 0, 5, 7, 0],
      [2, 0, 0, 0, 8, 4, 0, 0, 0],
      [0, 0, 0, 0, 9, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 9, 0, 4],
      [0, 0, 0, 6, 0, 0, 2, 0, 0],
      [5, 7, 0, 0, 4, 0, 0, 0, 6],
    ],
    solution: [
      [4, 8, 1, 3, 7, 5, 6, 2, 9],
      [7, 6, 5, 1, 2, 9, 8, 4, 3],
      [3, 9, 2, 4, 6, 8, 7, 1, 5],
      [1, 4, 9, 2, 3, 6, 5, 7, 8],
      [2, 5, 6, 7, 8, 4, 3, 9, 1],
      [8, 3, 7, 5, 9, 1, 4, 6, 2],
      [6, 2, 3, 8, 1, 7, 9, 5, 4],
      [9, 1, 4, 6, 5, 3, 2, 8, 7],
      [5, 7, 8, 9, 4, 2, 1, 3, 6],
    ],
  },
  {
    givens: [
      [0, 7, 0, 0, 0, 0, 0, 0, 9],
      [3, 0, 0, 2, 7, 0, 4, 0, 0],
      [2, 0, 0, 9, 0, 0, 3, 0, 0],
      [0, 0, 0, 0, 4, 1, 0, 8, 0],
      [0, 2, 0, 5, 0, 0, 0, 0, 0],
      [0, 1, 4, 0, 0, 0, 7, 0, 0],
      [0, 6, 0, 0, 0, 0, 9, 4, 0],
      [0, 0, 5, 0, 0, 0, 0, 7, 0],
      [0, 0, 7, 8, 0, 0, 0, 2, 0],
    ],
    solution: [
      [4, 7, 6, 1, 8, 3, 2, 5, 9],
      [3, 5, 9, 2, 7, 6, 4, 1, 8],
      [2, 8, 1, 9, 5, 4, 3, 6, 7],
      [7, 9, 3, 6, 4, 1, 5, 8, 2],
      [6, 2, 8, 5, 9, 7, 1, 3, 4],
      [5, 1, 4, 3, 2, 8, 7, 9, 6],
      [8, 6, 2, 7, 1, 5, 9, 4, 3],
      [9, 3, 5, 4, 6, 2, 8, 7, 1],
      [1, 4, 7, 8, 3, 9, 6, 2, 5],
    ],
  },
  {
    givens: [
      [0, 0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 4, 9, 7, 5, 0, 0, 0],
      [2, 0, 0, 0, 0, 4, 0, 8, 0],
      [1, 0, 0, 0, 6, 0, 0, 0, 4],
      [3, 0, 0, 8, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 6],
      [8, 0, 5, 3, 9, 0, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 1, 0, 0],
      [0, 2, 7, 0, 0, 0, 0, 9, 0],
    ],
    solution: [
      [7, 3, 9, 1, 2, 8, 4, 6, 5],
      [6, 8, 4, 9, 7, 5, 3, 1, 2],
      [2, 5, 1, 6, 3, 4, 7, 8, 9],
      [1, 9, 8, 7, 6, 3, 5, 2, 4],
      [3, 4, 6, 8, 5, 2, 9, 7, 1],
      [5, 7, 2, 4, 1, 9, 8, 3, 6],
      [8, 1, 5, 3, 9, 6, 2, 4, 7],
      [9, 6, 3, 2, 4, 7, 1, 5, 8],
      [4, 2, 7, 5, 8, 1, 6, 9, 3],
    ],
  },
  {
    givens: [
      [0, 0, 9, 4, 0, 0, 0, 0, 5],
      [0, 0, 0, 0, 3, 0, 0, 0, 6],
      [0, 7, 4, 0, 0, 0, 0, 0, 0],
      [0, 1, 3, 0, 0, 0, 9, 0, 8],
      [5, 8, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 5, 0, 0, 7, 3, 0],
      [0, 4, 0, 7, 0, 0, 5, 2, 0],
      [0, 0, 0, 0, 4, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 9, 0, 0, 3],
    ],
    solution: [
      [8, 3, 9, 4, 7, 6, 2, 1, 5],
      [2, 5, 1, 9, 3, 8, 4, 7, 6],
      [6, 7, 4, 2, 1, 5, 3, 8, 9],
      [7, 1, 3, 6, 2, 4, 9, 5, 8],
      [5, 8, 2, 3, 9, 7, 1, 6, 4],
      [4, 9, 6, 5, 8, 1, 7, 3, 2],
      [9, 4, 8, 7, 6, 3, 5, 2, 1],
      [3, 6, 5, 1, 4, 2, 8, 9, 7],
      [1, 2, 7, 8, 5, 9, 6, 4, 3],
    ],
  },
  {
    givens: [
      [0, 6, 0, 0, 0, 5, 8, 7, 0],
      [3, 0, 0, 0, 1, 0, 0, 0, 4],
      [0, 0, 0, 4, 6, 0, 0, 0, 0],
      [7, 0, 0, 0, 0, 0, 0, 0, 1],
      [0, 5, 0, 0, 0, 0, 3, 0, 0],
      [0, 0, 0, 9, 2, 3, 0, 0, 0],
      [0, 0, 0, 2, 0, 8, 5, 1, 0],
      [0, 4, 0, 0, 0, 0, 0, 0, 0],
      [8, 0, 5, 0, 0, 0, 0, 0, 9],
    ],
    solution: [
      [4, 6, 1, 3, 9, 5, 8, 7, 2],
      [3, 9, 2, 8, 1, 7, 6, 5, 4],
      [5, 7, 8, 4, 6, 2, 1, 9, 3],
      [7, 8, 3, 6, 5, 4, 9, 2, 1],
      [2, 5, 9, 7, 8, 1, 3, 4, 6],
      [6, 1, 4, 9, 2, 3, 7, 8, 5],
      [9, 3, 6, 2, 4, 8, 5, 1, 7],
      [1, 4, 7, 5, 3, 9, 2, 6, 8],
      [8, 2, 5, 1, 7, 6, 4, 3, 9],
    ],
  },
  {
    givens: [
      [0, 0, 0, 8, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 3, 6, 2, 0],
      [0, 0, 8, 0, 0, 9, 0, 0, 0],
      [5, 8, 0, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 8, 0, 4, 1, 0],
      [0, 0, 3, 0, 0, 5, 0, 0, 0],
      [8, 1, 0, 0, 0, 0, 9, 0, 6],
      [0, 0, 5, 0, 0, 0, 0, 4, 2],
      [0, 4, 0, 0, 7, 0, 0, 0, 0],
    ],
    solution: [
      [4, 3, 6, 8, 2, 7, 5, 9, 1],
      [7, 9, 1, 4, 5, 3, 6, 2, 8],
      [2, 5, 8, 6, 1, 9, 7, 3, 4],
      [5, 8, 4, 2, 9, 1, 3, 6, 7],
      [9, 2, 7, 3, 8, 6, 4, 1, 5],
      [1, 6, 3, 7, 4, 5, 2, 8, 9],
      [8, 1, 2, 5, 3, 4, 9, 7, 6],
      [3, 7, 5, 9, 6, 8, 1, 4, 2],
      [6, 4, 9, 1, 7, 2, 8, 5, 3],
    ],
  },
  {
    givens: [
      [0, 8, 5, 0, 0, 0, 0, 2, 0],
      [1, 0, 0, 0, 0, 2, 0, 0, 4],
      [6, 0, 0, 7, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 7, 0, 0, 9],
      [8, 0, 0, 0, 2, 0, 6, 0, 0],
      [0, 0, 0, 0, 0, 0, 7, 0, 8],
      [7, 3, 0, 0, 0, 0, 4, 9, 0],
      [0, 2, 0, 0, 0, 9, 0, 0, 1],
      [0, 0, 0, 4, 0, 0, 8, 0, 0],
    ],
    solution: [
      [9, 8, 5, 3, 4, 6, 1, 2, 7],
      [1, 7, 3, 8, 9, 2, 5, 6, 4],
      [6, 4, 2, 7, 1, 5, 9, 8, 3],
      [3, 5, 6, 1, 8, 7, 2, 4, 9],
      [8, 1, 7, 9, 2, 4, 6, 3, 5],
      [2, 9, 4, 5, 6, 3, 7, 1, 8],
      [7, 3, 1, 2, 5, 8, 4, 9, 6],
      [4, 2, 8, 6, 7, 9, 3, 5, 1],
      [5, 6, 9, 4, 3, 1, 8, 7, 2],
    ],
  },
  {
    givens: [
      [0, 7, 0, 0, 0, 6, 0, 0, 4],
      [3, 0, 0, 7, 0, 0, 0, 0, 0],
      [0, 0, 0, 8, 9, 0, 2, 7, 0],
      [0, 5, 0, 0, 0, 0, 3, 0, 0],
      [0, 4, 0, 0, 0, 0, 0, 2, 0],
      [1, 0, 8, 0, 0, 2, 0, 0, 0],
      [6, 8, 0, 0, 7, 0, 0, 0, 0],
      [0, 1, 0, 0, 8, 0, 0, 5, 3],
      [9, 0, 0, 0, 0, 0, 0, 6, 0],
    ],
    solution: [
      [8, 7, 9, 1, 2, 6, 5, 3, 4],
      [3, 2, 1, 7, 4, 5, 8, 9, 6],
      [5, 6, 4, 8, 9, 3, 2, 7, 1],
      [2, 5, 6, 4, 1, 7, 3, 8, 9],
      [7, 4, 3, 9, 6, 8, 1, 2, 5],
      [1, 9, 8, 5, 3, 2, 6, 4, 7],
      [6, 8, 5, 3, 7, 4, 9, 1, 2],
      [4, 1, 2, 6, 8, 9, 7, 5, 3],
      [9, 3, 7, 2, 5, 1, 4, 6, 8],
    ],
  },
  {
    givens: [
      [0, 1, 0, 0, 0, 0, 0, 0, 2],
      [0, 0, 0, 1, 8, 0, 0, 0, 0],
      [5, 0, 0, 0, 0, 7, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 3, 0, 1],
      [6, 0, 8, 0, 0, 1, 2, 0, 0],
      [1, 0, 0, 0, 0, 9, 7, 0, 0],
      [0, 4, 0, 6, 0, 0, 0, 0, 0],
      [8, 5, 0, 0, 3, 2, 0, 0, 0],
      [3, 0, 7, 0, 0, 0, 0, 5, 0],
    ],
    solution: [
      [7, 1, 3, 4, 5, 6, 9, 8, 2],
      [2, 6, 9, 1, 8, 3, 5, 7, 4],
      [5, 8, 4, 2, 9, 7, 1, 3, 6],
      [4, 9, 5, 7, 2, 8, 3, 6, 1],
      [6, 7, 8, 3, 4, 1, 2, 9, 5],
      [1, 3, 2, 5, 6, 9, 7, 4, 8],
      [9, 4, 1, 6, 7, 5, 8, 2, 3],
      [8, 5, 6, 9, 3, 2, 4, 1, 7],
      [3, 2, 7, 8, 1, 4, 6, 5, 9],
    ],
  },
  {
    givens: [
      [0, 0, 2, 0, 0, 0, 3, 0, 4],
      [1, 0, 0, 5, 0, 0, 0, 0, 0],
      [0, 5, 9, 0, 0, 8, 0, 0, 0],
      [0, 0, 4, 0, 0, 9, 0, 0, 0],
      [3, 0, 0, 0, 0, 0, 2, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 9],
      [5, 0, 0, 9, 0, 0, 0, 3, 0],
      [9, 0, 6, 0, 8, 0, 0, 0, 0],
      [0, 0, 0, 2, 3, 0, 6, 0, 7],
    ],
    solution: [
      [7, 8, 2, 1, 9, 6, 3, 5, 4],
      [1, 6, 3, 5, 4, 2, 9, 7, 8],
      [4, 5, 9, 3, 7, 8, 1, 6, 2],
      [2, 7, 4, 6, 1, 9, 5, 8, 3],
      [3, 9, 8, 4, 5, 7, 2, 1, 6],
      [6, 1, 5, 8, 2, 3, 7, 4, 9],
      [5, 2, 7, 9, 6, 4, 8, 3, 1],
      [9, 3, 6, 7, 8, 1, 4, 2, 5],
      [8, 4, 1, 2, 3, 5, 6, 9, 7],
    ],
  },
  {
    givens: [
      [0, 0, 1, 0, 0, 5, 2, 7, 0],
      [0, 0, 0, 0, 2, 4, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 4, 0],
      [1, 0, 0, 0, 5, 0, 0, 9, 4],
      [0, 9, 0, 2, 0, 1, 0, 0, 0],
      [3, 0, 0, 9, 0, 0, 0, 0, 0],
      [0, 0, 7, 0, 0, 0, 0, 6, 0],
      [0, 8, 0, 5, 0, 9, 0, 0, 0],
      [0, 6, 9, 0, 0, 0, 0, 2, 0],
    ],
    solution: [
      [8, 4, 1, 3, 9, 5, 2, 7, 6],
      [7, 5, 6, 1, 2, 4, 3, 8, 9],
      [9, 3, 2, 6, 7, 8, 5, 4, 1],
      [1, 2, 8, 7, 5, 3, 6, 9, 4],
      [6, 9, 5, 2, 4, 1, 7, 3, 8],
      [3, 7, 4, 9, 8, 6, 1, 5, 2],
      [4, 1, 7, 8, 3, 2, 9, 6, 5],
      [2, 8, 3, 5, 6, 9, 4, 1, 7],
      [5, 6, 9, 4, 1, 7, 8, 2, 3],
    ],
  },
  {
    givens: [
      [0, 1, 0, 0, 0, 6, 0, 0, 0],
      [0, 0, 6, 0, 2, 0, 0, 0, 0],
      [0, 0, 0, 3, 0, 4, 0, 0, 7],
      [0, 0, 5, 0, 9, 3, 0, 4, 0],
      [4, 0, 0, 0, 0, 0, 9, 1, 0],
      [0, 0, 0, 0, 7, 0, 0, 0, 2],
      [0, 0, 0, 1, 0, 2, 0, 0, 0],
      [0, 3, 0, 9, 0, 0, 0, 0, 1],
      [0, 2, 0, 0, 0, 0, 6, 0, 8],
    ],
    solution: [
      [2, 1, 7, 8, 5, 6, 3, 9, 4],
      [3, 4, 6, 7, 2, 9, 1, 8, 5],
      [8, 5, 9, 3, 1, 4, 2, 6, 7],
      [1, 8, 5, 2, 9, 3, 7, 4, 6],
      [4, 7, 2, 6, 8, 5, 9, 1, 3],
      [6, 9, 3, 4, 7, 1, 8, 5, 2],
      [5, 6, 8, 1, 3, 2, 4, 7, 9],
      [7, 3, 4, 9, 6, 8, 5, 2, 1],
      [9, 2, 1, 5, 4, 7, 6, 3, 8],
    ],
  },
];

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const newPuzzleBtn = document.getElementById("new-puzzle");
const numberPad = document.getElementById("number-pad");
const helpToggle = document.getElementById("help-toggle");
const instructionsEl = document.getElementById("instructions");

let puzzleIndex = 0;
let grid = [];
let givens = [];
let cellEls = [];
let selected = null;
let gameOver = false;
// The disarm function from each of Restart's and New puzzle's confirm
// buttons, so placing a digit or arming one can disarm the other - see
// makeConfirmButton().
const confirmDisarmers = [];

function currentPuzzle() {
  return PUZZLES[puzzleIndex];
}

// localStorage is not always available - it throws in private windows, with
// site data blocked, and from file:// in some browsers. Progress is a nice
// extra, so every access degrades to "nothing saved" rather than breaking
// the game. See DESIGN.md's "Stored data" for the shape.
function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw === null) return null;
    const parsed = JSON.parse(raw);
    return isValidProgress(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isValidProgress(parsed) {
  if (
    !parsed ||
    !Number.isInteger(parsed.puzzleIndex) ||
    parsed.puzzleIndex < 0 ||
    parsed.puzzleIndex >= PUZZLES.length ||
    !Array.isArray(parsed.grid) ||
    parsed.grid.length !== SIZE ||
    !parsed.grid.every(
      (row) =>
        Array.isArray(row) &&
        row.length === SIZE &&
        row.every((v) => Number.isInteger(v) && v >= 0 && v <= 9)
    )
  ) {
    return false;
  }
  // The saved grid must agree with this puzzle's givens, in case PUZZLES has
  // changed since the save - otherwise a stale save could restore digits
  // into cells this puzzle never gave.
  return PUZZLES[parsed.puzzleIndex].givens.every((row, r) =>
    row.every((g, c) => g === 0 || parsed.grid[r][c] === g)
  );
}

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ puzzleIndex, grid }));
  } catch {
    // best-effort - the game still works without persistence
  }
}

// Every other cell sharing a row, column, or 3x3 box with (r, c) — the peers
// a digit at (r, c) must not duplicate.
function peers(r, c) {
  const result = [];
  for (let i = 0; i < SIZE; i++) {
    if (i !== c) result.push([r, i]);
    if (i !== r) result.push([i, c]);
  }
  const br = Math.floor(r / BOX) * BOX;
  const bc = Math.floor(c / BOX) * BOX;
  for (let dr = 0; dr < BOX; dr++) {
    for (let dc = 0; dc < BOX; dc++) {
      const nr = br + dr;
      const nc = bc + dc;
      if (nr !== r && nc !== c) result.push([nr, nc]);
    }
  }
  return result;
}

// Real Sudoku legality — a filled cell is wrong if it duplicates a peer's
// digit, not if it merely disagrees with the puzzle's stored solution (see
// DESIGN.md for why those two checks are not the same).
function conflicts(r, c) {
  const v = grid[r][c];
  if (v === 0) return false;
  return peers(r, c).some(([pr, pc]) => grid[pr][pc] === v);
}

function isGiven(r, c) {
  return givens[r][c] !== 0;
}

function buildBoard() {
  boardEl.innerHTML = "";
  cellEls = [];
  for (let r = 0; r < SIZE; r++) {
    const row = [];
    for (let c = 0; c < SIZE; c++) {
      const btn = document.createElement("button");
      btn.className = "cell";
      btn.setAttribute("aria-label", `Row ${r + 1}, column ${c + 1}`);
      btn.addEventListener("click", (e) => {
        selectCell(r, c);
        releaseFocus(e);
      });
      boardEl.appendChild(btn);
      row.push(btn);
    }
    cellEls.push(row);
  }
}

// A clicked button keeps the focus, and a focused button takes Space and
// Enter as its own activation - so after a pointer click on Restart or New
// puzzle, the next Space or Enter (which the player means as "type nothing" /
// game input) re-fires that button instead, silently discarding entered
// digits. Release on a *pointer* click only: a keyboard activation (detail 0)
// has to keep the focus, or tabbing through the controls would drop it on the
// first press. See CLAUDE.md's page contract and games/flappy-bird/script.js.
function releaseFocus(e) {
  if (e.detail > 0) e.currentTarget.blur();
}

function toggleInstructions() {
  const open = instructionsEl.hasAttribute("hidden");
  instructionsEl.toggleAttribute("hidden", !open);
  helpToggle.setAttribute("aria-expanded", String(open));
  helpToggle.textContent = open ? "Hide instructions" : "How to play";
}

// A given can be selected as well as an empty cell - selecting one lights its
// row, column and box, which is how you check where a digit is already spoken
// for. It still takes no digit: placeDigit() guards isGiven separately.
function selectCell(r, c) {
  if (gameOver) return;
  selected = [r, c];
  renderSelection();
}

function renderSelection() {
  // The selected cell's peers are lit as well as the cell itself. Built as a
  // lookup rather than by asking peers() per cell, so this stays one pass over
  // the board instead of 81 of them.
  const lit = new Set();
  if (selected) {
    for (const [pr, pc] of peers(selected[0], selected[1])) lit.add(pr * SIZE + pc);
  }
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const isSelected = !!selected && selected[0] === r && selected[1] === c;
      cellEls[r][c].classList.toggle("selected", isSelected);
      cellEls[r][c].classList.toggle("peer", !isSelected && lit.has(r * SIZE + c));
    }
  }
}

// True once any editable cell differs from its blank starting state - what
// Restart and New puzzle's confirm step is guarding against discarding.
function hasProgress() {
  return grid.some((row, r) => row.some((v, c) => v !== givens[r][c]));
}

function placeDigit(digit) {
  if (gameOver || !selected) return;
  const [r, c] = selected;
  if (isGiven(r, c)) return;
  grid[r][c] = digit;
  renderCell(r, c);
  // The peers too, not just the cell typed into. conflicts() is symmetric, so
  // both halves of a clash are wrong - but only the one re-rendered gets the
  // class, which left the older half of every pair unmarked. Clearing a cell
  // is the same call with digit 0, so this un-marks the survivor as well.
  for (const [pr, pc] of peers(r, c)) renderCell(pr, pc);
  saveProgress();
  disarmResetButtons();
  checkWin();
}

function renderCell(r, c) {
  const el = cellEls[r][c];
  const v = grid[r][c];
  el.textContent = v === 0 ? "" : String(v);
  el.classList.toggle("given", isGiven(r, c));
  el.classList.toggle("wrong", !isGiven(r, c) && conflicts(r, c));
  // Derived from gameOver, like the two classes above, rather than set once
  // in checkWin() and never cleared - otherwise a Restart after a win left
  // every cell, given digits included, stuck green. See DESIGN.md.
  el.classList.toggle("won", gameOver);
}

function renderBoard() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) renderCell(r, c);
  }
  renderSelection();
}

function checkWin() {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0 || conflicts(r, c)) return;
    }
  }
  gameOver = true;
  selected = null;
  statusEl.textContent = "Solved! 🎉";
  renderBoard();
}

function loadPuzzle() {
  givens = currentPuzzle().givens.map((row) => row.slice());
  grid = givens.map((row) => row.slice());
  gameOver = false;
  selected = null;
  statusEl.textContent = "Select a cell, then type a digit";
  renderBoard();
  saveProgress();
}

// Restores a previously saved grid instead of blanking to givens - the
// load-time counterpart to loadPuzzle(). checkWin() re-derives gameOver and
// the won/wrong classes from the restored grid itself rather than trusting
// anything that was saved, so a stale or hand-edited save can't fake a win.
function restoreProgress(saved) {
  puzzleIndex = saved.puzzleIndex;
  givens = currentPuzzle().givens.map((row) => row.slice());
  grid = saved.grid.map((row) => row.slice());
  gameOver = false;
  selected = null;
  statusEl.textContent = "Select a cell, then type a digit";
  renderBoard();
  checkWin();
}

function restart() {
  loadPuzzle();
}

function newPuzzle() {
  puzzleIndex = (puzzleIndex + 1) % PUZZLES.length;
  loadPuzzle();
}

function disarmResetButtons() {
  confirmDisarmers.forEach((disarm) => disarm());
}

// Two-step confirm for a button that would discard progress: the first click
// arms it (label flips to a confirmation prompt, styled like Minesweeper's
// Reset best time) and opens a window to confirm; a second click inside that
// window runs `onConfirm` and disarms. Skipped entirely when there is
// nothing to lose - grid already matches givens - so an untouched board
// still resets in one click, same as before progress was saved. See
// DESIGN.md.
function makeConfirmButton(btn, label, onConfirm) {
  let armed = false;
  let timer = null;

  function disarm() {
    armed = false;
    if (timer) clearTimeout(timer);
    timer = null;
    btn.textContent = label;
    btn.classList.remove("confirming");
  }

  btn.addEventListener("click", (e) => {
    if (armed) {
      disarm();
      onConfirm();
    } else if (hasProgress()) {
      // Only one button stays armed at a time.
      confirmDisarmers.forEach((other) => other !== disarm && other());
      armed = true;
      btn.textContent = "Sure? Click to confirm";
      btn.classList.add("confirming");
      timer = setTimeout(disarm, CONFIRM_WINDOW_MS);
    } else {
      onConfirm();
    }
    releaseFocus(e);
  });

  confirmDisarmers.push(disarm);
}

function handleKeydown(e) {
  if (e.key >= "1" && e.key <= "9") {
    placeDigit(Number(e.key));
  } else if (e.key === "Backspace" || e.key === "Delete") {
    placeDigit(0);
  }
}

function init() {
  const saved = loadProgress();
  if (saved) {
    restoreProgress(saved);
  } else {
    restart();
  }
}

buildBoard();
makeConfirmButton(restartBtn, "Restart", restart);
makeConfirmButton(newPuzzleBtn, "New puzzle", newPuzzle);
helpToggle.addEventListener("click", toggleInstructions);
helpToggle.addEventListener("click", releaseFocus);
numberPad.addEventListener("click", (e) => {
  const btn = e.target.closest(".num-btn");
  if (!btn) return;
  placeDigit(Number(btn.dataset.digit));
  // Delegated on the container, so currentTarget there is #number-pad, not
  // the button that was actually clicked - release the button by hand.
  if (e.detail > 0) btn.blur();
});
document.addEventListener("keydown", handleKeydown);
init();
