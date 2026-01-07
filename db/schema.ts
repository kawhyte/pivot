import { pgTable, serial, text, boolean, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * Users table - stores secret code for access control
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  secretCode: text('secret_code').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Quest Progress table - tracks user progress across all 3 paths
 * Each path (1=Pop Culture, 2=Renaissance, 3=Heart) has completion status
 */
export const questProgress = pgTable('quest_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  pathId: integer('path_id').notNull(), // 1, 2, or 3
  isCompleted: boolean('is_completed').default(false).notNull(),
  currentLevel: integer('current_level').default(1).notNull(), // Which puzzle in the path
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userPathIdx: uniqueIndex('user_path_idx').on(table.userId, table.pathId),
}));

/**
 * TypeScript types inferred from schema
 */
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type QuestProgress = typeof questProgress.$inferSelect;
export type NewQuestProgress = typeof questProgress.$inferInsert;
