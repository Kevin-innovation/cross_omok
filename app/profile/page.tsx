'use client';

import { useAuth } from '@/contexts/AuthContext';

interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  currentStreak: number;
  bestStreak: number;
  rank: number;
  title: string;
}

// Mock data - will be replaced with Supabase data
const mockStats: UserStats = {
  totalGames: 125,
  wins: 80,
  losses: 40,
  draws: 5,
  winRate: 64.0,
  currentStreak: 3,
  bestStreak: 7,
  rank: 4,
  title: '도전자',
};

export default function ProfilePage() {
  const { user, isLoggedIn, openLoginModal } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 pt-16 pb-20">
        <div className="max-w-[500px] mx-auto px-4 py-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-500 mb-6">프로필을 보려면 로그인해주세요</p>
            <button
              onClick={openLoginModal}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 pt-16 pb-20">
      <div className="max-w-[500px] mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl shadow-2xl p-4">
          {/* Profile Header */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.nickname}
                  className="w-24 h-24 rounded-full mx-auto mb-3"
                />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.nickname.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-lg">
                {mockStats.rank}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{user?.nickname}</h1>
            <div className="inline-block mt-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {mockStats.title}
            </div>
            {user?.email && (
              <p className="text-sm text-gray-500 mt-2">{user.email}</p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{mockStats.totalGames}</div>
              <div className="text-xs text-gray-500">총 게임</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{mockStats.winRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">승률</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">#{mockStats.rank}</div>
              <div className="text-xs text-gray-500">랭킹</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{mockStats.bestStreak}</div>
              <div className="text-xs text-gray-500">최대 연승</div>
            </div>
          </div>

          {/* Win/Loss/Draw */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">전적</span>
              <span className="text-sm text-gray-500">{mockStats.wins}승 {mockStats.losses}패 {mockStats.draws}무</span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden">
              <div
                className="bg-green-500"
                style={{ width: `${(mockStats.wins / mockStats.totalGames) * 100}%` }}
              />
              <div
                className="bg-red-500"
                style={{ width: `${(mockStats.losses / mockStats.totalGames) * 100}%` }}
              />
              <div
                className="bg-gray-400"
                style={{ width: `${(mockStats.draws / mockStats.totalGames) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs">
              <span className="text-green-600">승리 {mockStats.wins}</span>
              <span className="text-red-600">패배 {mockStats.losses}</span>
              <span className="text-gray-500">무승부 {mockStats.draws}</span>
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-orange-700">현재 연승</div>
                <div className="text-3xl font-bold text-orange-600">{mockStats.currentStreak}연승</div>
              </div>
              <div className="text-4xl">🔥</div>
            </div>
          </div>

          {/* Settings */}
          <div className="mt-6 space-y-2">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="text-gray-700 font-medium">프로필 수정</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="text-gray-700 font-medium">설정</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
              <span className="text-gray-700 font-medium">게임 기록</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
