/**
 * Path IDs and metadata - extracted to avoid circular dependencies
 */

export const PATH_IDS = {
  POP_CULTURE: 1,
  RENAISSANCE: 2,
  HEART: 3,
} as const;

export type PathId = (typeof PATH_IDS)[keyof typeof PATH_IDS];
