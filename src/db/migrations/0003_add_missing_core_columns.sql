-- Add missing core columns to active_sessions table
-- These columns are required for real-time progress sync

ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "score" integer DEFAULT 0 NOT NULL;
ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "mistakes" integer DEFAULT 0 NOT NULL;
ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "attempts_made" integer DEFAULT 0 NOT NULL;
ALTER TABLE "active_sessions" ADD COLUMN IF NOT EXISTS "updated_at" timestamp with time zone DEFAULT now() NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN "active_sessions"."score" IS 'Current path score (real-time sync)';
COMMENT ON COLUMN "active_sessions"."mistakes" IS 'Total mistakes made, stored as mistakes * 10 (0.5 = 5, 1.0 = 10)';
COMMENT ON COLUMN "active_sessions"."attempts_made" IS 'Two-Strike counter (0 or 1)';
COMMENT ON COLUMN "active_sessions"."updated_at" IS 'Last sync timestamp';
