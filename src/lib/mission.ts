/**
 * MISSION START DATE: Configured via NEXT_PUBLIC_MISSION_START_DATE environment variable
 * This is when the secure terminal unlocks
 * Format: ISO 8601 string (e.g., '2026-01-20T08:00:00')
 */
export const MISSION_START_DATE = new Date(
  import.meta.env.VITE_MISSION_START_DATE || '2026-01-13T08:00:00'
);

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
