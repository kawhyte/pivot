/**
 * MISSION START DATE: January 20, 2026 at 8:00 AM
 * This is when the secure terminal unlocks
 */
export const MISSION_START_DATE = new Date('2026-01-20T08:00:00');

/**
 * Check if mission has started
 */
export function isMissionActive(): boolean {
  return Date.now() >= MISSION_START_DATE.getTime();
}

/**
 * Get milliseconds until mission start
 */
export function getMillisecondsUntilStart(): number {
  const now = Date.now();
  const start = MISSION_START_DATE.getTime();
  return Math.max(0, start - now);
}
