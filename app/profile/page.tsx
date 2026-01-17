'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase, DbUserStatistics, DbTitle, getUserTitles, setUserTitle } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// 통계 타입 정의
interface GameModeStats {
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  current_streak: number;
  current_streak_type: string | null;
  best_win_streak: number;
}

export default function ProfilePage() {
  const { user, dbUser, isLoggedIn, openLoginModal, signOut, refreshDbUser } = useAuth();
  const [aiStats, setAiStats] = useState<GameModeStats | null>(null);
  const [pvpStats, setPvpStats] = useState<GameModeStats | null>(null);
  const [totalStats, setTotalStats] = useState<GameModeStats | null>(null);
  const [currentTitle, setCurrentTitle] = useState<DbTitle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allTitles, setAllTitles] = useState<DbTitle[]>([]);
  const [acquiredTitleIds, setAcquiredTitleIds] = useState<number[]>([]);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [isSettingTitle, setIsSettingTitle] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      if (!mountedRef.current) return;
      setIsLoading(true);

      try {
        // Get game mode IDs for both AI and PvP
        const { data: gameModes } = await supabase
          .from('game_modes')
          .select('id, mode_key')
          .in('mode_key', ['ai-ranked', 'player-ranked']);

        if (!mountedRef.current) return;

        const aiModeId = gameModes?.find(m => m.mode_key === 'ai-ranked')?.id;
        const pvpModeId = gameModes?.find(m => m.mode_key === 'player-ranked')?.id;

        console.log('Game modes found:', { aiModeId, pvpModeId });

        // Fetch all user statistics
        const { data: allUserStats, error: statsError } = await supabase
          .from('user_statistics')
          .select('*')
          .eq('user_id', user.id);

        if (statsError) {
          console.error('Error fetching stats:', statsError);
        }

        console.log('User stats fetched:', allUserStats);

        if (!mountedRef.current) return;

        // Helper function to create stats object
        const createStats = (stat: any): GameModeStats => ({
          total_games: stat?.total_games || 0,
          wins: stat?.wins || 0,
          losses: stat?.losses || 0,
          draws: stat?.draws || 0,
          win_rate: stat?.total_games > 0
            ? (stat.wins / stat.total_games) * 100
            : 0,
          current_streak: stat?.current_streak || 0,
          current_streak_type: stat?.current_streak_type || null,
          best_win_streak: stat?.best_win_streak || 0,
        });

        // Find AI stats
        const aiStatData = allUserStats?.find(s => s.game_mode_id === aiModeId);
        const aiStatsResult = aiStatData ? createStats(aiStatData) : null;
        setAiStats(aiStatsResult);
        console.log('AI Stats:', aiStatsResult);

        // Find PvP stats
        const pvpStatData = allUserStats?.find(s => s.game_mode_id === pvpModeId);
        const pvpStatsResult = pvpStatData ? createStats(pvpStatData) : null;
        setPvpStats(pvpStatsResult);
        console.log('PvP Stats:', pvpStatsResult);

        // Calculate total stats
        if (allUserStats && allUserStats.length > 0) {
          const aggregated = allUserStats.reduce((acc, s) => ({
            total_games: acc.total_games + (s.total_games || 0),
            wins: acc.wins + (s.wins || 0),
            losses: acc.losses + (s.losses || 0),
            draws: acc.draws + (s.draws || 0),
            best_win_streak: Math.max(acc.best_win_streak, s.best_win_streak || 0),
          }), { total_games: 0, wins: 0, losses: 0, draws: 0, best_win_streak: 0 });

          if (aggregated.total_games > 0) {
            setTotalStats({
              ...aggregated,
              win_rate: (aggregated.wins / aggregated.total_games) * 100,
              current_streak: 0,
              current_streak_type: null,
            });
          } else {
            setTotalStats(null);
          }
        } else {
          setTotalStats(null);
        }

        // Fetch current title if user has one
        if (dbUser?.current_title_id) {
          const { data: titleData } = await supabase
            .from('titles')
            .select('*')
            .eq('id', dbUser.current_title_id)
            .single();

          if (mountedRef.current) {
            setCurrentTitle(titleData || null);
          }
        } else {
          setCurrentTitle(null);
        }

        // Fetch all titles and acquired titles
        const { titles, acquiredIds } = await getUserTitles(user.id);
        if (mountedRef.current) {
          setAllTitles(titles);
          setAcquiredTitleIds(acquiredIds);
        }

      } catch (err) {
        console.error('Error fetching profile data:', err);
      }

      if (mountedRef.current) {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.id, dbUser?.current_title_id]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-blue-500 to-purple-600">
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

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="max-w-[500px] mx-auto px-4 py-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 통계 컴포넌트 - AI용
  const AiStatsCard = ({ stats }: { stats: GameModeStats | null }) => {
    if (!stats || stats.total_games === 0) {
      return (
        <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🤖</span>
            <span className="text-sm font-bold text-purple-700">AI 대전</span>
          </div>
          <p className="text-xs text-gray-500 text-center py-2">기록 없음</p>
        </div>
      );
    }

    return (
      <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <span className="text-sm font-bold text-purple-700">AI 대전</span>
          </div>
          <span className="text-lg font-bold text-purple-600">
            {stats.win_rate.toFixed(0)}%
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-green-600">{stats.wins}승</span>
          <span className="text-red-600">{stats.losses}패</span>
          <span className="text-gray-500">{stats.draws}무</span>
        </div>
        <div className="text-[10px] text-gray-400 mt-1">총 {stats.total_games}게임</div>
        {/* Progress bar */}
        <div className="flex h-2 rounded-full overflow-hidden mt-2 bg-gray-200">
          {stats.total_games > 0 && (
            <>
              <div
                className="bg-green-500"
                style={{ width: `${(stats.wins / stats.total_games) * 100}%` }}
              />
              <div
                className="bg-red-500"
                style={{ width: `${(stats.losses / stats.total_games) * 100}%` }}
              />
              <div
                className="bg-gray-400"
                style={{ width: `${(stats.draws / stats.total_games) * 100}%` }}
              />
            </>
          )}
        </div>
      </div>
    );
  };

  // 통계 컴포넌트 - PvP용
  const PvpStatsCard = ({ stats }: { stats: GameModeStats | null }) => {
    if (!stats || stats.total_games === 0) {
      return (
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚔️</span>
            <span className="text-sm font-bold text-blue-700">PvP 대전</span>
          </div>
          <p className="text-xs text-gray-500 text-center py-2">기록 없음</p>
        </div>
      );
    }

    return (
      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚔️</span>
            <span className="text-sm font-bold text-blue-700">PvP 대전</span>
          </div>
          <span className="text-lg font-bold text-blue-600">
            {stats.win_rate.toFixed(0)}%
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-green-600">{stats.wins}승</span>
          <span className="text-red-600">{stats.losses}패</span>
          <span className="text-gray-500">{stats.draws}무</span>
        </div>
        <div className="text-[10px] text-gray-400 mt-1">총 {stats.total_games}게임</div>
        {/* Progress bar */}
        <div className="flex h-2 rounded-full overflow-hidden mt-2 bg-gray-200">
          {stats.total_games > 0 && (
            <>
              <div
                className="bg-green-500"
                style={{ width: `${(stats.wins / stats.total_games) * 100}%` }}
              />
              <div
                className="bg-red-500"
                style={{ width: `${(stats.losses / stats.total_games) * 100}%` }}
              />
              <div
                className="bg-gray-400"
                style={{ width: `${(stats.draws / stats.total_games) * 100}%` }}
              />
            </>
          )}
        </div>
      </div>
    );
  };

  const totalGames = totalStats?.total_games || 0;
  const totalWins = totalStats?.wins || 0;
  const totalWinRate = totalStats?.win_rate || 0;
  const bestStreak = totalStats?.best_win_streak || 0;

  // 연승 계산 (AI 또는 PvP 중 현재 연승)
  const currentStreak = Math.max(
    aiStats?.current_streak_type === 'win' ? aiStats.current_streak : 0,
    pvpStats?.current_streak_type === 'win' ? pvpStats.current_streak : 0
  );

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-[500px] mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl shadow-2xl p-4">
          {/* Profile Header */}
          <div className="text-center mb-4">
            <div className="relative inline-block">
              {user?.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={user.nickname}
                  className="w-20 h-20 rounded-full mx-auto mb-2 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full mx-auto mb-2 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.nickname.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-800">{user?.nickname}</h1>
            {currentTitle && (
              <div
                className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: currentTitle.color_hex ? `${currentTitle.color_hex}20` : undefined,
                  color: currentTitle.color_hex || undefined,
                }}
              >
                {currentTitle.display_name}
              </div>
            )}
            {user?.email && (
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            )}
          </div>

          {/* Total Stats Summary */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-blue-600">{totalGames}</div>
              <div className="text-[10px] text-gray-500">총 게임</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-600">{totalWins}</div>
              <div className="text-[10px] text-gray-500">총 승리</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-purple-600">{totalWinRate.toFixed(0)}%</div>
              <div className="text-[10px] text-gray-500">총 승률</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-orange-600">{bestStreak}</div>
              <div className="text-[10px] text-gray-500">최대 연승</div>
            </div>
          </div>

          {/* AI vs PvP Stats - Side by Side */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <AiStatsCard stats={aiStats} />
            <PvpStatsCard stats={pvpStats} />
          </div>

          {/* Current Streak - 연승일 때만 표시 */}
          {currentStreak > 0 && (
            <div className="bg-orange-50 rounded-xl p-3 border-2 border-orange-200 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-orange-700">현재 연승</div>
                  <div className="text-2xl font-bold text-orange-600">{currentStreak}연승</div>
                </div>
                <div className="text-3xl">🔥</div>
              </div>
            </div>
          )}

          {/* No games played message */}
          {totalGames === 0 && (
            <div className="bg-blue-50 rounded-xl p-4 mb-4 text-center">
              <p className="text-blue-600 font-medium">아직 플레이한 게임이 없습니다.</p>
              <p className="text-sm text-blue-500 mt-1">게임을 시작해 통계를 쌓아보세요!</p>
            </div>
          )}

          {/* Title Section */}
          <div className="bg-purple-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-purple-700">대표 칭호</span>
              <button
                onClick={() => setShowTitleModal(true)}
                className="text-xs text-purple-600 hover:text-purple-800 font-medium"
              >
                칭호 변경
              </button>
            </div>
            {currentTitle ? (
              <div
                className="inline-block px-3 py-1.5 rounded-full font-medium"
                style={{
                  backgroundColor: currentTitle.color_hex ? `${currentTitle.color_hex}30` : '#e9d5ff',
                  color: currentTitle.color_hex || '#7c3aed',
                }}
              >
                {currentTitle.display_name}
              </div>
            ) : (
              <p className="text-sm text-purple-500">칭호가 설정되지 않았습니다</p>
            )}
            <p className="text-xs text-purple-400 mt-2">
              획득한 칭호: {acquiredTitleIds.length} / {allTitles.length}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-red-600"
            >
              <span className="font-medium">로그아웃</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Title Selection Modal */}
      {showTitleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">칭호 선택</h2>
              <button
                onClick={() => setShowTitleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Clear title option */}
            <button
              onClick={async () => {
                if (!user?.id || isSettingTitle) return;
                setIsSettingTitle(true);
                const result = await setUserTitle(user.id, null);
                if (result.success) {
                  setCurrentTitle(null);
                  await refreshDbUser();
                }
                setIsSettingTitle(false);
                setShowTitleModal(false);
              }}
              disabled={isSettingTitle}
              className={`w-full p-3 mb-2 rounded-xl border-2 transition-colors ${
                !currentTitle
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-sm text-gray-600">칭호 없음</span>
            </button>

            {/* Title list */}
            <div className="space-y-2">
              {allTitles.map((title) => {
                const isAcquired = acquiredTitleIds.includes(title.id);
                const isSelected = currentTitle?.id === title.id;

                return (
                  <button
                    key={title.id}
                    onClick={async () => {
                      if (!isAcquired || !user?.id || isSettingTitle) return;
                      setIsSettingTitle(true);
                      const result = await setUserTitle(user.id, title.id);
                      if (result.success) {
                        setCurrentTitle(title);
                        await refreshDbUser();
                      }
                      setIsSettingTitle(false);
                      setShowTitleModal(false);
                    }}
                    disabled={!isAcquired || isSettingTitle}
                    className={`w-full p-3 rounded-xl border-2 transition-colors text-left ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : isAcquired
                        ? 'border-gray-200 hover:border-purple-300'
                        : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div
                          className="font-medium"
                          style={{ color: isAcquired ? (title.color_hex || '#374151') : '#9ca3af' }}
                        >
                          {title.display_name}
                          {isSelected && <span className="ml-2 text-purple-500">✓</span>}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{title.description}</div>
                      </div>
                      {!isAcquired && (
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-500 rounded-full">
                          미획득
                        </span>
                      )}
                    </div>
                    {/* Rarity badge */}
                    <div className="mt-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          title.rarity === 'legendary'
                            ? 'bg-yellow-100 text-yellow-700'
                            : title.rarity === 'epic'
                            ? 'bg-purple-100 text-purple-700'
                            : title.rarity === 'rare'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {title.rarity === 'legendary' ? '전설' :
                         title.rarity === 'epic' ? '영웅' :
                         title.rarity === 'rare' ? '희귀' : '일반'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {allTitles.length === 0 && (
              <p className="text-center text-gray-500 py-4">등록된 칭호가 없습니다.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
