'use client';

import { useEffect } from 'react';
import { useQuestStore } from '@/store/useQuestStore';
import { createUser, fetchUserProgress } from '@/app/actions/quest';
import { useSearchParams } from 'next/navigation';

/**
 * Handles user initialization and state hydration from database
 * Supports cross-device sync via URL parameter (?userId=123)
 * Runs on app mount to sync local state with database
 */
export const QuestHydration = () => {
  const searchParams = useSearchParams();
  const { userId, setUserId, hydrateFromDatabase } = useQuestStore();

  useEffect(() => {
    async function initializeUser() {
      // Priority 1: Check URL parameter (for cross-device sharing)
      const urlUserId = searchParams.get('userId');

      // Priority 2: Check localStorage (from Zustand persist)
      // Priority 3: Create new user

      let activeUserId: number | null = null;

      if (urlUserId) {
        // User opened a shared link - use that userId
        activeUserId = parseInt(urlUserId, 10);
        setUserId(activeUserId);

        // Clean URL (remove query param for cleaner experience)
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, '', '/');
        }
      } else if (userId) {
        // User has existing session from localStorage
        activeUserId = userId;
      } else {
        // New user - create account in database
        try {
          activeUserId = await createUser();
          setUserId(activeUserId);
        } catch (error) {
          console.error('Failed to create user:', error);
          return;
        }
      }

      // Always hydrate progress from database (single source of truth)
      if (activeUserId) {
        try {
          const completedPaths = await fetchUserProgress(activeUserId);
          hydrateFromDatabase(completedPaths);
        } catch (error) {
          console.error('Failed to hydrate from database:', error);
        }
      }
    }

    initializeUser();
  }, [searchParams]); // Re-run if URL changes (e.g., shared link opened)

  return null; // This component doesn't render anything
};
