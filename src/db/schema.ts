import { pgTable, serial, text, boolean, timestamp, integer, uniqueIndex, jsonb } from 'drizzle-orm/pg-core';

/**
 * Profiles table - Agent authentication and metadata
 */
export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  secretCode: text('secret_code').notNull().unique(),
  agentName: text('agent_name').notNull(),
  // REMOVED agentRole to match actual Supabase table
  isTester: boolean('is_tester').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Active Sessions table - Live progress tracking with shuffled queues
 * Synced on every answer submission for cross-device consistency
 */
export const activeSessions = pgTable('active_sessions', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  pathId: integer('path_id').notNull(), // 1, 2, or 3
  currentPuzzleId: text('current_puzzle_id'),
  shuffledQueue: jsonb('shuffled_queue'), // Array of puzzle IDs in randomized order
  attemptsMade: integer('attempts_made').default(0).notNull(), // Two-Strike counter (0 or 1)
  score: integer('score').default(0).notNull(), // Current path score
  mistakes: integer('mistakes').default(0).notNull(), // Stored as mistakes * 10 (0.5 = 5, 1.0 = 10)

  // Real-time progress tracking (NEW - for mid-quiz persistence)
  completedIds: jsonb('completed_ids'), // Array of completed puzzle IDs
  skippedIds: jsonb('skipped_ids'), // Array of skipped puzzle IDs

  // Perfect run state (91% → 100% optional challenge)
  isPerfectRunActive: boolean('is_perfect_run_active').default(false).notNull(),
  perfectRunStartScore: integer('perfect_run_start_score').default(0).notNull(),
  perfectRunStreak: integer('perfect_run_streak').default(0).notNull(),
  hasSeenThresholdModal: boolean('has_seen_threshold_modal').default(false).notNull(),

  // Time tracking (pause-aware, excludes tab-away time)
  totalTimeSpent: integer('total_time_spent').default(0).notNull(), // milliseconds
  isPaused: boolean('is_paused').default(false).notNull(),

  // Per-puzzle attempt tracking (JSONB: Record<puzzleId, PuzzleAttemptData>)
  puzzleAttempts: jsonb('puzzle_attempts'),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  activeSessionsProfilePathIdx: uniqueIndex('active_sessions_profile_path_idx').on(table.profileId, table.pathId),
}));

/**
 * Quest Progress table - Permanent completion records per path
 * Written once when path is mastered (91%+ threshold)
 */
export const questProgress = pgTable('quest_progress', {
  id: serial('id').primaryKey(),
  profileId: integer('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  pathId: integer('path_id').notNull(), // 1, 2, or 3
  isCompleted: boolean('is_completed').default(false).notNull(),
  completedIds: jsonb('completed_ids'), // Array of completed puzzle IDs
  skippedIds: jsonb('skipped_ids'), // Array of skipped puzzle IDs
  finalScore: integer('final_score').notNull(), // Final score at completion
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Performance tracking (existing)
  timeTaken: integer('time_taken'), // milliseconds
  accuracy: integer('accuracy'), // 0-100
  mistakes: integer('mistakes'), // Total mistakes (stored as mistakes * 10)
  themedTitle: text('themed_title'), // "Monica Approved 🧹", etc.

  // Detailed stats (NEW for enhanced stats screen)
  totalQuestions: integer('total_questions').default(0).notNull(),
  firstTryCount: integer('first_try_count').default(0).notNull(),
  firstTryRate: integer('first_try_rate').default(0).notNull(), // 0-100 percentage
  skippedCount: integer('skipped_count').default(0).notNull(),
  avgTimePerQuestion: integer('avg_time_per_question').default(0).notNull(), // milliseconds

  // Perfect run tracking (NEW)
  perfectRunCompleted: boolean('perfect_run_completed').default(false).notNull(),
  thresholdDecision: text('threshold_decision'), // '91%' | '100%' | 'abandoned'

  // Completion-based unlock system (NEW)
  nextPathUnlockAt: timestamp('next_path_unlock_at'), // When next path unlocks (8am day after completion)
}, (table) => ({
  questProgressProfilePathIdx: uniqueIndex('quest_progress_profile_path_idx').on(table.profileId, table.pathId),
}));

/**
 * TypeScript types inferred from schema
 */
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type ActiveSession = typeof activeSessions.$inferSelect;
export type NewActiveSession = typeof activeSessions.$inferInsert;
export type QuestProgress = typeof questProgress.$inferSelect;
export type NewQuestProgress = typeof questProgress.$inferInsert;
