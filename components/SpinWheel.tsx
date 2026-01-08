'use client';

import { Player } from '@/lib/types';
import { useEffect, useState } from 'react';

interface SpinWheelProps {
  players: Player[];
  onSpinComplete: (firstPlayer: number) => void;
  isSpinning: boolean;
  firstPlayer?: number;
}

export default function SpinWheel({ players, onSpinComplete, isSpinning, firstPlayer }: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isSpinning && firstPlayer !== undefined) {
      setIsAnimating(true);
      // 3초 동안 회전 애니메이션
      const targetRotation = 360 * 5 + (firstPlayer === 0 ? 0 : 180);
      setRotation(targetRotation);

      setTimeout(() => {
        setIsAnimating(false);
        onSpinComplete(firstPlayer);
      }, 3000);
    }
  }, [isSpinning, firstPlayer, onSpinComplete]);

  const player1 = players[0];
  const player2 = players[1];

  return (
    <div className="flex flex-col items-center gap-6">
      <h3 className="text-2xl font-bold text-gray-800">선공 결정 중...</h3>

      <div className="relative w-64 h-64">
        {/* 화살표 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-10">
          <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-red-500"></div>
        </div>

        {/* 돌림판 */}
        <div
          className={`w-64 h-64 rounded-full overflow-hidden shadow-2xl transition-transform ${
            isAnimating ? 'duration-[3000ms]' : 'duration-500'
          } ease-out`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* 플레이어 1 (빨강) */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-red-500 flex items-end justify-center pb-4">
            <div className="text-white font-bold text-xl">{player1?.nickname || '플레이어 1'}</div>
          </div>

          {/* 플레이어 2 (노랑) */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-yellow-400 flex items-start justify-center pt-4">
            <div className="text-gray-800 font-bold text-xl">{player2?.nickname || '플레이어 2'}</div>
          </div>
        </div>
      </div>

      <div className="text-gray-600 animate-pulse">돌림판이 회전하고 있습니다...</div>
    </div>
  );
}
