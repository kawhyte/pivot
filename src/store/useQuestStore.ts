import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PathProgress } from '@/types/puzzle';
import { PATH_IDS, type PathId } from '@/lib/paths';
import { getPathPuzzles, getTotalPuzzles, TARGET_SCORES } from '@/data/puzzles';
import {
  fetchProfile,
  fetchQuestProgress,
  getOrCreateSession,
  syncSessionProgress,
  savePathCompletion,
} from '@/lib/supabase-sync';

// Re-export for backward compatibility
export type { PathId };

/**
 * Path metadata with colors
 */
export const PATH_METADATA = {
  [PATH_IDS.POP_CULTURE]: {
    id: PATH_IDS.POP_CULTURE,
    name: 'Pop Culture',
    subtitle: 'Central Perk & Stars Hollow',
    colors: {
      primary: '#CE82FF', // Purple (subtle badge accent only)
      secondary: '#FFC800', // Yellow
    },
    unlockDay: 1,
  },
  [PATH_IDS.RENAISSANCE]: {
    id: PATH_IDS.RENAISSANCE,
    name: 'Renaissance',
    subtitle: 'Knowledge & Discovery',
    colors: {
      primary: '#1CB0F6', // Blue (subtle badge accent only)
      secondary: '#FFD700', // Gold
    },
    unlockDay: 2,
  },
  [PATH_IDS.HEART]: {
    id: PATH_IDS.HEART,
    name: 'Heart',
    subtitle: 'Our Story',
    colors: {
      primary: '#FF4B4B', // Pink/Red (subtle badge accent only)
      secondary: '#FFC0CB', // Pink
    },
    unlockDay: 3,
  },
} as const;

export interface PathStats {
  completionTime: number;     // milliseconds
  accuracy: number;           // 0-100
  mistakes: number;           // 0.5 for close, 1.0 for incorrect
  themedTitle: string;        // "Monica Approved 🧹"
  completedAt: number;        // timestamp
}

export interface CurrentRun {
  mistakes: number;
  startTime: number | null;
}

interface QuestState {
  // Authentication state
  isAuthenticated: boolean;
  agentName: string;
  agentRole: string;
  agentId: number | null;
  isTester: boolean; // God Mode flag for testers

  // User ID for database persistence (same as agentId)
  userId: number | null;

  // Hydration state for preventing redirect loops
  _hasHydrated: boolean;

  // Active path being played (null = in vault view)
  activePath: PathId | null;

  // Keys collected (path IDs that are completed)
  keysCollected: PathId[];

  // Unlocked paths based on daily drops
  unlockedPaths: PathId[];

  // Non-linear progress tracking per path
  pathProgress: Record<PathId, PathProgress>;

  // Currently viewing puzzle (for non-linear navigation)
  currentPuzzleId: string | null;

  // Performance stats for each completed path
  pathStats: Partial<Record<PathId, PathStats>>;

  // Is vault unlocked (all 3 keys collected)
  isVaultUnlocked: boolean;

  // Current run tracking for live achievement stakes
  currentRun: CurrentRun;

  // Actions
  setAuthentication: (isAuthenticated: boolean, agentName: string, agentRole: string, agentId: number, isTester: boolean) => void;
  setUserId: (id: number) => void;
  setHasHydrated: (hydrated: boolean) => void;
  setActivePath: (pathId: PathId | null) => void;
  addKey: (pathId: PathId, stats?: PathStats) => Promise<void>;
  setUnlockedPaths: (paths: PathId[]) => void;
  setCurrentPuzzle: (puzzleId: string | null) => void;
  submitAnswer: (pathId: PathId, puzzleId: string, isCorrect: boolean, mistakeWeight?: number) => Promise<void>;
  skipPuzzle: (pathId: PathId, puzzleId: string) => void;
  setPathStats: (pathId: PathId, stats: PathStats) => void;
  getPathStats: (pathId: PathId) => PathStats | undefined;
  getPathScore: (pathId: PathId) => number;
  isPerfectRun: (pathId: PathId) => boolean;
  isPathUnlocked: (pathId: PathId) => boolean;
  getNextUnsolvedPuzzle: (pathId: PathId) => string | null;
  hydrateFromDatabase: (agentId: number) => Promise<void>;
  checkVaultStatus: () => void;
  startNewRun: () => void;
  recordMistake: () => void;
  resetRun: () => void;
  resetQuest: () => void;
}

