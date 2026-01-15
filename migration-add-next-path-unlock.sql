-- Migration: Add next_path_unlock_at to quest_progress table
-- This enables completion-based path unlocking

-- Add the column (nullable to allow backfilling)
ALTER TABLE quest_progress
ADD COLUMN IF NOT EXISTS next_path_unlock_at TIMESTAMP;

-- Backfill existing completed paths
-- Calculate 8am the day after completion
UPDATE quest_progress
SET next_path_unlock_at = DATE_TRUNC('day', completed_at + INTERVAL '1 day') + INTERVAL '8 hours'
WHERE is_completed = true
  AND completed_at IS NOT NULL
  AND path_id != 1  -- Pop Culture doesn't need unlock time (always available)
  AND next_path_unlock_at IS NULL;

-- Pop Culture (path_id = 1) should always have NULL unlock time
UPDATE quest_progress
SET next_path_unlock_at = NULL
WHERE path_id = 1;

-- Verify the migration
SELECT path_id, is_completed, completed_at, next_path_unlock_at
FROM quest_progress
ORDER BY path_id;
