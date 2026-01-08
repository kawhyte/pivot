import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Path IDs mapping
 */
export const PATH_IDS = {
  POP_CULTURE: 1,
  RENAISSANCE: 2,
  HEART: 3,
} as const;

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

export type PathId = typeof PATH_IDS[keyof typeof PATH_IDS];

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
  // User ID for database persistence
  userId: number | null;

  // Active path being played (null = in vault view)
  activePath: PathId | null;

  // Keys collected (path IDs that are completed)
  keysCollected: PathId[];

  // Unlocked paths based on daily drops
  unlockedPaths: PathId[];

  // Current level within each path
  pathLevels: Record<PathId, number>;

  // Performance stats for each completed path
  pathStats: Partial<Record<PathId, PathStats>>;

  // Is vault unlocked (all 3 keys collected)
  isVaultUnlocked: boolean;

  // Has user seen the intro/welcome screen
  hasSeenIntro: boolean;

  // Current run tracking for live achievement stakes
  currentRun: CurrentRun;

  // Actions
  setUserId: (id: number) => void;
  setActivePath: (pathId: PathId | null) => void;
  addKey: (pathId: PathId, stats?: PathStats) => Promise<void>;
  setUnlockedPaths: (paths: PathId[]) => void;
  updatePathLevel: (pathId: PathId, level: number) => Promise<void>;
  setPathStats: (pathId: PathId, stats: PathStats) => void;
  getPathStats: (pathId: PathId) => PathStats | undefined;
  hydrateFromDatabase: (completedPaths: PathId[]) => void;
  checkVaultStatus: () => void;
  setHasSeenIntro: (value: boolean) => void;
  startNewRun: () => void;
  recordMistake: () => void;
  resetRun: () => void;
  resetQuest: () => void;
}

const initialState = {
  userId: null,
  activePath: null,
  keysCollected: [],
  unlockedPaths: [],
  pathLevels: {
    [PATH_IDS.POP_CULTURE]: 1,
    [PATH_IDS.RENAISSANCE]: 1,
    [PATH_IDS.HEART]: 1,
  },
  pathStats: {},
  isVaultUnlocked: false,
  hasSeenIntro: false,
  currentRun: {
    mistakes: 0,
    startTime: null,
  },
};

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUserId: (id) => set({ userId: id }),

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

        // BACKGROUND: Sync to database asynchronously
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
      },

      setUnlockedPaths: (paths) => set({ unlockedPaths: paths }),

      updatePathLevel: async (pathId, level) => {
        // OPTIMISTIC: Update local state immediately
        set((state) => ({
          pathLevels: { ...state.pathLevels, [pathId]: level },
        }));

        // BACKGROUND: Sync to database
        const { userId } = get();
        if (userId) {
          try {
            const { syncPathLevel } = await import('@/app/actions/quest');
            await syncPathLevel(userId, pathId, level);
          } catch (error) {
            console.error('Failed to sync path level:', error);
          }
        }
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

      setHasSeenIntro: (value) => set({ hasSeenIntro: value }),

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

      resetQuest: () => set(initialState),
    }),
    {
      name: 'birthday-quest-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist userId - everything else comes from database
      partialize: (state) => ({ userId: state.userId }),
    }
  )
);
