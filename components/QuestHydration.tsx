'use client';

import { useEffect } from 'react';
import { useQuestStore } from '@/store/useQuestStore';
import { createUser, fetchUserProgress } from '@/app/actions/quest';

/**
 * Handles user initialization and state hydration from database
 * Runs once on app mount to sync local state with database
 */
export const QuestHydration = () => {
  const { userId, setUserId, hydrateFromDatabase } = useQuestStore();

  useEffect(() => {
    async function initializeUser() {
      // If userId exists in Zustand (from localStorage), fetch progress
      if (userId) {
        try {
          const completedPaths = await fetchUserProgress(userId);
          hydrateFromDatabase(completedPaths);
        } catch (error) {
          console.error('Failed to hydrate from database:', error);
        }
      } else {
        // First visit - create new user
        try {
          const newUserId = await createUser();
          setUserId(newUserId);
        } catch (error) {
          console.error('Failed to create user:', error);
        }
      }
    }

    initializeUser();
  }, []); // Run once on mount (userId changes are handled by Zustand)

  return null; // This component doesn't render anything
};
