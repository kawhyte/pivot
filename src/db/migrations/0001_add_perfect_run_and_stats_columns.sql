-- Add new columns to active_sessions table for perfect run tracking and time tracking
ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "is_perfect_run_active" boolean DEFAULT false NOT NULL;
ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "perfect_run_start_score" integer DEFAULT 0 NOT NULL;
ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "perfect_run_streak" integer DEFAULT 0 NOT NULL;
ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "has_seen_threshold_modal" boolean DEFAULT false NOT NULL;
ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "total_time_spent" integer DEFAULT 0 NOT NULL;
ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "is_paused" boolean DEFAULT false NOT NULL;
ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "puzzle_attempts" jsonb;

-- Add new columns to quest_progress table for detailed stats
ALTER TABLE "quest_progress" ADD COLUMN IF NOT EXISTS "total_questions" integer DEFAULT 0 NOT NULL;
ALTER TABLE "quest_progress" ADD COLUMN IF NOT EXISTS "first_try_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "quest_progress" ADD COLUMN IF NOT EXISTS "first_try_rate" integer DEFAULT 0 NOT NULL;
ALTER TABLE "quest_progress" ADD COLUMN IF NOT EXISTS "skipped_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "quest_progress" ADD COLUMN IF NOT EXISTS "avg_time_per_question" integer DEFAULT 0 NOT NULL;
ALTER TABLE "quest_progress" ADD COLUMN IF NOT EXISTS "perfect_run_completed" boolean DEFAULT false NOT NULL;
ALTER TABLE "quest_progress" ADD COLUMN IF NOT EXISTS "threshold_decision" text;

-- Update unique indexes (drop old ones if they exist, create new ones)
DROP INDEX IF EXISTS "active_sessions_profile_path_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "active_sessions_profile_path_idx" ON "active_sessions" USING btree ("profile_id","path_id");

DROP INDEX IF EXISTS "quest_progress_profile_path_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "quest_progress_profile_path_idx" ON "quest_progress" USING btree ("profile_id","path_id");
