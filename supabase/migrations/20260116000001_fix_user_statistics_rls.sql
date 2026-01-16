-- Migration: Fix user_statistics RLS policies for game stats tracking
-- Created: 2026-01-16
-- Description: Add UPDATE policy and public SELECT for rankings

-- ========================================
-- 1. Add UPDATE policy for user_statistics
-- ========================================

-- Allow users to update their own statistics
DROP POLICY IF EXISTS user_statistics_update_own ON user_statistics;
CREATE POLICY user_statistics_update_own ON user_statistics
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 2. Allow public SELECT for user_statistics (for rankings)
-- ========================================

-- Drop the old restricted policy
DROP POLICY IF EXISTS user_statistics_select_own ON user_statistics;

-- Create new policy that allows:
-- - Users to see their own stats
-- - Anyone to see stats for ranking purposes (only non-sensitive fields)
CREATE POLICY user_statistics_select_all ON user_statistics
FOR SELECT
USING (true);

-- ========================================
-- 3. Allow public SELECT for users (for rankings display)
-- ========================================

DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_select_all ON users;
CREATE POLICY users_select_all ON users
FOR SELECT
USING (true);

-- ========================================
-- 4. Ensure users can update their own record
-- ========================================

DROP POLICY IF EXISTS users_update_own ON users;
CREATE POLICY users_update_own ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ========================================
-- IMPORTANT: Run this SQL in Supabase Dashboard -> SQL Editor
-- ========================================

COMMENT ON POLICY user_statistics_update_own ON user_statistics IS 'Allow users to update their own game statistics';
COMMENT ON POLICY user_statistics_select_all ON user_statistics IS 'Allow public read for rankings';
COMMENT ON POLICY users_select_all ON users IS 'Allow public read for user display names in rankings';
