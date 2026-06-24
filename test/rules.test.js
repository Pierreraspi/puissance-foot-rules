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
