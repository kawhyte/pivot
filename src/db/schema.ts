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
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  profilePathIdx: uniqueIndex('profile_path_idx').on(table.profileId, table.pathId),
}));

/**
 * Quest Progress table - Permanent completion records per path
 * Written once when path is mastered (93%+ threshold)
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
  // Performance tracking
  timeTaken: integer('time_taken'), // milliseconds
  accuracy: integer('accuracy'), // 0-100
  mistakes: integer('mistakes'), // Total mistakes (stored as mistakes * 10)
  themedTitle: text('themed_title'), // "Monica Approved 🧹", etc.
}, (table) => ({
  profilePathIdx: uniqueIndex('profile_path_idx').on(table.profileId, table.pathId),
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
