import { addDays, setHours, setMinutes, setSeconds, setMilliseconds, isAfter } from 'date-fns';
import { PATH_IDS, PATH_METADATA, type PathId } from '@/lib/paths';

/**
 * UNLOCK_HOUR: Time when next path unlocks (8am local time)
 */
export const UNLOCK_HOUR = 8;

/**
 * Path dependency chain - sequential unlocking
 * Pop Culture → Renaissance → Heart
 */
export const PATH_DEPENDENCIES: Record<PathId, PathId | null> = {
  [PATH_IDS.POP_CULTURE]: null, // Always available
  [PATH_IDS.RENAISSANCE]: PATH_IDS.POP_CULTURE, // Unlocks after Pop Culture
  [PATH_IDS.HEART]: PATH_IDS.RENAISSANCE, // Unlocks after Renaissance
};

/**
 * Calculate next path unlock time (8am the day after completion)
 *
 * Edge Case Handling:
 * - Complete at 9am → unlock 8am next day (23 hours wait)
 * - Complete at 11pm → unlock 8am next day (9 hours wait)
 * - Complete at 7am → unlock 8am next day (25 hours wait)
 *
 * @param completedAt - Timestamp when path was completed
 * @returns Date object representing 8am the next day
 */
export const calculateNextPathUnlockTime = (completedAt: Date): Date => {
  // Get the next day at 8am
  let unlockTime = addDays(completedAt, 1);
  unlockTime = setHours(unlockTime, UNLOCK_HOUR);
  unlockTime = setMinutes(unlockTime, 0);
  unlockTime = setSeconds(unlockTime, 0);
  unlockTime = setMilliseconds(unlockTime, 0);

  return unlockTime;
};

/**
 * Get unlocked paths based on completion status
 * GOD MODE: If isTester is true, all paths are unlocked
 *
 * @param completedPaths - Array of completed path data with timestamps
 * @param isTester - God mode flag for testers
 * @returns Array of unlocked path IDs
 */
export const getUnlockedPaths = (
  completedPaths: Array<{ pathId: PathId; completedAt: string; nextPathUnlockAt?: string }>,
  isTester: boolean = false
): PathId[] => {
  // GOD MODE: Testers bypass all restrictions
  if (isTester) {
    return [PATH_IDS.POP_CULTURE, PATH_IDS.RENAISSANCE, PATH_IDS.HEART];
  }

  const now = new Date();
  const unlocked: PathId[] = [];

  // Path 1 (Pop Culture) - Always available
  unlocked.push(PATH_IDS.POP_CULTURE);

  // Path 2 (Renaissance) - Check if Pop Culture is completed and unlock time has passed
  const popCultureCompleted = completedPaths.find(p => p.pathId === PATH_IDS.POP_CULTURE);
  if (popCultureCompleted) {
    const unlockTime = popCultureCompleted.nextPathUnlockAt
      ? new Date(popCultureCompleted.nextPathUnlockAt)
      : calculateNextPathUnlockTime(new Date(popCultureCompleted.completedAt));

    if (isAfter(now, unlockTime) || now.getTime() === unlockTime.getTime()) {
      unlocked.push(PATH_IDS.RENAISSANCE);
    }
  }

  // Path 3 (Heart) - Check if Renaissance is completed and unlock time has passed
  const renaissanceCompleted = completedPaths.find(p => p.pathId === PATH_IDS.RENAISSANCE);
  if (renaissanceCompleted) {
    const unlockTime = renaissanceCompleted.nextPathUnlockAt
      ? new Date(renaissanceCompleted.nextPathUnlockAt)
      : calculateNextPathUnlockTime(new Date(renaissanceCompleted.completedAt));

    if (isAfter(now, unlockTime) || now.getTime() === unlockTime.getTime()) {
      unlocked.push(PATH_IDS.HEART);
    }
  }

  return unlocked;
};

/**
 * Check if a specific path is unlocked
 * GOD MODE: If isTester is true, always returns true
 *
 * @param pathId - The path to check
 * @param completedPaths - Array of completed path data
 * @param isTester - God mode flag
 * @returns boolean indicating if path is unlocked
 */
