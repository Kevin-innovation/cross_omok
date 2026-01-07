'use client';

import { Board, CellValue } from '@/lib/types';
import { useState, useEffect } from 'react';

interface GameBoardProps {
  board: Board;
  onColumnClick: (column: number) => void;
  isMyTurn: boolean;
  myColor: 'red' | 'yellow' | null;
}

export default function GameBoard({ board, onColumnClick, isMyTurn, myColor }: GameBoardProps) {
  const [hoverColumn, setHoverColumn] = useState<number | null>(null);
  const [animatingCell, setAnimatingCell] = useState<{ row: number; col: number } | null>(null);

  // 각 열의 다음 빈 행 찾기
  const getNextEmptyRow = (column: number): number => {
    for (let row = 5; row >= 0; row--) {
      if (board[row][column] === null) {
        return row;
      }
    }
    return -1;
  };

  const handleColumnClick = (column: number) => {
    if (!isMyTurn) return;
    const row = getNextEmptyRow(column);
    if (row === -1) return;

    setAnimatingCell({ row, col: column });
    setTimeout(() => {
      setAnimatingCell(null);
      onColumnClick(column);
    }, 300);
  };

  const getCellColor = (value: CellValue): string => {
    if (value === 'red') return 'bg-red-500';
    if (value === 'yellow') return 'bg-yellow-400';
    return 'bg-white';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative bg-blue-600 p-4 rounded-lg shadow-2xl">
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-2">
              {/* 호버 인디케이터 */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                  hoverColumn === colIndex && isMyTurn
                    ? myColor === 'red'
                      ? 'bg-red-500/50'
                      : 'bg-yellow-400/50'
                    : 'bg-transparent'
                }`}
                onMouseEnter={() => isMyTurn && setHoverColumn(colIndex)}
                onMouseLeave={() => setHoverColumn(null)}
                onClick={() => handleColumnClick(colIndex)}
              />
            </div>
          ))}
        </div>

        {/* 게임 보드 */}
        <div className="grid grid-cols-7 gap-2 mt-2">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="w-16 h-16 bg-blue-800 rounded-full flex items-center justify-center shadow-inner"
              >
                <div
                  className={`w-14 h-14 rounded-full transition-all duration-300 ${getCellColor(
                    cell
                  )} ${
                    animatingCell?.row === rowIndex && animatingCell?.col === colIndex
                      ? 'scale-0'
                      : 'scale-100'
                  }`}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* 턴 인디케이터 */}
      <div className="mt-4 text-center">
        {isMyTurn ? (
          <div className="text-xl font-bold text-green-500 animate-pulse">당신의 차례입니다!</div>
        ) : (
          <div className="text-xl font-bold text-gray-400">상대방의 차례입니다</div>
        )}
      </div>
    </div>
  );
}
