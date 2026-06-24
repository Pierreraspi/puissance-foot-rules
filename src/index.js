'use strict';

const BOARD_SIZE = 8;

const PIECES = Object.freeze({
  WHITE_KING: '♔',
  WHITE_ROOK: '♖',
  WHITE_BISHOP: '♗',
  WHITE_KNIGHT: '♘',
  BLACK_KING: '♚',
  BLACK_ROOK: '♜',
  BLACK_BISHOP: '♝',
  BLACK_KNIGHT: '♞'
});

const WHITE_PIECES = Object.freeze([
  PIECES.WHITE_KING,
  PIECES.WHITE_ROOK,
  PIECES.WHITE_BISHOP,
  PIECES.WHITE_KNIGHT
]);

const BLACK_PIECES = Object.freeze([
  PIECES.BLACK_KING,
  PIECES.BLACK_ROOK,
  PIECES.BLACK_BISHOP,
  PIECES.BLACK_KNIGHT
]);

const WIN_TARGETS = Object.freeze({
  white: Object.freeze([[0, 3], [0, 4]]),
  black: Object.freeze([[7, 3], [7, 4]])
});

const INITIAL_BOARD = Object.freeze([
  Object.freeze(['♜', '♞', '♝', '', '♚', '♝', '♞', '♜']),
  Object.freeze(['', '', '', '', '', '', '', '']),
  Object.freeze(['', '', '', '', '', '', '', '']),
  Object.freeze(['', '', '', '', '', '', '', '']),
  Object.freeze(['', '', '', '', '', '', '', '']),
  Object.freeze(['', '', '', '', '', '', '', '']),
  Object.freeze(['', '', '', '', '', '', '', '']),
  Object.freeze(['♖', '♘', '♗', '', '♔', '♗', '♘', '♖'])
]);

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function createInitialBoard() {
  return cloneBoard(INITIAL_BOARD);
}

function isValidPosition(row, col) {
  return Number.isInteger(row) &&
    Number.isInteger(col) &&
    row >= 0 &&
    row < BOARD_SIZE &&
    col >= 0 &&
    col < BOARD_SIZE;
}

function getPieceColor(piece) {
  if (WHITE_PIECES.includes(piece)) return 'white';
  if (BLACK_PIECES.includes(piece)) return 'black';
  return null;
}

function isValidBoard(board) {
  if (!Array.isArray(board) || board.length !== BOARD_SIZE) return false;

  const allowed = new Set(['', ...WHITE_PIECES, ...BLACK_PIECES]);

  for (const row of board) {
    if (!Array.isArray(row) || row.length !== BOARD_SIZE) return false;
    for (const piece of row) {
      if (!allowed.has(piece)) return false;
    }
  }

  return true;
}

function isPathClear(board, fromRow, fromCol, toRow, toCol) {
  const rowDirection = Math.sign(toRow - fromRow);
  const colDirection = Math.sign(toCol - fromCol);
  let row = fromRow + rowDirection;
  let col = fromCol + colDirection;

  while (row !== toRow || col !== toCol) {
    if (board[row][col] !== '') return false;
    row += rowDirection;
    col += colDirection;
  }

  return true;
}

function hasValidGeometry(board, fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  if (!piece || (fromRow === toRow && fromCol === toCol)) return false;

  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  if (piece === PIECES.WHITE_ROOK || piece === PIECES.BLACK_ROOK) {
    return (fromRow === toRow || fromCol === toCol) &&
      isPathClear(board, fromRow, fromCol, toRow, toCol);
  }

  if (piece === PIECES.WHITE_KNIGHT || piece === PIECES.BLACK_KNIGHT) {
    return (rowDiff === 2 && colDiff === 1) ||
      (rowDiff === 1 && colDiff === 2);
  }

  if (piece === PIECES.WHITE_BISHOP || piece === PIECES.BLACK_BISHOP) {
    return rowDiff === colDiff &&
      isPathClear(board, fromRow, fromCol, toRow, toCol);
  }

  if (piece === PIECES.WHITE_KING || piece === PIECES.BLACK_KING) {
    return rowDiff <= 1 && colDiff <= 1;
  }

  return false;
}

