import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/db';
import type { PathId } from '@/lib/paths';

export const useQuestStore = create()(
  persist(
    (set, get) => ({
      agentId: null,
      isTester: false,
      activePathId: null as PathId | null,
      currentPuzzleId: null,
      attemptsMade: 0,
      shuffledQueue: [],
      completedIds: [],

      // HYDRATION: Fetch everything from Supabase
      hydrateFromDatabase: async (profileId: number) => {
        const { data: session } = await supabase
          .from('active_sessions')
          .select('*')
          .eq('profile_id', profileId)
          .single();

        if (session) {
          set({
            currentPuzzleId: session.current_puzzle_id,
            attemptsMade: session.attempts_made,
            shuffledQueue: session.shuffled_queue || [],
          });
        }
      },

      // SYNC: Atomic update to Supabase
      syncProgress: async () => {
        const state = get();
        if (!state.agentId) return;

        await supabase.from('active_sessions').upsert({
          profile_id: state.agentId,
          current_puzzle_id: state.currentPuzzleId,
          attempts_made: state.attemptsMade,
          shuffled_queue: state.shuffledQueue,
          updated_at: new Date().toISOString(),
        });
      },

      submitAnswer: async (pathId: PathId, puzzleId: string, isCorrect: boolean) => {
        const { attemptsMade, isTester, syncProgress } = get();

        if (isCorrect) {
          set((state) => ({ 
            completedIds: [...state.completedIds, puzzleId],
            attemptsMade: 0 
          }));
        } else {
          const newAttempts = attemptsMade + 1;
          // One-Strike Skip Logic (unless Tester)
          if (newAttempts >= 2 && !isTester) {
            // Logic to skip goes here
            set({ attemptsMade: 0 });
          } else {
            set({ attemptsMade: newAttempts });
          }
        }
        await syncProgress();
      },
    }),
    {
     name: 'quest-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ agentId: state.agentId }),
    }
  )
);