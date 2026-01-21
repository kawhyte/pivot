# Database Schema: Birthday Quest

> **Note:** This is the source of truth for the Supabase (PostgreSQL) architecture. 
> Treat `active_sessions` as the live/volatile state and `quest_progress` as the immutable archive once a path is 100% complete.

## 1. Table Definitions (SQL)

```sql
-- Profiles: User authentication and identity
CREATE TABLE public.profiles (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  secret_code text NOT NULL UNIQUE, -- The login entry key
  agent_name text NOT NULL,
  is_tester boolean NOT NULL DEFAULT false, -- Enables God Mode / Debugging
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Active Sessions: Real-time progress tracking (Volatile)
CREATE TABLE public.active_sessions (
  profile_id integer NOT NULL REFERENCES public.profiles(id),
  path_id integer NOT NULL,
  current_puzzle_id text,
  current_puzzle_attempts integer DEFAULT 0,
  shuffled_queue jsonb DEFAULT '{"skipped": [], "remaining": []}'::jsonb, -- See JSONB Definitions
  is_perfect_run_active boolean NOT NULL DEFAULT false, -- "Sudden Death" mode flag
  perfect_run_streak integer NOT NULL DEFAULT 0,
  score integer NOT NULL DEFAULT 0,
  mistakes integer NOT NULL DEFAULT 0,
  completed_ids jsonb, -- Array of successfully answered puzzle IDs
  skipped_ids jsonb,   -- Array of IDs skipped due to two-strike mercy
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, path_id)
);

-- Quest Progress: Historical records and path completion (Archive)
CREATE TABLE public.quest_progress (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id integer NOT NULL REFERENCES public.profiles(id),
  path_id integer NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  correct_first_try integer NOT NULL DEFAULT 0,
  final_score integer DEFAULT 0,
  themed_title text, -- Dynamic award title (e.g., "Grand Archivist")
  accuracy integer,   -- Calculated as (correct_first_try / total_questions) * 100
  completed_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Question Attempts: Granular log of every answer given
CREATE TABLE public.question_attempts (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id integer NOT NULL REFERENCES public.profiles(id),
  path_id integer NOT NULL,
  question_id text NOT NULL,
  attempt_number integer NOT NULL CHECK (attempt_number <= 10),
  is_correct boolean NOT NULL,
  answered_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Achievements: Unlocked badges and special rewards
CREATE TABLE public.achievements (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id integer NOT NULL REFERENCES public.profiles(id),
  achievement_type text NOT NULL, -- e.g., 'PERFECT_RUN', 'SPEED_DEMON'
  unlocked_at timestamp with time zone NOT NULL DEFAULT now()
);