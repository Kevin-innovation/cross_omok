import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface DbUser {
  id: string;
  google_id: string;
  email: string;
  email_verified: boolean;
  display_name: string;
  photo_url: string | null;
  current_title_id: number | null;
  is_active: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string;
  deleted_at: string | null;
}

export interface DbUserStatistics {
  id: number;
  user_id: string;
  game_mode_id: number;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  current_streak: number;
  best_win_streak: number;
  best_lose_streak: number;
  total_moves: number;
  avg_moves_per_game: number;
  fastest_win_moves: number | null;
  total_play_time_seconds: number;
  avg_play_time_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface DbTitle {
  id: number;
  title_key: string;
  display_name: string;
  description: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition_json: Record<string, unknown>;
  color_hex: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface DbUserTitle {
  id: number;
  user_id: string;
  title_id: number;
  earned_at: string;
  is_active: boolean;
}

export interface DbLeaderboardCache {
  id: number;
  user_id: string;
  game_mode_id: number;
  rank: number;
  display_name: string;
  current_title_id: number | null;
  current_title_name: string | null;
  total_games: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
  best_win_streak: number;
  cached_at: string;
}

export interface DbGameResult {
  id: number;
  room_id: string;
  game_mode_id: number;
  player1_id: string;
  player2_id: string | null;
  winner_id: string | null;
  loser_id: string | null;
  result_type: 'win' | 'draw' | 'timeout' | 'disconnect' | 'forfeit';
  total_moves: number;
  game_duration_seconds: number;
  final_board_state: unknown;
  started_at: string;
  ended_at: string;
  created_at: string;
}
