import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PathProgress } from '@/types/puzzle';
import type { PathId } from '@/lib/paths';
import { PATH_IDS } from '@/lib/paths';
import { getPathPuzzles, getTotalPuzzles, TARGET_SCORES } from '@/data/puzzles';

// Re-export PATH_IDS and PathId for convenience (backward compatibility)
export { PATH_IDS };
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
      primary: '#6366f1', // Central Perk Purple
      secondary: '#fbbf24', // Stars Hollow Yellow
    },
    unlockDay: 1, // Day 1 of the quest
  },
  [PATH_IDS.RENAISSANCE]: {
    id: PATH_IDS.RENAISSANCE,
    name: 'Renaissance',
    subtitle: 'Knowledge & Discovery',
    colors: {
      primary: '#065f46', // Deep Emerald
      secondary: '#d4af37', // Gold
    },
    unlockDay: 2, // Day 2 of the quest
  },
  [PATH_IDS.HEART]: {
    id: PATH_IDS.HEART,
    name: 'Heart',
    subtitle: 'Our Story',
    colors: {
      primary: '#be123c', // Soft Crimson
      secondary: '#fb7185', // Rose
    },
    unlockDay: 3, // Day 3 of the quest
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

  // User ID for database persistence
  userId: number | null;

  // Hydration state for preventing redirect loops
  _hasHydrated: boolean;

  // Active path being played (null = in vault view)
  activePath: PathId | null;

  // Keys collected (path IDs that are completed)
  keysCollected: PathId[];

  // Unlocked paths based on daily drops
  unlockedPaths: PathId[];

  // Non-linear progress tracking per path (replaces pathLevels)
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
  setAuthentication: (isAuthenticated: boolean, agentName: string, agentRole: string, agentId: number) => void;
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
  hydrateFromDatabase: (completedPaths: PathId[]) => void;
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

      setAuthentication: (isAuthenticated, agentName, agentRole, agentId) =>
        set({ isAuthenticated, agentName, agentRole, agentId, userId: agentId }),

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

        // NOTE: Database sync removed for Vite (client-side only)
        // All state is persisted via Zustand localStorage middleware
        // Server sync was optional additional functionality
        /* NEXT.JS SERVER SYNC (disabled for Vite):
        const { userId } = get();
        if (userId) {
          try {
            const { syncPathCompletion } = await import('@/app/actions/quest');
            await syncPathCompletion(userId, pathId, stats ? {
              timeTaken: stats.completionTime,
              accuracy: stats.accuracy,
              mistakes: stats.mistakes,
              themedTitle: stats.themedTitle,
            } : undefined);
          } catch (error) {
            console.error('Failed to sync key collection:', error);
          }
        }
        */
      },

      setUnlockedPaths: (paths) => set({ unlockedPaths: paths }),

      setCurrentPuzzle: (puzzleId) => set({ currentPuzzleId: puzzleId }),

      submitAnswer: async (pathId, puzzleId, isCorrect, mistakeWeight = 1.0) => {
        // Update progress in store
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

        // Check if key should be unlocked (GAUNTLET MODE: 93% threshold)
        // TARGET_SCORES now represent 93% of max available points
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

      hydrateFromDatabase: (completedPaths) => {
        // Merge database state with local state
        // Database is source of truth for completed paths
        const currentKeys = get().keysCollected;
        const mergedKeys = Array.from(
          new Set([...currentKeys, ...completedPaths])
        ) as PathId[];

        set({ keysCollected: mergedKeys });
        get().checkVaultStatus();
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
      // Persist authentication state and userId
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        agentName: state.agentName,
        agentRole: state.agentRole,
        agentId: state.agentId,
        userId: state.userId,
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
      // Migration: Convert old pathLevels to pathProgress
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Legacy state with pathLevels
          const newState = { ...persistedState };
          if (persistedState.pathLevels && !persistedState.pathProgress) {
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

            // Migrate level progression: mark puzzles as completed up to current level
            for (const pathIdStr in persistedState.pathLevels) {
              const pathId = Number(pathIdStr) as PathId;
              const level = persistedState.pathLevels[pathId];
              const pathConfig = getPathPuzzles(pathId);

              if (pathConfig && level > 1) {
                // Mark first (level - 1) puzzles as completed
                for (let i = 0; i < Math.min(level - 1, pathConfig.puzzles.length); i++) {
                  pathProgress[pathId].completedIds.push(pathConfig.puzzles[i].id);
                }
              }
            }

            newState.pathProgress = pathProgress;
            delete newState.pathLevels;
          }
          return newState;
        }
        return persistedState;
      },
      version: 1,
    }
  )
);
