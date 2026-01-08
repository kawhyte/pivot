/**
 * Achievement System
 * Maps performance metrics to themed achievements with priority logic
 */

import type { PathId } from '@/store/useQuestStore';
import { PATH_IDS } from '@/store/useQuestStore';
import { SPEED_THRESHOLDS, ACCURACY_THRESHOLDS } from '@/lib/constants';

export interface AchievementResult {
  title: string;
  category: 'accuracy' | 'speed' | 'standard';
  tier: 'elite' | 'pro' | 'standard';
  message: string;
}

/**
 * Gets the themed achievement based on path, accuracy, and completion time
 *
 * Priority Logic:
 * 1. Perfect accuracy (100%) → Accuracy-based achievement (highest priority)
 * 2. Elite speed (< 5 min) → Speed-based achievement
 * 3. Pro speed (< 8 min) → Speed-based achievement
 * 4. Default → Standard achievement
 *
 * @param pathId - The path ID (1, 2, or 3)
 * @param accuracy - Accuracy percentage (0-100)
 * @param timeMs - Total completion time in milliseconds
 * @returns Achievement result with title, category, tier, and message
 */
export const getThemedAchievement = (
  pathId: PathId,
  accuracy: number,
  timeMs: number
): AchievementResult => {
  // Priority 1: Perfect Accuracy (100%)
  if (accuracy === ACCURACY_THRESHOLDS.PERFECT_ACCURACY) {
    switch (pathId) {
      case PATH_IDS.POP_CULTURE:
        return {
          title: 'Monica Approved 🧹',
          category: 'accuracy',
          tier: 'elite',
          message: 'Perfect accuracy! You cleaned up every question flawlessly!',
        };
      case PATH_IDS.RENAISSANCE:
        return {
          title: 'Renaissance Master 🎨',
          category: 'accuracy',
          tier: 'elite',
          message: 'A true master! Every answer was perfectly executed!',
        };
      case PATH_IDS.HEART:
        return {
          title: 'Soulmate Certified ❤️',
          category: 'accuracy',
          tier: 'elite',
          message: 'Perfect knowledge of every moment we share!',
        };
    }
  }

  // Priority 2: Elite Speed (< 5 minutes)
  if (timeMs < SPEED_THRESHOLDS.ELITE_THRESHOLD) {
    switch (pathId) {
      case PATH_IDS.POP_CULTURE:
        return {
          title: 'Lorelai on 5 Coffees ☕',
          category: 'speed',
          tier: 'elite',
          message: `Incredible speed! Completed in ${formatTime(timeMs)}!`,
        };
      case PATH_IDS.RENAISSANCE:
        return {
          title: 'Supersonic Voyager 🚀',
          category: 'speed',
          tier: 'elite',
          message: `Blazing fast! Completed in ${formatTime(timeMs)}!`,
        };
      case PATH_IDS.HEART:
        return {
          title: 'Speed Demon 💨',
          category: 'speed',
          tier: 'elite',
          message: `Lightning quick! Completed in ${formatTime(timeMs)}!`,
        };
    }
  }

  // Priority 3: Pro Speed (< 8 minutes)
  if (timeMs < SPEED_THRESHOLDS.PRO_THRESHOLD) {
    switch (pathId) {
      case PATH_IDS.POP_CULTURE:
        return {
          title: 'Aviation Ace ✈️',
          category: 'speed',
          tier: 'pro',
          message: `Great pace! Completed in ${formatTime(timeMs)}!`,
        };
      case PATH_IDS.RENAISSANCE:
        return {
          title: 'Jet Setter 🛩️',
          category: 'speed',
          tier: 'pro',
          message: `Solid speed! Completed in ${formatTime(timeMs)}!`,
        };
      case PATH_IDS.HEART:
        return {
          title: 'Quick Thinker 🧠',
          category: 'speed',
          tier: 'pro',
          message: `Nice pace! Completed in ${formatTime(timeMs)}!`,
        };
    }
  }

  // Default: Standard Achievement
  switch (pathId) {
    case PATH_IDS.POP_CULTURE:
      return {
        title: 'Path Victor 🎭',
        category: 'standard',
        tier: 'standard',
        message: 'You conquered the Pop Culture path!',
      };
    case PATH_IDS.RENAISSANCE:
      return {
        title: 'Path Victor 🎭',
        category: 'standard',
        tier: 'standard',
        message: 'You conquered the Renaissance path!',
      };
    case PATH_IDS.HEART:
      return {
        title: 'Path Victor 🎭',
        category: 'standard',
        tier: 'standard',
        message: 'You conquered the Heart path!',
      };
  }
};

/**
 * Helper function to format milliseconds to mm:ss format
 * @param ms - Time in milliseconds
 * @returns Formatted time string
 */
const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Determines if a new run is a personal best
 * @param newAccuracy - New run accuracy
 * @param newTime - New run time in milliseconds
 * @param previousAccuracy - Previous best accuracy
 * @param previousTime - Previous best time in milliseconds
 * @returns True if new run beats previous best (higher accuracy or faster time)
 */
export const isPersonalBest = (
  newAccuracy: number,
  newTime: number,
  previousAccuracy?: number,
  previousTime?: number
): boolean => {
  if (!previousAccuracy || !previousTime) {
    return true; // First attempt is always a personal best
  }

  // Better accuracy is always a personal best
  if (newAccuracy > previousAccuracy) {
    return true;
  }

  // Same accuracy but faster time is a personal best
  if (newAccuracy === previousAccuracy && newTime < previousTime) {
    return true;
  }

  return false;
};
