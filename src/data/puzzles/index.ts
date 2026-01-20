import type { PathConfig, Puzzle, Coupon } from '@/types/puzzle';
import type { PathId } from '@/lib/paths';
import { PATH_IDS } from '@/lib/paths';
import { popCulturePath } from './pop-culture';
import { renaissancePath } from './renaissance';
import { heartPath } from './heart';

/**
 * Get puzzle configuration for a specific path
 */
export const getPathPuzzles = (pathId: number): PathConfig | null => {
  switch (pathId) {
    case PATH_IDS.POP_CULTURE:
      return popCulturePath;
    case PATH_IDS.RENAISSANCE:
      return renaissancePath;
    case PATH_IDS.HEART:
      return heartPath;
    default:
      return null;
  }
};

/**
 * Calculate total points for BASE (non-bonus) puzzles
 * These are the required puzzles to unlock the key (100% threshold)
 */
export const getTotalBasePoints = (pathId: PathId): number => {
  const pathConfig = getPathPuzzles(pathId);
  if (!pathConfig) return 0;

  return pathConfig.puzzles
    .filter((puzzle) => !puzzle.isBonus)
    .reduce((total, puzzle) => total + (puzzle.points || 0), 0);
};

/**
 * Calculate total points for BONUS (sudden death) puzzles
 * These are optional extra credit puzzles
 */
export const getTotalBonusPoints = (pathId: PathId): number => {
  const pathConfig = getPathPuzzles(pathId);
  if (!pathConfig) return 0;

  return pathConfig.puzzles
    .filter((puzzle) => puzzle.isBonus === true)
    .reduce((total, puzzle) => total + (puzzle.points || 0), 0);
};

/**
 * @deprecated Use getTotalBasePoints() instead. This constant is kept for backward compatibility only.
 * Point-based unlock thresholds (LEGACY: 91% threshold)
 * NEW SYSTEM: 100% of base points required (getTotalBasePoints)
 */
export const TARGET_SCORES: Record<PathId, number> = {
  [PATH_IDS.POP_CULTURE]: getTotalBasePoints(PATH_IDS.POP_CULTURE),
  [PATH_IDS.RENAISSANCE]: getTotalBasePoints(PATH_IDS.RENAISSANCE),
  [PATH_IDS.HEART]: getTotalBasePoints(PATH_IDS.HEART),
} as const;

/**
 * Themed bonus coupons for perfect runs (100% completion + 0 mistakes)
 */
export const COUPONS: Record<PathId, Coupon[]> = {
  [PATH_IDS.POP_CULTURE]: [
    {
      id: 'geller-cup',
      title: 'The Geller Cup Trophy',
      description: 'A friendly competition: Winner picks the next date night',
      theme: 'friends',
    },
    {
      id: 'lukes-diner',
      title: 'Luke\'s Diner Breakfast Pass',
      description: 'Coffee in bed, served with love and no judgment',
      theme: 'gilmore',
    },
    {
      id: 'monica-kitchen',
      title: 'Monica\'s Kitchen Pass',
      description: 'One get-out-of-dishes-free card, no questions asked',
      theme: 'friends',
    },
  ],
  [PATH_IDS.RENAISSANCE]: [
    {
      id: 'supersonic-getaway',
      title: 'The Supersonic Getaway',
      description: 'Plan a surprise weekend adventure together',
      theme: 'travel',
    },
    {
      id: 'explorer-dinner',
      title: 'Global Explorer Dinner',
      description: 'Cook a meal from a country we\'ve never tried',
      theme: 'culinary',
    },
  ],
  [PATH_IDS.HEART]: [
    {
      id: 'sneaker-mate-spree',
      title: 'The Sneaker-Mate Spree',
      description: 'One guilt-free sneaker purchase with full support',
      theme: 'personal',
    },
    {
      id: 'whytehouse-night',
      title: 'A Night at TheWhyteHouse',
      description: 'Dinner reservation at your favorite spot, just because',
      theme: 'personal',
    },
  ],
} as const;

/**
 * Get a specific puzzle by path and puzzle index
 */
export const getPuzzle = (pathId: number, puzzleIndex: number) => {
  const pathConfig = getPathPuzzles(pathId);
  if (!pathConfig || puzzleIndex >= pathConfig.puzzles.length) {
    return null;
  }
  return pathConfig.puzzles[puzzleIndex];
};

/**
 * Get a specific puzzle by its ID (for non-linear navigation)
 */
export const getPuzzleById = (pathId: number, puzzleId: string): Puzzle | null => {
  const pathConfig = getPathPuzzles(pathId);
  return pathConfig?.puzzles.find((p) => p.id === puzzleId) || null;
};

/**
 * Get total number of puzzles in a path
 */
export const getTotalPuzzles = (pathId: number): number => {
  const pathConfig = getPathPuzzles(pathId);
  return pathConfig?.puzzles.length || 0;
};

/**
 * Get total number of NON-BONUS puzzles in a path (base questions)
 */
export const getTotalNonBonusPuzzles = (pathId: number): number => {
  const pathConfig = getPathPuzzles(pathId);
  if (!pathConfig) return 0;
  return pathConfig.puzzles.filter((p) => !p.isBonus).length;
};

/**
 * Get total number of BONUS puzzles in a path
 */
export const getTotalBonusPuzzles = (pathId: number): number => {
  const pathConfig = getPathPuzzles(pathId);
  if (!pathConfig) return 0;
  return pathConfig.puzzles.filter((p) => p.isBonus === true).length;
};

/**
 * Get a random bonus coupon for a path (for perfect runs)
 */
export const getRandomCoupon = (pathId: PathId): Coupon => {
  const coupons = COUPONS[pathId];
  return coupons[Math.floor(Math.random() * coupons.length)];
};
