/**
 * Path IDs and metadata - extracted to avoid circular dependencies
 */
export const PATH_IDS = {
  POP_CULTURE: 1,
  RENAISSANCE: 2,
  HEART: 3,
} as const;

export type PathId = (typeof PATH_IDS)[keyof typeof PATH_IDS];

// src/lib/paths.ts
export const PATH_METADATA: Record<PathId, { 
  name: string; 
  subtitle: string; 
  colors: { primary: string; secondary: string } 
}> = {
  [PATH_IDS.POP_CULTURE]: {
    name: "Central Perk & Stars Hollow",
    subtitle: "Where Coffee Meets the Copper Boom!",
    colors: { primary: "#CE82FF", secondary: "#FFC800" } // Purple/Yellow (Friends/Gilmore)
  },
  [PATH_IDS.RENAISSANCE]: {
    name: "The Jetsetter's Voyage",
    subtitle: "First Class Trivia & Lido Deck Logic",
    colors: { primary: "#1CB0F6", secondary: "#FFD700" } // Sky Blue/Gold (Planes/Ships)
  },
  [PATH_IDS.HEART]: {
    name: "The Scrapbook of Us",
    subtitle: "A Journey Through Our Favorite Memories",
    colors: { primary: "#FF4B4B", secondary: "#FFC0CB" } // Red/Pink
  }
};