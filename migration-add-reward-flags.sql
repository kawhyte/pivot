-- Migration: Add reward flags to quest_progress table
-- This enables tiered reward system (Tier 1: Key, Tier 2: Bonus)

-- Add the columns with defaults
ALTER TABLE quest_progress
ADD COLUMN IF NOT EXISTS is_key_unlocked BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS is_bonus_unlocked BOOLEAN DEFAULT FALSE NOT NULL;

-- Backfill existing completed paths
-- All completed paths should have key unlocked (Tier 1)
UPDATE quest_progress
SET is_key_unlocked = TRUE
WHERE is_completed = TRUE
  AND is_key_unlocked = FALSE;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_quest_progress_unlock_flags
ON quest_progress(profile_id, is_key_unlocked, is_bonus_unlocked);

-- Verify the migration
SELECT profile_id, path_id, is_completed, is_key_unlocked, is_bonus_unlocked
FROM quest_progress
ORDER BY profile_id, path_id;
