import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

// Environment variables (baked in at build time for NEXT_PUBLIC_*)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Runtime check helper
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Create browser client with cookie-based session management
// This client automatically handles cookies for session persistence
export const supabase: SupabaseClient = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

// Types for database tables - EXACTLY matching DB schema

// users table (20260114000001)
export interface DbUser {
  id: string;                    // UUID PRIMARY KEY
  google_id: string;             // VARCHAR(255) UNIQUE NOT NULL
  email: string;                 // VARCHAR(320) UNIQUE NOT NULL
  email_verified: boolean;       // BOOLEAN DEFAULT false
  display_name: string;          // VARCHAR(100) NOT NULL
  photo_url: string | null;      // TEXT
  current_title_id: number | null; // INTEGER (FK to titles)
  is_active: boolean;            // BOOLEAN DEFAULT true
  is_banned: boolean;            // BOOLEAN DEFAULT false
  ban_reason: string | null;     // TEXT
  created_at: string;            // TIMESTAMPTZ
  updated_at: string;            // TIMESTAMPTZ
  last_login_at: string | null;  // TIMESTAMPTZ (nullable)
  deleted_at: string | null;     // TIMESTAMPTZ
}

// user_statistics table (20260114000006)
export interface DbUserStatistics {
  user_id: string;               // UUID (PK part 1)
  game_mode_id: number;          // INTEGER (PK part 2)
  total_games: number;           // INTEGER DEFAULT 0
  wins: number;                  // INTEGER DEFAULT 0
  draws: number;                 // INTEGER DEFAULT 0
  losses: number;                // INTEGER DEFAULT 0
  win_rate: number;              // NUMERIC(5,2) GENERATED
  current_streak: number;        // INTEGER DEFAULT 0
  current_streak_type: 'win' | 'draw' | 'lose' | null; // VARCHAR(10)
  best_win_streak: number;       // INTEGER DEFAULT 0
  best_win_streak_date: string | null; // TIMESTAMPTZ
  updated_at: string;            // TIMESTAMPTZ
}

// titles table (20260114000003)
export interface DbTitle {
  id: number;                    // SERIAL PRIMARY KEY
  title_key: string;             // VARCHAR(100) UNIQUE NOT NULL
  display_name: string;          // VARCHAR(100) NOT NULL
  description: string;           // TEXT NOT NULL
  category: 'win_rate' | 'ai_wins' | 'streak' | 'total_games' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition_json: Record<string, unknown>; // JSONB NOT NULL
  icon_url: string | null;       // TEXT
  color_hex: string | null;      // VARCHAR(7)
  display_order: number;         // INTEGER DEFAULT 0
  is_active: boolean;            // BOOLEAN DEFAULT true
  created_at: string;            // TIMESTAMPTZ
}

// user_titles table (20260114000007)
export interface DbUserTitle {
  user_id: string;               // UUID (PK part 1)
  title_id: number;              // INTEGER (PK part 2)
  acquired_at: string;           // TIMESTAMPTZ DEFAULT NOW() - NOT earned_at!
  notification_sent: boolean;    // BOOLEAN DEFAULT false
  notification_read: boolean;    // BOOLEAN DEFAULT false
}

// leaderboard_cache table (20260114000008)
export interface DbLeaderboardCache {
  id: number;                    // SERIAL PRIMARY KEY
  user_id: string;               // UUID NOT NULL
  game_mode_id: number;          // INTEGER NOT NULL
  rank: number;                  // INTEGER NOT NULL
  total_games: number;           // INTEGER NOT NULL
  wins: number;                  // INTEGER NOT NULL
  win_rate: number;              // NUMERIC(5,2) NOT NULL
  display_name: string;          // VARCHAR(100) NOT NULL
  photo_url: string | null;      // TEXT
  current_title_name: string | null; // VARCHAR(100)
  last_refreshed_at: string;     // TIMESTAMPTZ
}

// game_modes table (20260114000002)
export interface DbGameMode {
  id: number;                    // SERIAL PRIMARY KEY
  mode_key: string;              // VARCHAR(50) UNIQUE NOT NULL
  display_name: string;          // VARCHAR(100) NOT NULL
  description: string | null;    // TEXT
  has_time_limit: boolean;       // BOOLEAN DEFAULT true
  time_limit_seconds: number | null; // INTEGER
  allows_undo: boolean;          // BOOLEAN DEFAULT false
  affects_ranking: boolean;      // BOOLEAN DEFAULT true
  opponent_type: 'ai' | 'player'; // VARCHAR(20) NOT NULL
  is_active: boolean;            // BOOLEAN DEFAULT true
  created_at: string;            // TIMESTAMPTZ
}

