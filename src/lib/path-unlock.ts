// src/lib/path-unlock.ts
import { PATH_IDS, type PathId } from '@/lib/paths';

/**
 * Path dependency chain - UPDATED: All paths are now top-level
 * and have no dependencies to allow any-order play.
 */
export const PATH_DEPENDENCIES: Record<PathId, PathId | null> = {
  [PATH_IDS.POP_CULTURE]: null,
  [PATH_IDS.RENAISSANCE]: null, 
  [PATH_IDS.HEART]: null,
};

/**
 * Calculate next path unlock time.
 * For All-Access mode, we return the current time to signify
 * that the next path is available immediately.
 */
export const calculateNextPathUnlockTime = (completedAt: Date): Date => {
  return completedAt; 
};

/**
 * Get unlocked paths based on completion status.
 * REFACTORED: Now returns all paths immediately to support 
 * non-linear progression.
 */
export const getUnlockedPaths = (
  _completedPaths: Array<{ pathId: PathId; completedAt: string; nextPathUnlockAt?: string }>,
  _isTester: boolean = false
): PathId[] => {
  // Always return all paths to allow the user to pick any order.
  return [PATH_IDS.POP_CULTURE, PATH_IDS.RENAISSANCE, PATH_IDS.HEART];
};

/**
 * Check if a specific path is unlocked.
 * Simplifies to a membership check of the all-access list.
 */
export const isPathUnlocked = (
  pathId: PathId,
  _completedPaths: Array<{ pathId: PathId; completedAt: string; nextPathUnlockAt?: string }>,
  _isTester: boolean = false
): boolean => {
  return [PATH_IDS.POP_CULTURE, PATH_IDS.RENAISSANCE, PATH_IDS.HEART].includes(pathId);
};

/**
 * Get the unlock time for a specific path.
 * In All-Access mode, paths are never "waiting" to unlock.
 */
export const getPathUnlockTime = (
  _pathId: PathId,
  _completedPaths: Array<{ pathId: PathId; completedAt: string; nextPathUnlockAt?: string }>
): Date | null => {
  return null;
};

/**
 * Get dependency path name for messaging.
 * Since there are no dependencies, this now returns null.
 */
export const getDependencyName = (_pathId: PathId): string | null => {
  return null;
};

/**
 * Format countdown text for UI.
 * Since all paths are unlocked, this will now consistently 
 * return 'Unlocked' for the KeySlots.
 */
export const getCountdownText = (
  _pathId: PathId,
  _completedPaths: Array<{ pathId: PathId; completedAt: string; nextPathUnlockAt?: string }>,
  _isTester: boolean = false
): string => {
  return 'Unlocked';
};

/**
 * Get hours until path unlocks.
 * Always returns 0 as all paths are available.
 */
export const getHoursUntilUnlock = (
  _pathId: PathId,
  _completedPaths: Array<{ pathId: PathId; completedAt: string; nextPathUnlockAt?: string }>,
  _isTester: boolean = false
): number => {
  return 0;
};