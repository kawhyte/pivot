-- Add real-time progress tracking to active_sessions table
-- This allows users to resume mid-quiz with all progress intact

ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "completed_ids" jsonb;
ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "skipped_ids" jsonb;

-- Add comments for documentation
COMMENT ON COLUMN "active_sessions"."completed_ids" IS 'Array of puzzle IDs that have been correctly answered (real-time sync)';
COMMENT ON COLUMN "active_sessions"."skipped_ids" IS 'Array of puzzle IDs that have been skipped after 2 wrong attempts (real-time sync)';
