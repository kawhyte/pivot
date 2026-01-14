import { useEffect } from 'react';
import { useQuestStore } from '@/store/useQuestStore';
import { useSearchParams } from 'react-router-dom';
/**
 * Handles user initialization and state hydration from database
 * Supports cross-device sync via URL parameter (?userId=123)
 * Runs on app mount to sync local state with database
 */
export const QuestHydration = () => {
  const searchParams = useSearchParams();
  const { agentId, hydrateFromDatabase } = useQuestStore();

  useEffect(() => {
    async function initializeUser() {
      // If agentId exists from localStorage, hydrate from database
      if (agentId) {
        try {
          await hydrateFromDatabase(agentId);
        } catch (error) {
          console.error('Failed to hydrate from database:', error);
        }
      }
    }

    initializeUser();
  }, [agentId, hydrateFromDatabase]);

  return null; // This component doesn't render anything
};
