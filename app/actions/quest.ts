'use server';

import { db } from '@/db';
import { users, questProgress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new user with a unique secret code
 * Returns the created user ID
 */
export async function createUser(): Promise<number> {
  try {
    const secretCode = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const [newUser] = await db
      .insert(users)
      .values({ secretCode })
      .returning({ id: users.id });

    return newUser.id;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw new Error('Failed to create user');
  }
}

/**
 * Syncs path completion to the database
 * Uses upsert pattern to handle duplicate entries
 */
export async function syncPathCompletion(
  userId: number,
  pathId: number
): Promise<void> {
  try {
    // Check if record exists
    const existing = await db
      .select()
      .from(questProgress)
      .where(
        and(
          eq(questProgress.userId, userId),
          eq(questProgress.pathId, pathId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record
      await db
        .update(questProgress)
        .set({
          isCompleted: true,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(questProgress.userId, userId),
            eq(questProgress.pathId, pathId)
          )
        );
    } else {
      // Insert new record
      await db.insert(questProgress).values({
        userId,
        pathId,
        isCompleted: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Revalidate admin page cache
    revalidatePath('/admin');
  } catch (error) {
    console.error('Failed to sync path completion:', error);
    // Don't throw - fail silently to not block UI
  }
}

/**
 * Updates the current level for a path (puzzle progress)
 */
export async function syncPathLevel(
  userId: number,
  pathId: number,
  level: number
): Promise<void> {
  try {
    const existing = await db
      .select()
      .from(questProgress)
      .where(
        and(
          eq(questProgress.userId, userId),
          eq(questProgress.pathId, pathId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(questProgress)
        .set({
          currentLevel: level,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(questProgress.userId, userId),
            eq(questProgress.pathId, pathId)
          )
        );
    } else {
      await db.insert(questProgress).values({
        userId,
        pathId,
        currentLevel: level,
        isCompleted: false,
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Failed to sync path level:', error);
  }
}

/**
 * Fetches all completed paths for a user
 * Returns array of completed path IDs
 */
export async function fetchUserProgress(userId: number): Promise<number[]> {
  try {
    const progress = await db
      .select({
        pathId: questProgress.pathId,
      })
      .from(questProgress)
      .where(
        and(
          eq(questProgress.userId, userId),
          eq(questProgress.isCompleted, true)
        )
      );

    return progress.map((p) => p.pathId);
  } catch (error) {
    console.error('Failed to fetch user progress:', error);
    return [];
  }
}

/**
 * Fetches detailed progress for a user (for admin dashboard)
 */
export async function fetchDetailedProgress(userId: number) {
  try {
    const progress = await db
      .select()
      .from(questProgress)
      .where(eq(questProgress.userId, userId));

    return progress;
  } catch (error) {
    console.error('Failed to fetch detailed progress:', error);
    return [];
  }
}

/**
 * Fetches all users and their progress (for admin dashboard)
 */
export async function fetchAllProgress() {
  try {
    const allUsers = await db.select().from(users);

    const progressData = await Promise.all(
      allUsers.map(async (user) => {
        const progress = await db
          .select()
          .from(questProgress)
          .where(eq(questProgress.userId, user.id));

        return {
          user,
          progress,
        };
      })
    );

    return progressData;
  } catch (error) {
    console.error('Failed to fetch all progress:', error);
    return [];
  }
}
