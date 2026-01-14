import { differenceInHours, differenceInDays, addDays } from 'date-fns';
import { PATH_IDS, type PathId } from '@/lib/paths';
/**
 * START DATE: January 20, 2026
 * This is the birthday date when the quest begins
 *
 * PRODUCTION: Set to the actual birthday
 * Daily Drop Schedule:
 *   Day 1 (Jan 20): Pop Culture unlocks
 *   Day 2 (Jan 21): Renaissance unlocks
 *   Day 3 (Jan 22): Heart unlocks
 */
export const START_DATE = new Date('2026-01-13T00:00:00');

/**
 * Daily Drop Schedule
 * Day 1 (Jan 20): Pop Culture unlocks
 * Day 2 (Jan 21): Renaissance unlocks
 * Day 3 (Jan 22): Heart unlocks
 */

/**
 * Gets the current day of the quest (1, 2, 3, or 0 if before start)
 */
export const getCurrentQuestDay = (): number => {
  const now = new Date();
  const daysPassed = differenceInDays(now, START_DATE);

  if (daysPassed < 0) return 0; // Before quest starts
  if (daysPassed >= 3) return 3; // All paths unlocked

  return daysPassed + 1; // Day 1, 2, or 3
};

/**
 * Returns array of unlocked path IDs based on current date
 * GOD MODE: If isTester is true, all paths are unlocked
 */
export const getUnlockedPaths = (isTester: boolean = false): PathId[] => {
  // GOD MODE: Testers bypass all restrictions
  if (isTester) {
    return [PATH_IDS.POP_CULTURE, PATH_IDS.RENAISSANCE, PATH_IDS.HEART];
  }

  const currentDay = getCurrentQuestDay();
  const unlocked: PathId[] = [];

  if (currentDay >= 1) unlocked.push(PATH_IDS.POP_CULTURE);
  if (currentDay >= 2) unlocked.push(PATH_IDS.RENAISSANCE);
  if (currentDay >= 3) unlocked.push(PATH_IDS.HEART);

  return unlocked;
};

/**
 * Checks if a specific path is unlocked
 * GOD MODE: If isTester is true, always returns true
 */
export const isPathUnlocked = (pathId: PathId, isTester: boolean = false): boolean => {
  // GOD MODE: Testers bypass all restrictions
  if (isTester) return true;

  const unlockedPaths = getUnlockedPaths();
  return unlockedPaths.includes(pathId);
};

/**
 * Gets the unlock date for a specific path
 */
export const getPathUnlockDate = (pathId: PathId): Date => {
  let daysToAdd = 0;

  switch (pathId) {
    case PATH_IDS.POP_CULTURE:
      daysToAdd = 0;
      break;
    case PATH_IDS.RENAISSANCE:
      daysToAdd = 1;
      break;
    case PATH_IDS.HEART:
      daysToAdd = 2;
      break;
  }

  return addDays(START_DATE, daysToAdd);
};

/**
 * Gets hours remaining until a path unlocks (returns 0 if already unlocked)
 * GOD MODE: If isTester is true, always returns 0
 */
export const getHoursUntilUnlock = (pathId: PathId, isTester: boolean = false): number => {
  // GOD MODE: Testers have instant access
  if (isTester) return 0;

  if (isPathUnlocked(pathId)) return 0;

  const unlockDate = getPathUnlockDate(pathId);
  const now = new Date();
  const hoursRemaining = differenceInHours(unlockDate, now);

  return Math.max(0, hoursRemaining);
};

/**
 * Formats countdown text for locked paths
 * GOD MODE: If isTester is true, always returns 'Unlocked'
 */
export const getCountdownText = (pathId: PathId, isTester: boolean = false): string => {
  // GOD MODE: Always show as unlocked for testers
  if (isTester) return 'Unlocked';

  const hoursRemaining = getHoursUntilUnlock(pathId);

  if (hoursRemaining === 0) return 'Unlocked';
  if (hoursRemaining < 24) return `Unlocks in ${hoursRemaining}h`;

  const daysRemaining = Math.ceil(hoursRemaining / 24);
  return `Unlocks in ${daysRemaining}d`;
};
