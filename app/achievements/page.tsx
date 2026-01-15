'use client';

import { useState } from 'react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'wins' | 'special' | 'streak' | 'social';
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Mock data - will be replaced with Supabase data
const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: '첫 승리',
    description: '첫 번째 게임에서 승리하세요',
    icon: '🎉',
    category: 'wins',
    progress: 1,
    target: 1,
    unlocked: true,
    unlockedAt: '2025-01-10',
    rarity: 'common',
  },
  {
    id: '2',
    name: '10승 달성',
    description: '10번 승리하세요',
    icon: '🏆',
    category: 'wins',
    progress: 10,
    target: 10,
    unlocked: true,
    unlockedAt: '2025-01-12',
    rarity: 'common',
  },
  {
    id: '3',
    name: '50승 마스터',
    description: '50번 승리하세요',
    icon: '👑',
    category: 'wins',
    progress: 35,
    target: 50,
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: '4',
    name: '100승 전설',
    description: '100번 승리하세요',
    icon: '⭐',
    category: 'wins',
    progress: 35,
    target: 100,
    unlocked: false,
    rarity: 'epic',
  },
  {
    id: '5',
    name: '연속 3승',
    description: '3연승을 달성하세요',
    icon: '🔥',
    category: 'streak',
    progress: 3,
    target: 3,
    unlocked: true,
    unlockedAt: '2025-01-13',
    rarity: 'common',
  },
  {
    id: '6',
    name: '연속 5승',
    description: '5연승을 달성하세요',
    icon: '💪',
    category: 'streak',
    progress: 3,
    target: 5,
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: '7',
    name: '연속 10승',
    description: '10연승을 달성하세요',
    icon: '🌟',
    category: 'streak',
    progress: 3,
    target: 10,
    unlocked: false,
    rarity: 'legendary',
  },
  {
    id: '8',
    name: 'AI 정복자',
    description: 'AI를 10번 이기세요',
    icon: '🤖',
    category: 'special',
    progress: 5,
    target: 10,
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: '9',
    name: '스피드러너',
    description: '10턴 이내에 승리하세요',
    icon: '⚡',
    category: 'special',
    progress: 0,
    target: 1,
    unlocked: false,
    rarity: 'epic',
  },
  {
    id: '10',
    name: '역전의 명수',
    description: '역전승 5회 달성',
    icon: '🔄',
    category: 'special',
    progress: 2,
    target: 5,
    unlocked: false,
    rarity: 'rare',
  },
  {
    id: '11',
    name: '친선 경기',
    description: '친구와 10판 플레이',
    icon: '🤝',
    category: 'social',
    progress: 3,
    target: 10,
    unlocked: false,
    rarity: 'common',
  },
  {
    id: '12',
    name: '재대결 마스터',
    description: '재대결 20회 진행',
    icon: '🔁',
    category: 'social',
    progress: 8,
    target: 20,
    unlocked: false,
    rarity: 'rare',
  },
];

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'wins' | 'special' | 'streak' | 'social'>('all');

  const getRarityStyle = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-200 to-amber-300 border-yellow-400';
      case 'epic':
        return 'bg-gradient-to-r from-purple-200 to-purple-300 border-purple-400';
      case 'rare':
        return 'bg-gradient-to-r from-blue-200 to-blue-300 border-blue-400';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const getRarityLabel = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'legendary': return { text: '전설', color: 'text-yellow-700 bg-yellow-100' };
      case 'epic': return { text: '영웅', color: 'text-purple-700 bg-purple-100' };
      case 'rare': return { text: '희귀', color: 'text-blue-700 bg-blue-100' };
      default: return { text: '일반', color: 'text-gray-600 bg-gray-100' };
    }
  };

  const filteredAchievements = selectedCategory === 'all'
    ? mockAchievements
    : mockAchievements.filter(a => a.category === selectedCategory);

  const unlockedCount = mockAchievements.filter(a => a.unlocked).length;
  const totalCount = mockAchievements.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 pt-16 pb-20">
      <div className="max-w-[500px] mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl shadow-2xl p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">업적</h1>

          {/* Progress Summary */}
          <div className="mb-4 text-center">
            <div className="text-sm text-gray-500">달성률</div>
            <div className="text-3xl font-bold text-blue-600">
              {unlockedCount}/{totalCount}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { id: 'all', label: '전체' },
              { id: 'wins', label: '승리' },
              { id: 'streak', label: '연승' },
              { id: 'special', label: '특별' },
              { id: 'social', label: '소셜' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Achievements List */}
          <div className="space-y-3">
            {filteredAchievements.map((achievement) => {
              const rarityLabel = getRarityLabel(achievement.rarity);
              return (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    achievement.unlocked
                      ? getRarityStyle(achievement.rarity)
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                      achievement.unlocked ? 'bg-white/50' : 'bg-gray-200 grayscale'
                    }`}>
                      {achievement.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold ${achievement.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                          {achievement.name}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${rarityLabel.color}`}>
                          {rarityLabel.text}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{achievement.description}</p>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>

                      {achievement.unlocked && achievement.unlockedAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          달성일: {achievement.unlockedAt}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
