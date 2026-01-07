export type CellValue = 'red' | 'yellow' | null;
export type Board = CellValue[][];
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface Player {
  socketId: string;
  nickname: string;
  color: 'red' | 'yellow';
}

export interface GameState {
  roomId: string;
  players: Player[];
  board: Board;
  currentPlayer: number;
  gameStatus: GameStatus;
  winner: Player | null;
}