function validateMove(board, move, expectedPlayer) {
  if (!isValidBoard(board)) {
    return { valid: false, reason: 'invalid_board' };
  }

  const from = move?.from;
  const to = move?.to;
  if (!from || !to ||
      !isValidPosition(from.row, from.col) ||
      !isValidPosition(to.row, to.col)) {
    return { valid: false, reason: 'invalid_position' };
  }

  const piece = board[from.row][from.col];
  const pieceColor = getPieceColor(piece);
  if (!pieceColor) {
    return { valid: false, reason: 'empty_source' };
  }

  if (expectedPlayer && pieceColor !== expectedPlayer) {
    return { valid: false, reason: 'wrong_owner' };
  }

  if (board[to.row][to.col] !== '') {
    return { valid: false, reason: 'occupied_destination' };
  }

  for (const [goalRow, goalCol] of WIN_TARGETS.white) {
    if (to.row === goalRow && to.col === goalCol &&
        piece !== PIECES.BLACK_KING) {
      return { valid: false, reason: 'restricted_goal' };
    }
  }

  for (const [goalRow, goalCol] of WIN_TARGETS.black) {
    if (to.row === goalRow && to.col === goalCol &&
        piece !== PIECES.WHITE_KING) {
      return { valid: false, reason: 'restricted_goal' };
    }
  }

  if (!hasValidGeometry(board, from.row, from.col, to.row, to.col)) {
    return { valid: false, reason: 'illegal_geometry' };
  }

  return { valid: true, piece, player: pieceColor };
}

function applyMove(board, move, expectedPlayer) {
  const validation = validateMove(board, move, expectedPlayer);
  if (!validation.valid) {
    const error = new Error(`Invalid move: ${validation.reason}`);
    error.code = validation.reason;
    throw error;
  }

  const nextBoard = cloneBoard(board);
  nextBoard[move.to.row][move.to.col] = validation.piece;
  nextBoard[move.from.row][move.from.col] = '';
  return nextBoard;
}

function findKing(board, player) {
  const king = player === 'white' ? PIECES.WHITE_KING : PIECES.BLACK_KING;
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === king) return [row, col];
    }
  }
  return null;
}

function canConnect(board, fromRow, fromCol, toRow, toCol) {
  if (!isValidPosition(fromRow, fromCol) || !isValidPosition(toRow, toCol)) {
    return false;
  }
  return hasValidGeometry(board, fromRow, fromCol, toRow, toCol);
}

function hasWinningConnection(board, player) {
  if (!isValidBoard(board) || !WIN_TARGETS[player]) return false;

  const kingPosition = findKing(board, player);
  if (!kingPosition) return false;

  const playerPieces = player === 'white' ? WHITE_PIECES : BLACK_PIECES;
  const opponentKing = player === 'white' ? PIECES.BLACK_KING : PIECES.WHITE_KING;
  const queue = [kingPosition];
  const visited = new Set([kingPosition.join(',')]);

  while (queue.length > 0) {
    const [row, col] = queue.shift();

    for (const [targetRow, targetCol] of WIN_TARGETS[player]) {
      const targetPiece = board[targetRow][targetCol];
      if (targetPiece !== opponentKing &&
          ((row === targetRow && col === targetCol) ||
           canConnect(board, row, col, targetRow, targetCol))) {
        return true;
      }
    }

    for (let targetRow = 0; targetRow < BOARD_SIZE; targetRow++) {
      for (let targetCol = 0; targetCol < BOARD_SIZE; targetCol++) {
        const key = `${targetRow},${targetCol}`;
        if (visited.has(key) ||
            !playerPieces.includes(board[targetRow][targetCol])) {
          continue;
        }

        if (canConnect(board, row, col, targetRow, targetCol)) {
          visited.add(key);
          queue.push([targetRow, targetCol]);
        }
      }
    }
  }

  return false;
}

function getWinner(board) {
  if (hasWinningConnection(board, 'white')) return 'white';
  if (hasWinningConnection(board, 'black')) return 'black';
  return null;
}

module.exports = Object.freeze({
  BOARD_SIZE,
  PIECES,
  WHITE_PIECES,
  BLACK_PIECES,
  WIN_TARGETS,
  createInitialBoard,
  cloneBoard,
  isValidPosition,
  getPieceColor,
  isValidBoard,
  isPathClear,
  canConnect,
  validateMove,
  applyMove,
  findKing,
  hasWinningConnection,
  getWinner
});
