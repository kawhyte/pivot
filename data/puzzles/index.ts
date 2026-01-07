import type { PathConfig } from '@/types/puzzle';
import { PATH_IDS } from '@/store/useQuestStore';
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
 * Get total number of puzzles in a path
 */
export const getTotalPuzzles = (pathId: number): number => {
  const pathConfig = getPathPuzzles(pathId);
  return pathConfig?.puzzles.length || 0;
};
