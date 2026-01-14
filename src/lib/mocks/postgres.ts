/**
 * Client-side mock for postgres package
 * This file is aliased in vite.config.ts to replace postgres in client builds
 */

// Return a mock postgres function that does nothing
export default function postgres() {
  return null;
}
