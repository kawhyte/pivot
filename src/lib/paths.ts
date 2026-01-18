/**
 * Path IDs and metadata - extracted to avoid circular dependencies
 */
export const PATH_IDS = {
  POP_CULTURE: 1,
  RENAISSANCE: 2,
  HEART: 3,
} as const;

export type PathId = (typeof PATH_IDS)[keyof typeof PATH_IDS];

export const PATH_METADATA: Record<PathId, { 
  name: string; 
  subtitle: string; 
  colors: { primary: string; secondary: string } 
}> = {
  [PATH_IDS.POP_CULTURE]: {
    name: "Pop Culture",
    subtitle: "TV, Sitcom & Fun",
    colors: { primary: "#6366f1", secondary: "#fbbf24" }
  },
  [PATH_IDS.RENAISSANCE]: {
    name: "Renaissance",
    subtitle: "I Love to Travel",
    colors: { primary: "#065f46", secondary: "#d4af37" }
  },
  [PATH_IDS.HEART]: {
    name: "Heart",
    subtitle: "Personal Memories",
    colors: { primary: "#be123c", secondary: "#fb7185" }
  }
};