CREATE TABLE "active_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"path_id" integer NOT NULL,
	"current_puzzle_id" text,
	"shuffled_queue" jsonb,
	"attempts_made" integer DEFAULT 0 NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"mistakes" integer DEFAULT 0 NOT NULL,
	"is_perfect_run_active" boolean DEFAULT false NOT NULL,
	"perfect_run_start_score" integer DEFAULT 0 NOT NULL,
	"perfect_run_streak" integer DEFAULT 0 NOT NULL,
	"has_seen_threshold_modal" boolean DEFAULT false NOT NULL,
	"total_time_spent" integer DEFAULT 0 NOT NULL,
	"is_paused" boolean DEFAULT false NOT NULL,
	"puzzle_attempts" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"secret_code" text NOT NULL,
	"agent_name" text NOT NULL,
	"is_tester" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_secret_code_unique" UNIQUE("secret_code")
);
--> statement-breakpoint
CREATE TABLE "quest_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"path_id" integer NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_ids" jsonb,
	"skipped_ids" jsonb,
	"final_score" integer NOT NULL,
	"completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"time_taken" integer,
	"accuracy" integer,
	"mistakes" integer,
	"themed_title" text,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"first_try_count" integer DEFAULT 0 NOT NULL,
	"first_try_rate" integer DEFAULT 0 NOT NULL,
	"skipped_count" integer DEFAULT 0 NOT NULL,
	"avg_time_per_question" integer DEFAULT 0 NOT NULL,
	"perfect_run_completed" boolean DEFAULT false NOT NULL,
	"threshold_decision" text
);
--> statement-breakpoint
ALTER TABLE "active_sessions" ADD CONSTRAINT "active_sessions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quest_progress" ADD CONSTRAINT "quest_progress_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "active_sessions_profile_path_idx" ON "active_sessions" USING btree ("profile_id","path_id");--> statement-breakpoint
CREATE UNIQUE INDEX "quest_progress_profile_path_idx" ON "quest_progress" USING btree ("profile_id","path_id");