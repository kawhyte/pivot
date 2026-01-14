import { db } from '@/db';
import { activeSessions, questProgress, profiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import type { PathId } from '@/lib/paths';

/**
 * Fetch or create active session for a path
 */
export async function getOrCreateSession(profileId: number, pathId: PathId) {
  if (!db) return null;

  try {
    // Try to fetch existing session
    const existing = await db
      .select()
      .from(activeSessions)
      .where(
        and(
          eq(activeSessions.profileId, profileId),
          eq(activeSessions.pathId, pathId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new session
    const newSession = await db
      .insert(activeSessions)
      .values({
        profileId,
        pathId,
        currentPuzzleId: null,
        shuffledQueue: null,
        attemptsMade: 0,
        score: 0,
        mistakes: 0,
      })
      .returning();

    return newSession[0];
  } catch (error) {
    console.error('Error getting/creating session:', error);
    return null;
  }
}

/**
 * Update active session with current progress
 * Uses onConflictDoUpdate for atomic upserts
 */
export async function syncSessionProgress(
  profileId: number,
  pathId: PathId,
  updates: {
    currentPuzzleId?: string | null;
    shuffledQueue?: string[];
    attemptsMade?: number;
    score?: number;
    mistakes?: number;
  }
) {
  if (!db) return false;

  try {
    await db
      .insert(activeSessions)
      .values({
        profileId,
        pathId,
        ...updates,
      })
      .onConflictDoUpdate({
        target: [activeSessions.profileId, activeSessions.pathId],
        set: {
          ...updates,
          updatedAt: new Date(),
        },
      });

    return true;
  } catch (error) {
    console.error('Error syncing session progress:', error);
    return false;
  }
}

/**
 * Fetch quest progress (completed paths) for a profile
 */
export async function fetchQuestProgress(profileId: number) {
  if (!db) return [];

  try {
    const progress = await db
      .select()
      .from(questProgress)
      .where(eq(questProgress.profileId, profileId));

    return progress;
  } catch (error) {
    console.error('Error fetching quest progress:', error);
    return [];
  }
}

/**
 * Save completed path to quest_progress table
 */
export async function savePathCompletion(
  profileId: number,
  pathId: PathId,
  data: {
    completedIds: string[];
    skippedIds: string[];
    finalScore: number;
    accuracy: number;
    mistakes: number;
    themedTitle: string;
  }
) {
  if (!db) return false;

  try {
    await db
      .insert(questProgress)
      .values({
        profileId,
        pathId,
        isCompleted: true,
        completedIds: JSON.stringify(data.completedIds),
        skippedIds: JSON.stringify(data.skippedIds),
        finalScore: data.finalScore,
        completedAt: new Date(),
        accuracy: data.accuracy,
        mistakes: Math.round(data.mistakes * 10), // Store as integer (0.5 = 5, 1.0 = 10)
        themedTitle: data.themedTitle,
      })
      .onConflictDoUpdate({
        target: [questProgress.profileId, questProgress.pathId],
        set: {
          isCompleted: true,
          completedIds: JSON.stringify(data.completedIds),
          skippedIds: JSON.stringify(data.skippedIds),
          finalScore: data.finalScore,
          completedAt: new Date(),
          accuracy: data.accuracy,
          mistakes: Math.round(data.mistakes * 10),
          themedTitle: data.themedTitle,
          updatedAt: new Date(),
        },
      });

    return true;
  } catch (error) {
    console.error('Error saving path completion:', error);
    return false;
  }
}

/**
 * Fetch profile with isTester flag
 */
export async function fetchProfile(profileId: number) {
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, profileId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}