// Game result type
export type GameResult = 'win' | 'lose' | 'draw';

// Update user statistics after a game
export async function updateGameStats(
  userId: string,
  gameModeKey: string,
  result: GameResult
): Promise<{ success: boolean; error?: string }> {
  console.log('updateGameStats called:', { userId, gameModeKey, result });

  if (!isSupabaseConfigured()) {
    console.error('Supabase not configured');
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Check if user is authenticated
    const { data: { user: authUser } } = await supabase.auth.getUser();
    console.log('Current auth user:', authUser?.id, 'Requested user:', userId);

    if (!authUser || authUser.id !== userId) {
      console.error('User not authenticated or ID mismatch');
      return { success: false, error: 'User not authenticated' };
    }

    // First, get the game mode ID
    const { data: gameMode, error: gameModeError } = await supabase
      .from('game_modes')
      .select('id')
      .eq('mode_key', gameModeKey)
      .single();

    if (gameModeError || !gameMode) {
      console.error('Game mode not found:', gameModeKey, gameModeError);
      return { success: false, error: 'Game mode not found' };
    }

    console.log('Game mode found:', gameMode);

    const gameModeId = gameMode.id;

    // Check if user statistics exist for this game mode
    const { data: existingStats, error: fetchError } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId)
      .eq('game_mode_id', gameModeId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is OK
      console.error('Error fetching stats:', fetchError);
      return { success: false, error: 'Failed to fetch statistics' };
    }

    // Calculate new statistics
    const currentStats = existingStats || {
      total_games: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      current_streak: 0,
      current_streak_type: null,
      best_win_streak: 0,
      best_win_streak_date: null,
    };

    const newStats = {
      total_games: currentStats.total_games + 1,
      wins: currentStats.wins + (result === 'win' ? 1 : 0),
      draws: currentStats.draws + (result === 'draw' ? 1 : 0),
      losses: currentStats.losses + (result === 'lose' ? 1 : 0),
      current_streak: 0,
      current_streak_type: result as string,
      best_win_streak: currentStats.best_win_streak,
      best_win_streak_date: currentStats.best_win_streak_date,
      updated_at: new Date().toISOString(),
    };

    // Calculate streak
    if (result === currentStats.current_streak_type) {
      newStats.current_streak = currentStats.current_streak + 1;
    } else {
      newStats.current_streak = 1;
    }

    // Update best win streak if needed
    if (result === 'win' && newStats.current_streak > currentStats.best_win_streak) {
      newStats.best_win_streak = newStats.current_streak;
      newStats.best_win_streak_date = new Date().toISOString();
    }

    // Insert or update statistics
    if (existingStats) {
      console.log('Updating existing stats for user:', userId, 'mode:', gameModeId);
      const { error: updateError } = await supabase
        .from('user_statistics')
        .update(newStats)
        .eq('user_id', userId)
        .eq('game_mode_id', gameModeId);

      if (updateError) {
        console.error('Error updating stats:', updateError);
        return { success: false, error: `Failed to update statistics: ${updateError.message}` };
      }
      console.log('Stats updated successfully');
    } else {
      console.log('Inserting new stats for user:', userId, 'mode:', gameModeId);
      const { error: insertError } = await supabase
        .from('user_statistics')
        .insert({
          user_id: userId,
          game_mode_id: gameModeId,
          ...newStats,
        });

      if (insertError) {
        console.error('Error inserting stats:', insertError);
        return { success: false, error: `Failed to insert statistics: ${insertError.message}` };
      }
      console.log('Stats inserted successfully');
    }

    console.log(`Game stats updated for user ${userId}: ${result}`, newStats);
    return { success: true };
  } catch (err) {
    console.error('Error in updateGameStats:', err);
    return { success: false, error: 'Unexpected error' };
  }
}

// Get user statistics
export async function getUserStats(
  userId: string
): Promise<{ data: DbUserStatistics[] | null; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { data: null, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user stats:', error);
      return { data: null, error: error.message };
    }

    return { data };
  } catch (err) {
    console.error('Error in getUserStats:', err);
    return { data: null, error: 'Unexpected error' };
  }
}