export const isPathUnlocked = (
  pathId: PathId,
  completedPaths: Array<{ pathId: PathId; completedAt: string; nextPathUnlockAt?: string }>,
  isTester: boolean = false
): boolean => {
  if (isTester) return true;

  const unlockedPaths = getUnlockedPaths(completedPaths, isTester);
  return unlockedPaths.includes(pathId);
};

/**
 * Get the unlock time for a specific path
 * Returns null if path is already unlocked or has no dependencies
 *
 * @param pathId - The path to get unlock time for
 * @param completedPaths - Array of completed path data
 * @returns Date object or null
 */
export const getPathUnlockTime = (
  pathId: PathId,
  completedPaths: Array<{ pathId: PathId; completedAt: string; nextPathUnlockAt?: string }>
): Date | null => {
  // Pop Culture has no dependencies
  if (pathId === PATH_IDS.POP_CULTURE) return null;

  const dependency = PATH_DEPENDENCIES[pathId];
  if (!dependency) return null;

  const dependencyCompleted = completedPaths.find(p => p.pathId === dependency);
  if (!dependencyCompleted) return null;

  return dependencyCompleted.nextPathUnlockAt
    ? new Date(dependencyCompleted.nextPathUnlockAt)
    : calculateNextPathUnlockTime(new Date(dependencyCompleted.completedAt));
};

/**
 * Get hours until path unlocks (returns 0 if already unlocked)
 * GOD MODE: If isTester is true, always returns 0
 *
 * @param pathId - The path to check
 * @param completedPaths - Array of completed path data
 * @param isTester - God mode flag
 * @returns Number of hours until unlock (0 if unlocked)
 */
export const getHoursUntilUnlock = (
  pathId: PathId,
  completedPaths: Array<{ pathId: PathId; completedAt: string; nextPathUnlockAt?: string }>,
  isTester: boolean = false
): number => {
  if (isTester) return 0;

  if (isPathUnlocked(pathId, completedPaths, isTester)) return 0;

  const unlockTime = getPathUnlockTime(pathId, completedPaths);
  if (!unlockTime) return 0;

  const now = new Date();
  const hoursRemaining = Math.ceil((unlockTime.getTime() - now.getTime()) / (1000 * 60 * 60));

  return Math.max(0, hoursRemaining);
};

/**
 * Format countdown text for locked paths with encouraging tone
 * GOD MODE: If isTester is true, always returns 'Unlocked'
 *
 * Messages:
 * - "Complete Pop Culture to unlock this quest!"
 * - "Available tomorrow at 8:00 AM"
 * - "Unlocks in 5h" (less than 24h)
 * - "Unlocked"
 *
 * @param pathId - The path to get text for
 * @param completedPaths - Array of completed path data
 * @param isTester - God mode flag
 * @returns User-facing countdown text
 */
export const getCountdownText = (
  pathId: PathId,
  completedPaths: Array<{ pathId: PathId; completedAt: string; nextPathUnlockAt?: string }>,
  isTester: boolean = false
): string => {
  if (isTester) return 'Unlocked';

  if (isPathUnlocked(pathId, completedPaths, isTester)) return 'Unlocked';

  const dependency = PATH_DEPENDENCIES[pathId];
  if (!dependency) return 'Unlocked';

  const dependencyCompleted = completedPaths.find(p => p.pathId === dependency);
  if (!dependencyCompleted) {
    // Dependency not yet completed - show encouraging message
    const dependencyName = PATH_METADATA[dependency]?.name || 'previous path';
    return `Complete ${dependencyName} to unlock this quest!`;
  }

  // Dependency completed, show time until unlock
  const hoursRemaining = getHoursUntilUnlock(pathId, completedPaths, isTester);

  if (hoursRemaining === 0) return 'Unlocked';
  if (hoursRemaining < 24) return `Unlocks in ${hoursRemaining}h`;

  const daysRemaining = Math.ceil(hoursRemaining / 24);
  if (daysRemaining === 1) return 'Available tomorrow at 8:00 AM';

  return `Unlocks in ${daysRemaining}d`;
};

/**
 * Get dependency path name for messaging
 *
 * @param pathId - The path to get dependency for
 * @returns Name of the dependency path or null
 */
export const getDependencyName = (pathId: PathId): string | null => {
  const dependency = PATH_DEPENDENCIES[pathId];
  if (!dependency) return null;

  return PATH_METADATA[dependency]?.name || null;
};
