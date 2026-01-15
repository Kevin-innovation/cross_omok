'use client';

import { useState } from 'react';

interface RankingUser {
  rank: number;
  nickname: string;
  wins: number;
  losses: number;
  winRate: number;
  title?: string;
}

// Mock data - will be replaced with Supabase data
const mockRankings: RankingUser[] = [
  { rank: 1, nickname: '연결왕', wins: 150, losses: 30, winRate: 83.3, title: '전설의 연결자' },
  { rank: 2, nickname: '포컨넥터', wins: 120, losses: 35, winRate: 77.4, title: '마스터' },
  { rank: 3, nickname: '승리요정', wins: 100, losses: 40, winRate: 71.4, title: '고수' },
  { rank: 4, nickname: 'Kevin', wins: 80, losses: 45, winRate: 64.0, title: '도전자' },
  { rank: 5, nickname: '게임러버', wins: 75, losses: 50, winRate: 60.0 },
  { rank: 6, nickname: '초보탈출', wins: 60, losses: 55, winRate: 52.2 },
  { rank: 7, nickname: '열정맨', wins: 55, losses: 60, winRate: 47.8 },
  { rank: 8, nickname: '뉴비킹', wins: 45, losses: 65, winRate: 40.9 },
  { rank: 9, nickname: '도전정신', wins: 40, losses: 70, winRate: 36.4 },
  { rank: 10, nickname: '시작이반', wins: 30, losses: 80, winRate: 27.3 },
];

export default function RankingPage() {
  const [selectedTab, setSelectedTab] = useState<'weekly' | 'monthly' | 'all'>('all');

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'bg-yellow-400', text: 'text-yellow-900', icon: '🥇' };
    if (rank === 2) return { bg: 'bg-gray-300', text: 'text-gray-900', icon: '🥈' };
    if (rank === 3) return { bg: 'bg-amber-600', text: 'text-amber-100', icon: '🥉' };
    return { bg: 'bg-gray-100', text: 'text-gray-700', icon: null };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 pt-16 pb-20">
      <div className="max-w-[500px] mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl shadow-2xl p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">랭킹</h1>

          {/* Tab Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
            {[
              { id: 'weekly', label: '주간' },
              { id: 'monthly', label: '월간' },
              { id: 'all', label: '전체' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as 'weekly' | 'monthly' | 'all')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ranking List */}
          <div className="space-y-2">
            {mockRankings.map((user) => {
              const badge = getRankBadge(user.rank);
              return (
                <div
                  key={user.rank}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    user.rank <= 3 ? 'bg-gradient-to-r from-gray-50 to-gray-100' : 'bg-gray-50'
                  }`}
                >
                  {/* Rank Badge */}
                  <div className={`w-10 h-10 rounded-full ${badge.bg} ${badge.text} flex items-center justify-center font-bold text-lg flex-shrink-0`}>
                    {badge.icon || user.rank}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 truncate">{user.nickname}</span>
                      {user.title && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                          {user.title}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.wins}승 {user.losses}패
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div className="text-right flex-shrink-0">
                    <div className={`text-lg font-bold ${
                      user.winRate >= 60 ? 'text-green-600' : user.winRate >= 50 ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {user.winRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-400">승률</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* My Ranking */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-2">내 순위</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <div className="font-bold text-gray-800">Kevin</div>
                  <div className="text-xs text-gray-500">80승 45패</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">64.0%</div>
                <div className="text-xs text-gray-400">승률</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
