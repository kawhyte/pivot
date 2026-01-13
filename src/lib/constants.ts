/**
 * Performance & Engagement Constants
 * Thresholds for speed-based achievements and performance tiers
 */

// Speed thresholds in milliseconds
export const SPEED_THRESHOLDS = {
  ELITE_THRESHOLD: 300_000,     // 5 minutes - "Lorelai on 5 Coffees" or "Supersonic Voyager"
  PRO_THRESHOLD: 480_000,        // 8 minutes - "Aviation Ace" or "Jet Setter"
} as const;

// Accuracy thresholds
export const ACCURACY_THRESHOLDS = {
  PERFECT_ACCURACY: 100,
  GREAT_ACCURACY: 90,
} as const;

// Performance tier names
export const PERFORMANCE_TIERS = {
  ELITE: 'elite',
  PRO: 'pro',
  STANDARD: 'standard',
} as const;
