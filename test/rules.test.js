'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createInitialBoard,
  isValidBoard,
  validateMove,
  applyMove,
  hasWinningConnection,
  getWinner
} = require('../src');

test('initial board is valid and freshly cloned', () => {
  const first = createInitialBoard();
  const second = createInitialBoard();
  assert.equal(isValidBoard(first), true);
  first[7][0] = '';
  assert.equal(second[7][0], '♖');
});

test('rook cannot move diagonally or through another piece', () => {
  const board = createInitialBoard();
  assert.equal(validateMove(board, {
    from: { row: 7, col: 0 },
    to: { row: 6, col: 1 }
  }, 'white').reason, 'illegal_geometry');

  assert.equal(validateMove(board, {
    from: { row: 7, col: 0 },
    to: { row: 7, col: 2 }
  }, 'white').reason, 'occupied_destination');
});

test('knight can move in an L shape', () => {
  const board = createInitialBoard();
  assert.equal(validateMove(board, {
    from: { row: 7, col: 1 },
    to: { row: 5, col: 2 }
  }, 'white').valid, true);
});

test('moves cannot capture or move opponent pieces', () => {
  const board = createInitialBoard();
  assert.equal(validateMove(board, {
    from: { row: 0, col: 1 },
    to: { row: 2, col: 2 }
  }, 'white').reason, 'wrong_owner');

  board[0][0] = '';
  board[5][2] = '♜';
  assert.equal(validateMove(board, {
    from: { row: 7, col: 1 },
    to: { row: 5, col: 2 }
  }, 'white').reason, 'occupied_destination');
});

test('only the correct king may enter each goal area', () => {
  const board = createInitialBoard();
  board[7][0] = '';
  board[1][3] = '♖';
  assert.equal(validateMove(board, {
    from: { row: 1, col: 3 },
    to: { row: 0, col: 3 }
  }, 'white').reason, 'restricted_goal');

  board[0][4] = '';
  board[1][4] = '♚';
  assert.equal(validateMove(board, {
    from: { row: 1, col: 4 },
    to: { row: 0, col: 4 }
  }, 'black').valid, true);
});

test('tutorial and AI simulation boards may contain fewer pieces', () => {
  const board = Array.from({ length: 8 }, () => Array(8).fill(''));
  board[7][4] = '♔';
  board[0][4] = '♚';
  board[5][2] = '♘';

  assert.equal(isValidBoard(board), true);
  assert.equal(validateMove(board, {
    from: { row: 5, col: 2 },
    to: { row: 3, col: 3 }
  }, 'white').valid, true);
});

test('applyMove does not mutate the source board', () => {
  const board = createInitialBoard();
  const next = applyMove(board, {
    from: { row: 7, col: 1 },
    to: { row: 5, col: 2 }
  }, 'white');

  assert.equal(board[7][1], '♘');
  assert.equal(board[5][2], '');
  assert.equal(next[7][1], '');
  assert.equal(next[5][2], '♘');
});

test('detects a direct white winning connection', () => {
  const board = createInitialBoard();
  board[7][4] = '';
  board[1][3] = '♔';
  assert.equal(hasWinningConnection(board, 'white'), true);
  assert.equal(getWinner(board), 'white');
});