const initialState = {
  isAuthenticated: false,
  agentName: '',
  agentRole: '',
  agentId: null,
  isTester: false,
  userId: null,
  _hasHydrated: false,
  activePath: null,
  keysCollected: [],
  unlockedPaths: [],
  pathProgress: {
    [PATH_IDS.POP_CULTURE]: {
      completedIds: [],
      skippedIds: [],
      mistakes: 0,
      startTime: null,
    },
    [PATH_IDS.RENAISSANCE]: {
      completedIds: [],
      skippedIds: [],
      mistakes: 0,
      startTime: null,
    },
    [PATH_IDS.HEART]: {
      completedIds: [],
      skippedIds: [],
      mistakes: 0,
      startTime: null,
    },
  },
  currentPuzzleId: null,
  pathStats: {},
  isVaultUnlocked: false,
  currentRun: {
    mistakes: 0,
    startTime: null,
  },
};

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setAuthentication: (isAuthenticated, agentName, agentRole, agentId, isTester) =>
        set({ isAuthenticated, agentName, agentRole, agentId, isTester, userId: agentId }),

      setUserId: (id) => set({ userId: id }),

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

      setActivePath: (pathId) => set({ activePath: pathId }),

      addKey: async (pathId, stats) => {
        // OPTIMISTIC: Update local state immediately
        set((state) => {
          const newKeys = [...state.keysCollected, pathId];
          const updates: Partial<QuestState> = { keysCollected: newKeys };

          // If stats provided, store them
          if (stats) {
            updates.pathStats = { ...state.pathStats, [pathId]: stats };
          }

          return updates;
        });
        get().checkVaultStatus();

        // SUPABASE SYNC: Save path completion to database
        const { agentId, pathProgress } = get();
        if (agentId) {
          try {
            const progress = pathProgress[pathId];
            const score = get().getPathScore(pathId);

            await savePathCompletion(agentId, pathId, {
              completedIds: progress.completedIds,
              skippedIds: progress.skippedIds,
              finalScore: score,
              accuracy: stats?.accuracy || 100,
              mistakes: progress.mistakes,
              themedTitle: stats?.themedTitle || 'Completed',
            });
          } catch (error) {
            console.error('Failed to sync key collection:', error);
          }
        }
      },

      setUnlockedPaths: (paths) => set({ unlockedPaths: paths }),

      setCurrentPuzzle: (puzzleId) => set({ currentPuzzleId: puzzleId }),

      submitAnswer: async (pathId, puzzleId, isCorrect, mistakeWeight = 1.0) => {
        // OPTIMISTIC UPDATE: Update local state immediately
        set((state) => {
          const progress = { ...state.pathProgress[pathId] };

          if (isCorrect) {
            // Add to completed, remove from skipped
            if (!progress.completedIds.includes(puzzleId)) {
              progress.completedIds.push(puzzleId);
            }
            progress.skippedIds = progress.skippedIds.filter((id) => id !== puzzleId);
          } else {
            // Increment mistakes (0.5 for "close", 1.0 for "incorrect")
            progress.mistakes += mistakeWeight;
          }

          return {
            pathProgress: { ...state.pathProgress, [pathId]: progress },
          };
        });

        // SUPABASE SYNC: Sync progress to database immediately after local update
        const { agentId } = get();
        if (agentId) {
          const currentProgress = get().pathProgress[pathId];
          const score = get().getPathScore(pathId);

          await syncSessionProgress(agentId, pathId, {
            currentPuzzleId: puzzleId,
            score,
            mistakes: Math.round(currentProgress.mistakes * 10), // Store as integer
          });
        }

        // Check if key should be unlocked (GAUNTLET MODE: 93% threshold)
        const score = get().getPathScore(pathId);
        const threshold = TARGET_SCORES[pathId];
        if (score >= threshold && !get().keysCollected.includes(pathId)) {
          // Auto-unlock key at 93% mastery!
          await get().addKey(pathId);
        }
      },

      skipPuzzle: (pathId, puzzleId) => {
        set((state) => {
          const progress = { ...state.pathProgress[pathId] };

          // Only add to skipped if not already completed
          if (
            !progress.completedIds.includes(puzzleId) &&
            !progress.skippedIds.includes(puzzleId)
          ) {
            progress.skippedIds.push(puzzleId);
          }

          return {
            pathProgress: { ...state.pathProgress, [pathId]: progress },
          };
        });
      },

      getPathScore: (pathId) => {
        const progress = get().pathProgress[pathId];
        const pathConfig = getPathPuzzles(pathId);
        if (!pathConfig) return 0;

        return progress.completedIds.reduce((total, puzzleId) => {
          const puzzle = pathConfig.puzzles.find((p) => p.id === puzzleId);
          return total + (puzzle?.points || 0);
        }, 0);
      },

      isPerfectRun: (pathId) => {
        const progress = get().pathProgress[pathId];
        const totalPuzzles = getTotalPuzzles(pathId);
        return progress.completedIds.length === totalPuzzles && progress.mistakes === 0;
      },

      isPathUnlocked: (pathId) => {
        const score = get().getPathScore(pathId);
        const threshold = TARGET_SCORES[pathId];
        return score >= threshold;
      },

      getNextUnsolvedPuzzle: (pathId) => {
        const progress = get().pathProgress[pathId];
        const pathConfig = getPathPuzzles(pathId);
        if (!pathConfig) return null;

        // GAUNTLET MODE: Collect all unsolved puzzles and return random one
        const unsolvedPuzzles = pathConfig.puzzles.filter(
          (p) => !progress.completedIds.includes(p.id) && !progress.skippedIds.includes(p.id)
        );

        if (unsolvedPuzzles.length === 0) return null;

        // Return random puzzle from unsolved pool
        const randomIndex = Math.floor(Math.random() * unsolvedPuzzles.length);
        return unsolvedPuzzles[randomIndex].id;
      },

      setPathStats: (pathId, stats) => {
        set((state) => ({
          pathStats: { ...state.pathStats, [pathId]: stats },
        }));
      },

      getPathStats: (pathId) => {
        return get().pathStats[pathId];
      },

      hydrateFromDatabase: async (agentId: number) => {
        try {
          // 1. Fetch profile (isTester, agentName, agentRole)
          const profile = await fetchProfile(agentId);
          if (!profile) {
            console.error('Failed to fetch profile during hydration');
            return;
          }

          // 2. Fetch quest progress (completed paths)
          const questProgressData = await fetchQuestProgress(agentId);
          const completedPaths = questProgressData
            .filter((p) => p.isCompleted)
            .map((p) => p.pathId as PathId);

          // 3. Fetch active sessions for all paths
          const sessions: Record<PathId, any> = {};
          for (const pathId of [PATH_IDS.POP_CULTURE, PATH_IDS.RENAISSANCE, PATH_IDS.HEART]) {
            const session = await getOrCreateSession(agentId, pathId);
            if (session) {
              sessions[pathId] = session;
            }
          }

          // 4. Restore full state
          const pathProgress: Record<PathId, PathProgress> = {
            [PATH_IDS.POP_CULTURE]: {
              completedIds: [],
              skippedIds: [],
              mistakes: 0,
              startTime: null,
            },
            [PATH_IDS.RENAISSANCE]: {
              completedIds: [],
              skippedIds: [],
              mistakes: 0,
              startTime: null,
            },
            [PATH_IDS.HEART]: {
              completedIds: [],
              skippedIds: [],
              mistakes: 0,
              startTime: null,
            },
          };

          // Restore progress from active_sessions
          for (const pathId in sessions) {
            const session = sessions[pathId as unknown as PathId];
            if (session) {
              const pathIdNum = Number(pathId) as PathId;
              pathProgress[pathIdNum].mistakes = session.mistakes / 10; // Convert back from integer storage
            }
          }

          // Restore completed/skipped from quest_progress
          for (const progress of questProgressData) {
            const pathId = progress.pathId as PathId;
            if (progress.completedIds) {
              pathProgress[pathId].completedIds = JSON.parse(progress.completedIds as string);
            }
            if (progress.skippedIds) {
              pathProgress[pathId].skippedIds = JSON.parse(progress.skippedIds as string);
            }
          }

          // 5. Update store with hydrated state
          set({
            isAuthenticated: true,
            agentName: profile.agentName,
            agentRole: profile.agentRole,
            agentId: profile.id,
            isTester: profile.isTester,
            userId: profile.id,
            keysCollected: completedPaths,
            pathProgress,
            _hasHydrated: true,
          });

          get().checkVaultStatus();
        } catch (error) {
          console.error('Error hydrating from database:', error);
        }
      },

      checkVaultStatus: () => {
        const { keysCollected } = get();
        const isUnlocked = keysCollected.length === 3;
        set({ isVaultUnlocked: isUnlocked });
      },

      startNewRun: () => {
        set({
          currentRun: {
            mistakes: 0,
            startTime: Date.now(),
          },
        });
      },

      recordMistake: () => {
        set((state) => ({
          currentRun: {
            ...state.currentRun,
            mistakes: state.currentRun.mistakes + 1,
          },
        }));
      },

      resetRun: () => {
        set({
          currentRun: {
            mistakes: 0,
            startTime: null,
          },
        });
      },

      resetQuest: () => {
        set(initialState);
      },
    }),
    {
      name: 'birthday-quest-storage',
      storage: createJSONStorage(() => localStorage),
      // SUPABASE-FIRST: Only persist agentId to localStorage
      partialize: (state) => ({
        agentId: state.agentId,
      }),
      // Set hydration flag after storage is loaded
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Error rehydrating store:', error);
        }
        if (state) {
          state._hasHydrated = true;
        }
      },
      version: 1,
    }
  )
);
