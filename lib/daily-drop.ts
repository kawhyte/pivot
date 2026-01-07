import { differenceInHours, differenceInDays, addDays } from 'date-fns';
import { PATH_IDS, type PathId } from '@/store/useQuestStore';

/**
 * START DATE: January 20, 2026
 * This is the birthday date when the quest begins
 * Currently set to Jan 6 for testing (all paths unlocked)
 */
export const START_DATE = new Date('2026-01-05T00:00:00');

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
 */
export const getUnlockedPaths = (): PathId[] => {
  const currentDay = getCurrentQuestDay();
  const unlocked: PathId[] = [];

  if (currentDay >= 1) unlocked.push(PATH_IDS.POP_CULTURE);
  if (currentDay >= 2) unlocked.push(PATH_IDS.RENAISSANCE);
  if (currentDay >= 3) unlocked.push(PATH_IDS.HEART);

  return unlocked;
};

/**
 * Checks if a specific path is unlocked
 */
export const isPathUnlocked = (pathId: PathId): boolean => {
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
 */
export const getHoursUntilUnlock = (pathId: PathId): number => {
  if (isPathUnlocked(pathId)) return 0;

  const unlockDate = getPathUnlockDate(pathId);
  const now = new Date();
  const hoursRemaining = differenceInHours(unlockDate, now);

  return Math.max(0, hoursRemaining);
};

/**
 * Formats countdown text for locked paths
 */
export const getCountdownText = (pathId: PathId): string => {
  const hoursRemaining = getHoursUntilUnlock(pathId);

  if (hoursRemaining === 0) return 'Unlocked';
  if (hoursRemaining < 24) return `Unlocks in ${hoursRemaining}h`;

  const daysRemaining = Math.ceil(hoursRemaining / 24);
  return `Unlocks in ${daysRemaining}d`;
};
