import type { PathId } from '@/store/useQuestStore';
import { PATH_IDS } from '@/store/useQuestStore';

/**
 * Themed titles for each path based on accuracy
 */
const THEMED_TITLES = {
  [PATH_IDS.POP_CULTURE]: {
    perfect: 'Monica Approved 🧹',
    great: 'Central Perk Regular ☕',
    good: "Joey's Pizza Partner 🍕",
  },
  [PATH_IDS.RENAISSANCE]: {
    perfect: 'Master Polymath 🎨',
    great: 'Knowledge Seeker 🔍',
    good: 'Curious Explorer 🗺️',
  },
  [PATH_IDS.HEART]: {
    perfect: 'True Soulmate ❤️',
    great: 'Memory Keeper 📸',
    good: 'Sweetheart 🍬',
  },
} as const;

/**
 * Gets the themed title based on path and accuracy
 *
 * @param pathId - The path ID (1, 2, or 3)
 * @param accuracy - Accuracy percentage (0-100)
 * @returns The themed title string
 */
export const getThemedTitle = (pathId: PathId, accuracy: number): string => {
  const titles = THEMED_TITLES[pathId];

  if (accuracy === 100) {
    return titles.perfect;
  } else if (accuracy >= 90) {
    return titles.great;
  } else {
    return titles.good;
  }
};

/**
 * Calculates accuracy based on total puzzles and mistakes
 *
 * @param totalPuzzles - Total number of puzzles in the path
 * @param mistakes - Number of mistakes (0.5 for close, 1.0 for incorrect)
 * @returns Accuracy percentage (0-100)
 */
export const calculateAccuracy = (
  totalPuzzles: number,
  mistakes: number
): number => {
  const accuracy = ((totalPuzzles - mistakes) / totalPuzzles) * 100;
  return Math.max(0, Math.min(100, Math.round(accuracy)));
};

/**
 * Formats milliseconds to mm:ss or hh:mm:ss format
 *
 * @param ms - Time in milliseconds
 * @returns Formatted time string
 */
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
