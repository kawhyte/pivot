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

interface QuestState {
  // Active path being played (null = in vault view)
  activePath: PathId | null;

  // Keys collected (path IDs that are completed)
  keysCollected: PathId[];

  // Unlocked paths based on daily drops
  unlockedPaths: PathId[];

  // Current level within each path
  pathLevels: Record<PathId, number>;

  // Is vault unlocked (all 3 keys collected)
  isVaultUnlocked: boolean;

  // Has user seen the intro/welcome screen
  hasSeenIntro: boolean;

  // Actions
  setActivePath: (pathId: PathId | null) => void;
  addKey: (pathId: PathId) => void;
  setUnlockedPaths: (paths: PathId[]) => void;
  updatePathLevel: (pathId: PathId, level: number) => void;
  checkVaultStatus: () => void;
  setHasSeenIntro: (value: boolean) => void;
  resetQuest: () => void;
}

const initialState = {
  activePath: null,
  keysCollected: [],
  unlockedPaths: [],
  pathLevels: {
    [PATH_IDS.POP_CULTURE]: 1,
    [PATH_IDS.RENAISSANCE]: 1,
    [PATH_IDS.HEART]: 1,
  },
  isVaultUnlocked: false,
  hasSeenIntro: false,
};

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setActivePath: (pathId) => set({ activePath: pathId }),

      addKey: (pathId) => {
        set((state) => {
          const newKeys = [...state.keysCollected, pathId];
          return { keysCollected: newKeys };
        });
        get().checkVaultStatus();
      },

      setUnlockedPaths: (paths) => set({ unlockedPaths: paths }),

      updatePathLevel: (pathId, level) => {
        set((state) => ({
          pathLevels: { ...state.pathLevels, [pathId]: level },
        }));
      },

      checkVaultStatus: () => {
        const { keysCollected } = get();
        const isUnlocked = keysCollected.length === 3;
        set({ isVaultUnlocked: isUnlocked });
      },

      setHasSeenIntro: (value) => set({ hasSeenIntro: value }),

      resetQuest: () => set(initialState),
    }),
    {
      name: 'birthday-quest-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