// Check and award titles based on user stats
export async function checkAndAwardTitles(
  userId: string
): Promise<{ newTitles: DbTitle[]; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { newTitles: [], error: 'Supabase not configured' };
  }

  try {
    // Get all user statistics
    const { data: allStats } = await supabase
      .from('user_statistics')
      .select('*')
      .eq('user_id', userId);

    if (!allStats || allStats.length === 0) {
      return { newTitles: [] };
    }

    // Calculate aggregated stats
    const totalStats = allStats.reduce((acc, s) => ({
      total_games: acc.total_games + (s.total_games || 0),
      wins: acc.wins + (s.wins || 0),
      losses: acc.losses + (s.losses || 0),
      draws: acc.draws + (s.draws || 0),
      best_win_streak: Math.max(acc.best_win_streak, s.best_win_streak || 0),
    }), { total_games: 0, wins: 0, losses: 0, draws: 0, best_win_streak: 0 });

    const winRate = totalStats.total_games > 0
      ? (totalStats.wins / totalStats.total_games) * 100
      : 0;

    // Get AI mode stats specifically
    const { data: aiMode } = await supabase
      .from('game_modes')
      .select('id')
      .eq('mode_key', 'ai-ranked')
      .single();

    const aiStats = allStats.find(s => s.game_mode_id === aiMode?.id);
    const aiWins = aiStats?.wins || 0;

    // Get all titles
    const { data: allTitles } = await supabase
      .from('titles')
      .select('*')
      .eq('is_active', true);

    if (!allTitles) {
      return { newTitles: [] };
    }

    // Get already acquired titles
    const { data: acquiredTitles } = await supabase
      .from('user_titles')
      .select('title_id')
      .eq('user_id', userId);

    const acquiredTitleIds = new Set(acquiredTitles?.map(t => t.title_id) || []);

    // Check each title condition
    const newTitles: DbTitle[] = [];

    for (const title of allTitles) {
      if (acquiredTitleIds.has(title.id)) continue;

      const condition = title.condition_json as any;
      let earned = false;

      switch (condition.type) {
        case 'win_rate':
          if (totalStats.total_games >= (condition.min_games || 0) &&
              winRate >= condition.min &&
              winRate < (condition.max ?? 101)) {
            earned = true;
          }
          break;

        case 'ai_wins':
          if (aiWins >= condition.min) {
            earned = true;
          }
          break;

        case 'streak':
          if (totalStats.best_win_streak >= condition.min) {
            earned = true;
          }
          break;

        case 'total_games':
          if (totalStats.total_games >= condition.min) {
            earned = true;
          }
          break;

        case 'draws':
          if (totalStats.draws >= condition.min) {
            earned = true;
          }
          break;

        // Special conditions - simplified versions
        case 'flawless':
          if (totalStats.total_games >= condition.min_games &&
              totalStats.losses === 0 && totalStats.draws === 0) {
            earned = true;
          }
          break;
      }

      if (earned) {
        // Award the title
        const { error: insertError } = await supabase
          .from('user_titles')
          .insert({
            user_id: userId,
            title_id: title.id,
          });

        if (!insertError) {
          newTitles.push(title);
          console.log(`Awarded title: ${title.display_name} to user ${userId}`);
        }
      }
    }

    return { newTitles };
  } catch (err) {
    console.error('Error in checkAndAwardTitles:', err);
    return { newTitles: [], error: 'Unexpected error' };
  }
}

// Set user's representative title
export async function setUserTitle(
  userId: string,
  titleId: number | null
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Verify user owns this title (if not null)
    if (titleId !== null) {
      const { data: userTitle } = await supabase
        .from('user_titles')
        .select('title_id')
        .eq('user_id', userId)
        .eq('title_id', titleId)
        .single();

      if (!userTitle) {
        return { success: false, error: 'Title not owned' };
      }
    }

    // Update user's current title
    const { error } = await supabase
      .from('users')
      .update({ current_title_id: titleId })
      .eq('id', userId);

    if (error) {
      console.error('Error setting title:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error in setUserTitle:', err);
    return { success: false, error: 'Unexpected error' };
  }
}

// Get user's titles
export async function getUserTitles(
  userId: string
): Promise<{ titles: DbTitle[]; acquiredIds: number[]; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { titles: [], acquiredIds: [], error: 'Supabase not configured' };
  }

  try {
    // Get all titles
    const { data: allTitles } = await supabase
      .from('titles')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    // Get acquired titles
    const { data: userTitles } = await supabase
      .from('user_titles')
      .select('title_id')
      .eq('user_id', userId);

    return {
      titles: allTitles || [],
      acquiredIds: userTitles?.map(t => t.title_id) || [],
    };
  } catch (err) {
    console.error('Error in getUserTitles:', err);
    return { titles: [], acquiredIds: [], error: 'Unexpected error' };
  }
}
