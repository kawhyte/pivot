import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PathProgress } from '@/types/puzzle';
import { PATH_IDS, type PathId } from '@/lib/paths';
import { getPathPuzzles, getTotalPuzzles, getTotalNonBonusPuzzles, getTotalBonusPuzzles, getTotalBasePoints, getTotalBonusPoints, isBaseComplete } from '@/data/puzzles';
import {
  fetchProfile,
  fetchQuestProgress,
  getOrCreateSession,
  syncSessionProgress,
  savePathCompletion,
} from '@/lib/supabase-sync';
import { calculateNextPathUnlockTime, getUnlockedPaths } from '@/lib/path-unlock';

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
  // Core stats (EXISTING)
  completionTime: number;     // milliseconds
  accuracy: number;           // 0-100
  mistakes: number;           // 0.5 for close, 1.0 for incorrect
  themedTitle: string;        // "Monica Approved 🧹"
  completedAt: number;        // timestamp

  // Detailed stats (NEW)
  totalQuestions: number;
  firstTryCount: number;
  firstTryRate: number;              // Percentage (0-100)
  skippedCount: number;
  avgTimePerQuestion: number;        // Milliseconds
  perfectRunCompleted: boolean;      // Did user complete via perfect run?
  thresholdDecision: '91%' | '100%' | 'abandoned';

  // Tiered reward tracking (NEW)
  isKeyUnlocked?: boolean;    // Track if key was unlocked (Tier 1)
  isBonusUnlocked?: boolean;  // Track if bonus was unlocked (Tier 2)
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

  // Completed paths data for unlock calculation (NEW)
  completedPathsData: Array<{
    pathId: PathId;
    completedAt: string;
    nextPathUnlockAt?: string;
  }>;

  // Non-linear progress tracking per path
  pathProgress: Record<PathId, PathProgress>;

  // Currently viewing puzzle (for non-linear navigation)
  currentPuzzleId: string | null;

  // Performance stats for each completed path
  pathStats: Partial<Record<PathId, PathStats>>;

  // Tiered reward status per path (loaded from DB)
  pathUnlockStatus: Partial<Record<PathId, {
    isKeyUnlocked: boolean;
    isBonusUnlocked: boolean;
  }>>;

  // Is vault unlocked (all 3 keys collected)
  isVaultUnlocked: boolean;

  // Current run tracking for live achievement stakes
  currentRun: CurrentRun;

  // Streak tracking for dynamic success messages
  currentStreak: number;

  // Actions
  setAuthentication: (isAuthenticated: boolean, agentName: string, agentRole: string, agentId: number, isTester: boolean) => void;
  setUserId: (id: number) => void;
  setHasHydrated: (hydrated: boolean) => void;
  setActivePath: (pathId: PathId | null) => void;
  addKey: (pathId: PathId, stats?: PathStats) => Promise<void>;
  setUnlockedPaths: (paths: PathId[]) => void;
  setPathUnlockStatus: (pathId: PathId, status: { isKeyUnlocked?: boolean; isBonusUnlocked?: boolean }) => void;
  setCurrentPuzzle: (puzzleId: string | null) => void;
  submitAnswer: (pathId: PathId, puzzleId: string, isCorrect: boolean, mistakeWeight?: number, timeSpent?: number) => Promise<void>;
  skipPuzzle: (pathId: PathId, puzzleId: string) => Promise<void>;
  setPathStats: (pathId: PathId, stats: PathStats) => void;
  getPathStats: (pathId: PathId) => PathStats | undefined;
  getPathScore: (pathId: PathId) => number;
  isPerfectRun: (pathId: PathId) => boolean;
  isPathUnlocked: (pathId: PathId) => boolean;
  getNextUnsolvedPuzzle: (pathId: PathId, excludeId?: string) => string | null;
  hydrateFromDatabase: (agentId: number) => Promise<void>;
  checkVaultStatus: () => void;
  startNewRun: () => void;
  recordMistake: () => void;
  resetRun: () => void;
  resetQuest: () => void;

  // NEW: Perfect Run Management
  startPerfectRun: (pathId: PathId) => void;
  endPerfectRun: (pathId: PathId, success: boolean) => void;
  incrementPerfectRunStreak: (pathId: PathId) => void;

  // NEW: Bonus Mode Management (Sudden Death)
  startBonusMode: (pathId: PathId) => Promise<void>;
  endBonusMode: (pathId: PathId) => Promise<void>;

  // NEW: Time Tracking
  startPathTimer: (pathId: PathId) => void;
  pausePathTimer: (pathId: PathId) => void;
  resumePathTimer: (pathId: PathId) => void;

  // NEW: Puzzle-Level Tracking
  recordPuzzleAttempt: (pathId: PathId, puzzleId: string, timeSpent: number) => void;
  completePuzzle: (pathId: PathId, puzzleId: string, isFirstTry: boolean) => void;

  // Streak-based dynamic messages
  getStreakMessage: () => string;

  // God Mode: Solve current puzzle instantly
  solveCurrentPuzzle: () => Promise<void>;
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
  completedPathsData: [],
  pathUnlockStatus: {},
  pathProgress: {
    [PATH_IDS.POP_CULTURE]: {
      completedIds: [],
      skippedIds: [],
      mistakes: 0,
      startTime: null,
      puzzleAttempts: {},
      isPerfectRunActive: false,
      perfectRunStartScore: 0,
      perfectRunStartTime: null,
      perfectRunStreak: 0,
      hasSeenThresholdModal: false,
      isBonusMode: false,
      totalTimeSpent: 0,
      isPaused: false,
      lastResumeTime: null,
    },
    [PATH_IDS.RENAISSANCE]: {
      completedIds: [],
      skippedIds: [],
      mistakes: 0,
      startTime: null,
      puzzleAttempts: {},
      isPerfectRunActive: false,
      perfectRunStartScore: 0,
      perfectRunStartTime: null,
      perfectRunStreak: 0,
      hasSeenThresholdModal: false,
      isBonusMode: false,
      totalTimeSpent: 0,
      isPaused: false,
      lastResumeTime: null,
    },
    [PATH_IDS.HEART]: {
      completedIds: [],
      skippedIds: [],
      mistakes: 0,
      startTime: null,
      puzzleAttempts: {},
      isPerfectRunActive: false,
      perfectRunStartScore: 0,
      perfectRunStartTime: null,
      perfectRunStreak: 0,
      hasSeenThresholdModal: false,
      isBonusMode: false,
      totalTimeSpent: 0,
      isPaused: false,
      lastResumeTime: null,
    },
  },
  currentPuzzleId: null,
  pathStats: {},
  isVaultUnlocked: false,
  currentRun: {
    mistakes: 0,
    startTime: null,
  },
  currentStreak: 0,
};

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => {
      // ========================================
      // PRIVATE HELPER: Calculate Path Stats
      // ========================================
      const calculateStats = (
        pathId: PathId,
        themedTitle: string,
        perfectRunCompleted: boolean,
        thresholdDecision: '91%' | '100%' | 'abandoned'
      ): PathStats => {
        const finalProgress = get().pathProgress[pathId];
        const score = get().getPathScore(pathId);
        const totalNonBonus = getTotalNonBonusPuzzles(pathId);
        const totalBonus = getTotalBonusPuzzles(pathId);

        // Calculate total questions based on whether bonus was completed
        const totalQuestions = perfectRunCompleted ? totalNonBonus + totalBonus : totalNonBonus;

        // Calculate first-try statistics
        const firstTryCount = Object.values(finalProgress.puzzleAttempts)
          .filter((a) => a.isFirstTry && a.isCompleted).length;
        const firstTryRate = totalQuestions > 0
          ? Math.round((firstTryCount / totalQuestions) * 100)
          : 0;

        // Calculate average time per question
        const avgTimePerQuestion = totalQuestions > 0
          ? Math.round(finalProgress.totalTimeSpent / totalQuestions)
          : 0;

        // Calculate accuracy
        const accuracy = totalQuestions > 0
          ? Math.round(((totalQuestions - finalProgress.mistakes) / totalQuestions) * 100)
          : 100;

        return {
          completionTime: finalProgress.totalTimeSpent,
          accuracy,
          mistakes: finalProgress.mistakes,
          themedTitle,
          completedAt: Date.now(),
          totalQuestions,
          firstTryCount,
          firstTryRate,
          skippedCount: finalProgress.skippedIds.length,
          avgTimePerQuestion,
          perfectRunCompleted,
          thresholdDecision,
        };
      };

      return {
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

          // If stats provided, store them (with unlock flags)
          if (stats) {
            updates.pathStats = { ...state.pathStats, [pathId]: stats };

            // Update unlock status if provided
            if (stats.isKeyUnlocked !== undefined || stats.isBonusUnlocked !== undefined) {
              updates.pathUnlockStatus = {
                ...state.pathUnlockStatus,
                [pathId]: {
                  isKeyUnlocked: stats.isKeyUnlocked ?? state.pathUnlockStatus[pathId]?.isKeyUnlocked ?? false,
                  isBonusUnlocked: stats.isBonusUnlocked ?? state.pathUnlockStatus[pathId]?.isBonusUnlocked ?? false,
                },
              };
            }
          }

          return updates;
        });
        get().checkVaultStatus();

        // SUPABASE SYNC: Save path completion to database
        const { agentId, pathProgress, isTester } = get();
        if (agentId) {
          try {
            const progress = pathProgress[pathId];
            const score = get().getPathScore(pathId);

            // Calculate next path unlock time (8am next day)
            const completedAt = new Date();
            const nextPathUnlockAt = calculateNextPathUnlockTime(completedAt);

            await savePathCompletion(agentId, pathId, {
              completedIds: progress.completedIds,
              skippedIds: progress.skippedIds,
              finalScore: score,
              accuracy: stats?.accuracy || 100,
              mistakes: progress.mistakes,
              themedTitle: stats?.themedTitle || 'Completed',
              timeTaken: stats?.completionTime,
              totalQuestions: stats?.totalQuestions,
              firstTryCount: stats?.firstTryCount,
              firstTryRate: stats?.firstTryRate,
              skippedCount: stats?.skippedCount,
              avgTimePerQuestion: stats?.avgTimePerQuestion,
              perfectRunCompleted: stats?.perfectRunCompleted,
              thresholdDecision: stats?.thresholdDecision,
              nextPathUnlockAt: nextPathUnlockAt.toISOString(),
              // NEW: Pass unlock flags from stats
              isKeyUnlocked: stats?.isKeyUnlocked ?? false,
              isBonusUnlocked: stats?.isBonusUnlocked ?? false,
            });

            // Re-fetch quest progress to update completedPathsData
            const allCompletedPaths = await fetchQuestProgress(agentId);
            const completedPathsData = allCompletedPaths
              .filter(p => p.is_completed)
              .map(p => ({
                pathId: p.path_id as PathId,
                completedAt: p.completed_at!,
                nextPathUnlockAt: p.next_path_unlock_at,
              }));

            // Re-calculate unlocked paths based on completion
            const newUnlockedPaths = getUnlockedPaths(completedPathsData, isTester);

            // Update store with new data
            set({
              completedPathsData,
              unlockedPaths: newUnlockedPaths,
            });
          } catch (error) {
            console.error('Failed to sync key collection:', error);
          }
        }
      },

      setUnlockedPaths: (paths) => set({ unlockedPaths: paths }),

      setPathUnlockStatus: (pathId, status) => {
        set((state) => ({
          pathUnlockStatus: {
            ...state.pathUnlockStatus,
            [pathId]: {
              ...state.pathUnlockStatus[pathId],
              ...status,
            },
          },
        }));
      },

      setCurrentPuzzle: (puzzleId) => set({ currentPuzzleId: puzzleId }),

      submitAnswer: async (pathId, puzzleId, isCorrect, mistakeWeight = 1.0, timeSpent = 0) => {
        // 1. Track puzzle attempt (record time spent on this puzzle)
        if (timeSpent > 0) {
          get().recordPuzzleAttempt(pathId, puzzleId, timeSpent);
        }

        // Get current state
        const progress = get().pathProgress[pathId];
        const attemptData = progress.puzzleAttempts[puzzleId];
        const isFirstTry = attemptData?.attempts === 1;
        const pathConfig = getPathPuzzles(pathId);
        if (!pathConfig) return;

        // 2. OPTIMISTIC UPDATE: Update local state immediately
        if (isCorrect) {
          set((state) => {
            const progress = { ...state.pathProgress[pathId] };

            // Add to completed, remove from skipped
            if (!progress.completedIds.includes(puzzleId)) {
              progress.completedIds.push(puzzleId);
            }
            progress.skippedIds = progress.skippedIds.filter((id) => id !== puzzleId);

            return {
              pathProgress: { ...state.pathProgress, [pathId]: progress },
              currentStreak: state.currentStreak + 1, // Increment streak on correct answer
            };
          });

          // Mark puzzle as completed
          get().completePuzzle(pathId, puzzleId, isFirstTry);

          // 3. NEW LOGIC: Question-Count Completion System (replaces point-based)
          const updatedProgress = get().pathProgress[pathId];
          const totalBonusPuzzles = getTotalBonusPuzzles(pathId);
          const baseComplete = isBaseComplete(pathId, updatedProgress.completedIds);

          // Helper: Get path-specific legendary title
          const getLegendaryTitle = (pathId: PathId): string => {
            switch (pathId) {
              case PATH_IDS.POP_CULTURE:
                return "Monica's Geller Cup 🏆";
              case PATH_IDS.RENAISSANCE:
                return "Da Vinci's Apprentice 🎨";
              case PATH_IDS.HEART:
                return "WhyteHouse Legend ❤️";
              default:
                return "Sudden Death Master!";
            }
          };

          // 4. Check if 100% BASE QUESTIONS completed
          if (!updatedProgress.isBonusMode && baseComplete) {
            // BASE 100% COMPLETE! Award key immediately
            const stats = calculateStats(pathId, 'Completed!', false, '100%');
            await get().addKey(pathId, stats);

            // QuestPage will auto-trigger Sudden Death transition if bonus puzzles exist
            // If user completes all bonus: key stats will be overwritten with legendary title
          }
          // 5. Check if BONUS MODE and ALL bonus questions completed
          else if (updatedProgress.isBonusMode) {
            // Count completed bonus puzzles
            const completedBonusIds = updatedProgress.completedIds.filter(id => {
              const puzzle = pathConfig.puzzles.find(p => p.id === id);
              return puzzle && puzzle.isBonus === true;
            });

            if (completedBonusIds.length === totalBonusPuzzles) {
              // SUDDEN DEATH SUCCESS! 🎉
              const stats = calculateStats(pathId, getLegendaryTitle(pathId), true, '100%');

              // NEW: Add unlock flags (both key and bonus unlocked)
              stats.isKeyUnlocked = true;
              stats.isBonusUnlocked = true;

              // End bonus mode and award key (will overwrite previous key stats if any)
              await get().endBonusMode(pathId);
              await get().addKey(pathId, stats);

              // Update unlock status in store
              get().setPathUnlockStatus(pathId, { isBonusUnlocked: true });
            }
          }
        } else {
          // WRONG ANSWER

          // Reset streak on incorrect answer
          set({ currentStreak: 0 });

          // 6. SUDDEN DEATH FAILURE: If in bonus mode, end immediately and award key
          if (progress.isBonusMode) {
            // END BONUS MODE (failure) - but still award key since 100% base was achieved
            const stats = calculateStats(pathId, 'Mastery Complete', false, '100%');

            // NEW: Add unlock flags (key unlocked, bonus NOT unlocked)
            stats.isKeyUnlocked = true;
            stats.isBonusUnlocked = false;

            // End bonus mode first
            await get().endBonusMode(pathId);

            // Award the key (since 100% base points were already achieved)
            await get().addKey(pathId, stats);

            // Update unlock status in store
            get().setPathUnlockStatus(pathId, { isBonusUnlocked: false });

            // Note: BonusFailureModal will be shown in QuestPage with seamless transition to Stats
            return; // Exit early, don't track mistakes
          }

          // Standard mistake tracking (non-bonus mode)
          set((state) => {
            const progress = { ...state.pathProgress[pathId] };
            progress.mistakes += mistakeWeight;

            return {
              pathProgress: { ...state.pathProgress, [pathId]: progress },
            };
          });
        }

        // 7. SUPABASE SYNC: Sync progress to database (REAL-TIME)
        const { agentId } = get();
        console.log('📊 submitAnswer - agentId:', agentId);

        if (agentId) {
          const currentProgress = get().pathProgress[pathId];
          const score = get().getPathScore(pathId);

          console.log('💾 Calling syncSessionProgress with:', {
            agentId,
            pathId,
            completedCount: currentProgress.completedIds.length,
            skippedCount: currentProgress.skippedIds.length,
            score,
            isBonusMode: currentProgress.isBonusMode,
          });

          await syncSessionProgress(agentId, pathId, {
            currentPuzzleId: puzzleId,
            score,
            mistakes: Math.round(currentProgress.mistakes * 10), // Store as integer
            // Real-time progress (critical for mid-quiz persistence)
            completedIds: currentProgress.completedIds,
            skippedIds: currentProgress.skippedIds,
            // Perfect run state (legacy, may be deprecated)
            isPerfectRunActive: currentProgress.isPerfectRunActive,
            perfectRunStartScore: currentProgress.perfectRunStartScore,
            perfectRunStreak: currentProgress.perfectRunStreak,
            hasSeenThresholdModal: currentProgress.hasSeenThresholdModal,
            // NEW: Bonus mode state
            isBonusMode: currentProgress.isBonusMode,
            // Time tracking
            totalTimeSpent: currentProgress.totalTimeSpent,
            isPaused: currentProgress.isPaused,
            // Per-puzzle attempts
            puzzleAttempts: currentProgress.puzzleAttempts,
          });
        } else {
          console.error('❌ No agentId found - cannot sync to database!');
        }
      },

      skipPuzzle: async (pathId, puzzleId) => {
        // Reset streak on skip
        set({ currentStreak: 0 });

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

        // Sync to database (REAL-TIME)
        const { agentId } = get();
        if (agentId) {
          const currentProgress = get().pathProgress[pathId];
          const score = get().getPathScore(pathId);

          await syncSessionProgress(agentId, pathId, {
            score,
            mistakes: Math.round(currentProgress.mistakes * 10),
            completedIds: currentProgress.completedIds,
            skippedIds: currentProgress.skippedIds,
            isPerfectRunActive: currentProgress.isPerfectRunActive,
            perfectRunStartScore: currentProgress.perfectRunStartScore,
            perfectRunStreak: currentProgress.perfectRunStreak,
            hasSeenThresholdModal: currentProgress.hasSeenThresholdModal,
            totalTimeSpent: currentProgress.totalTimeSpent,
            isPaused: currentProgress.isPaused,
            puzzleAttempts: currentProgress.puzzleAttempts,
          });
        }
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
        const requiredPoints = getTotalBasePoints(pathId);
        return score >= requiredPoints;
      },

      getNextUnsolvedPuzzle: (pathId, excludeId) => {
        const progress = get().pathProgress[pathId];
        const pathConfig = getPathPuzzles(pathId);
        if (!pathConfig) return null;

        // NEW LOGIC: Filter puzzles based on mode
        // - If bonus mode is active → show ONLY bonus puzzles
        // - If bonus mode is NOT active → show ONLY non-bonus puzzles
        const showBonusOnly = progress.isBonusMode;

        // GAUNTLET MODE: First try to get fresh puzzles (not completed, not skipped)
        let freshPuzzles = pathConfig.puzzles.filter(
          (p) =>
            !progress.completedIds.includes(p.id) &&
            !progress.skippedIds.includes(p.id) &&
            (showBonusOnly ? !!p.isBonus : !p.isBonus)
        );

        // Exclude the current puzzle ID if provided
        if (excludeId) {
          freshPuzzles = freshPuzzles.filter((p) => p.id !== excludeId);
        }

        // If we have fresh puzzles, pick one
        if (freshPuzzles.length > 0) {
          const randomIndex = Math.floor(Math.random() * freshPuzzles.length);
          return freshPuzzles[randomIndex].id;
        }

        // If no fresh puzzles, allow retrying skipped puzzles (same filtering rules)
        let skippedPuzzles = pathConfig.puzzles.filter(
          (p) =>
            !progress.completedIds.includes(p.id) &&
            progress.skippedIds.includes(p.id) &&
            (showBonusOnly ? !!p.isBonus : !p.isBonus)
        );

        // Exclude the current puzzle ID if provided
        if (excludeId) {
          skippedPuzzles = skippedPuzzles.filter((p) => p.id !== excludeId);
        }

        if (skippedPuzzles.length > 0) {
          const randomIndex = Math.floor(Math.random() * skippedPuzzles.length);
          return skippedPuzzles[randomIndex].id;
        }

        return null;
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
            .filter((p) => p.is_completed)
            .map((p) => p.path_id as PathId);

          // NEW: Create completedPathsData for unlock calculation
          const completedPathsData = questProgressData
            .filter((p) => p.is_completed)
            .map((p) => ({
              pathId: p.path_id as PathId,
              completedAt: p.completed_at!,
              nextPathUnlockAt: p.next_path_unlock_at,
            }));

          // NEW: Calculate unlocked paths based on completion
          const unlockedPaths = getUnlockedPaths(completedPathsData, profile.isTester);

          // NEW: Extract unlock status from quest progress
          const pathUnlockStatus: Partial<Record<PathId, any>> = {};
          questProgressData.forEach((p) => {
            if (p.is_completed) {
              pathUnlockStatus[p.path_id as PathId] = {
                isKeyUnlocked: p.is_key_unlocked ?? false,
                isBonusUnlocked: p.is_bonus_unlocked ?? false,
              };
            }
          });

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
              puzzleAttempts: {},
              isPerfectRunActive: false,
              perfectRunStartScore: 0,
              perfectRunStartTime: null,
              perfectRunStreak: 0,
              hasSeenThresholdModal: false,
              isBonusMode: false,
              totalTimeSpent: 0,
              isPaused: false,
              lastResumeTime: null,
            },
            [PATH_IDS.RENAISSANCE]: {
              completedIds: [],
              skippedIds: [],
              mistakes: 0,
              startTime: null,
              puzzleAttempts: {},
              isPerfectRunActive: false,
              perfectRunStartScore: 0,
              perfectRunStartTime: null,
              perfectRunStreak: 0,
              hasSeenThresholdModal: false,
              isBonusMode: false,
              totalTimeSpent: 0,
              isPaused: false,
              lastResumeTime: null,
            },
            [PATH_IDS.HEART]: {
              completedIds: [],
              skippedIds: [],
              mistakes: 0,
              startTime: null,
              puzzleAttempts: {},
              isPerfectRunActive: false,
              perfectRunStartScore: 0,
              perfectRunStartTime: null,
              perfectRunStreak: 0,
              hasSeenThresholdModal: false,
              isBonusMode: false,
              totalTimeSpent: 0,
              isPaused: false,
              lastResumeTime: null,
            },
          };

          // Restore progress from active_sessions (REAL-TIME DATA)
          for (const pathId in sessions) {
            const session = sessions[pathId as unknown as PathId];
            if (session) {
              const pathIdNum = Number(pathId) as PathId;
              // Restore basic progress
              pathProgress[pathIdNum].mistakes = session.mistakes / 10; // Convert back from integer storage

              // NEW: Restore real-time progress (completed/skipped from active_sessions, not quest_progress)
              pathProgress[pathIdNum].completedIds = session.completed_ids ?
                (Array.isArray(session.completed_ids) ? session.completed_ids : JSON.parse(session.completed_ids))
                : [];
              pathProgress[pathIdNum].skippedIds = session.skipped_ids ?
                (Array.isArray(session.skipped_ids) ? session.skipped_ids : JSON.parse(session.skipped_ids))
                : [];

              // NEW: Restore perfect run state (legacy, may be deprecated)
              pathProgress[pathIdNum].isPerfectRunActive = session.is_perfect_run_active ?? false;
              pathProgress[pathIdNum].perfectRunStartScore = session.perfect_run_start_score ?? 0;
              pathProgress[pathIdNum].perfectRunStreak = session.perfect_run_streak ?? 0;
              pathProgress[pathIdNum].hasSeenThresholdModal = session.has_seen_threshold_modal ?? false;

              // NEW: Restore bonus mode state
              pathProgress[pathIdNum].isBonusMode = session.is_bonus_mode ?? false;

              // NEW: Restore time tracking
              pathProgress[pathIdNum].totalTimeSpent = session.total_time_spent ?? 0;
              pathProgress[pathIdNum].isPaused = session.is_paused ?? false;

              // NEW: Restore puzzle attempts
              pathProgress[pathIdNum].puzzleAttempts = session.puzzle_attempts ?? {};
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
            completedPathsData,
            unlockedPaths,
            pathProgress,
            pathUnlockStatus,
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

      // ====================
      // NEW: Perfect Run Management
      // ====================
      startPerfectRun: async (pathId) => {
        set((state) => ({
          pathProgress: {
            ...state.pathProgress,
            [pathId]: {
              ...state.pathProgress[pathId],
              isPerfectRunActive: true,
              perfectRunStartScore: get().getPathScore(pathId),
              perfectRunStartTime: Date.now(),
              perfectRunStreak: 0,
              hasSeenThresholdModal: true,
            },
          },
        }));

        // Sync to database
        const { agentId } = get();
        if (agentId) {
          const currentProgress = get().pathProgress[pathId];
          const score = get().getPathScore(pathId);

          await syncSessionProgress(agentId, pathId, {
            score,
            isPerfectRunActive: true,
            perfectRunStartScore: score,
            perfectRunStreak: 0,
            hasSeenThresholdModal: true,
            puzzleAttempts: currentProgress.puzzleAttempts,
          });
        }
      },

      endPerfectRun: async (pathId, success) => {
        set((state) => ({
          pathProgress: {
            ...state.pathProgress,
            [pathId]: {
              ...state.pathProgress[pathId],
              isPerfectRunActive: false,
              perfectRunStartTime: null,
            },
          },
        }));

        // Sync to database
        const { agentId } = get();
        if (agentId) {
          const currentProgress = get().pathProgress[pathId];
          const score = get().getPathScore(pathId);

          await syncSessionProgress(agentId, pathId, {
            score,
            isPerfectRunActive: false,
            puzzleAttempts: currentProgress.puzzleAttempts,
          });
        }
      },

      incrementPerfectRunStreak: async (pathId) => {
        set((state) => ({
          pathProgress: {
            ...state.pathProgress,
            [pathId]: {
              ...state.pathProgress[pathId],
              perfectRunStreak: state.pathProgress[pathId].perfectRunStreak + 1,
            },
          },
        }));

        // Sync to database
        const { agentId } = get();
        if (agentId) {
          const currentProgress = get().pathProgress[pathId];
          const score = get().getPathScore(pathId);

          await syncSessionProgress(agentId, pathId, {
            score,
            perfectRunStreak: currentProgress.perfectRunStreak,
            puzzleAttempts: currentProgress.puzzleAttempts,
          });
        }
      },

      // ====================
      // NEW: Bonus Mode Management (Sudden Death)
      // ====================
      startBonusMode: async (pathId) => {
        set((state) => ({
          pathProgress: {
            ...state.pathProgress,
            [pathId]: {
              ...state.pathProgress[pathId],
              isBonusMode: true,
            },
          },
        }));

        // Sync to database
        const { agentId } = get();
        if (agentId) {
          const currentProgress = get().pathProgress[pathId];
          const score = get().getPathScore(pathId);

          await syncSessionProgress(agentId, pathId, {
            score,
            isBonusMode: true,
            puzzleAttempts: currentProgress.puzzleAttempts,
          });
        }
      },

      endBonusMode: async (pathId) => {
        set((state) => ({
          pathProgress: {
            ...state.pathProgress,
            [pathId]: {
              ...state.pathProgress[pathId],
              isBonusMode: false,
            },
          },
        }));

        // Sync to database
        const { agentId } = get();
        if (agentId) {
          const currentProgress = get().pathProgress[pathId];
          const score = get().getPathScore(pathId);

          await syncSessionProgress(agentId, pathId, {
            score,
            isBonusMode: false,
            puzzleAttempts: currentProgress.puzzleAttempts,
          });
        }
      },

      // ====================
      // NEW: Time Tracking
      // ====================
      startPathTimer: (pathId) => {
        set((state) => ({
          pathProgress: {
            ...state.pathProgress,
            [pathId]: {
              ...state.pathProgress[pathId],
              startTime: Date.now(),
              isPaused: false,
              lastResumeTime: Date.now(),
            },
          },
        }));
      },

      pausePathTimer: async (pathId) => {
        const state = get();
        const progress = state.pathProgress[pathId];

        if (!progress.isPaused && progress.lastResumeTime) {
          const elapsed = Date.now() - progress.lastResumeTime;
          set((state) => ({
            pathProgress: {
              ...state.pathProgress,
              [pathId]: {
                ...state.pathProgress[pathId],
                totalTimeSpent: state.pathProgress[pathId].totalTimeSpent + elapsed,
                isPaused: true,
                lastResumeTime: null,
              },
            },
          }));

          // Sync to database
          const { agentId } = get();
          if (agentId) {
            const currentProgress = get().pathProgress[pathId];
            const score = get().getPathScore(pathId);

            await syncSessionProgress(agentId, pathId, {
              score,
              totalTimeSpent: currentProgress.totalTimeSpent,
              isPaused: true,
              puzzleAttempts: currentProgress.puzzleAttempts,
            });
          }
        }
      },

      resumePathTimer: async (pathId) => {
        set((state) => ({
          pathProgress: {
            ...state.pathProgress,
            [pathId]: {
              ...state.pathProgress[pathId],
              isPaused: false,
              lastResumeTime: Date.now(),
            },
          },
        }));

        // Sync to database
        const { agentId } = get();
        if (agentId) {
          const currentProgress = get().pathProgress[pathId];
          const score = get().getPathScore(pathId);

          await syncSessionProgress(agentId, pathId, {
            score,
            isPaused: false,
            puzzleAttempts: currentProgress.puzzleAttempts,
          });
        }
      },

      // ====================
      // NEW: Puzzle-Level Tracking
      // ====================
      recordPuzzleAttempt: (pathId, puzzleId, timeSpent) => {
        set((state) => {
          const currentAttempt = state.pathProgress[pathId].puzzleAttempts[puzzleId] || {
            attempts: 0,
            totalTimeSpent: 0,
            isFirstTry: false,
            isCompleted: false,
            lastAttemptTime: null,
          };

          return {
            pathProgress: {
              ...state.pathProgress,
              [pathId]: {
                ...state.pathProgress[pathId],
                totalTimeSpent: state.pathProgress[pathId].totalTimeSpent + timeSpent,
                puzzleAttempts: {
                  ...state.pathProgress[pathId].puzzleAttempts,
                  [puzzleId]: {
                    ...currentAttempt,
                    attempts: currentAttempt.attempts + 1,
                    totalTimeSpent: currentAttempt.totalTimeSpent + timeSpent,
                    lastAttemptTime: Date.now(),
                  },
                },
              },
            },
          };
        });
      },

      completePuzzle: (pathId, puzzleId, isFirstTry) => {
        set((state) => ({
          pathProgress: {
            ...state.pathProgress,
            [pathId]: {
              ...state.pathProgress[pathId],
              puzzleAttempts: {
                ...state.pathProgress[pathId].puzzleAttempts,
                [puzzleId]: {
                  ...state.pathProgress[pathId].puzzleAttempts[puzzleId],
                  isFirstTry,
                  isCompleted: true,
                },
              },
            },
          },
        }));
      },

      getStreakMessage: () => {
        const { currentStreak, activePath, currentPuzzleId } = get();

        // Get current puzzle to check for show metadata
        let show: 'friends' | 'gilmore' | undefined;
        if (activePath && currentPuzzleId) {
          const pathConfig = getPathPuzzles(activePath);
          const currentPuzzle = pathConfig?.puzzles.find(p => p.id === currentPuzzleId);
          show = currentPuzzle?.metadata?.show;
        }

        // Path ID 1 (Pop Culture) with show-specific messages
        if (activePath === PATH_IDS.POP_CULTURE && currentStreak >= 2) {
          if (currentStreak === 2) {
            return show === 'friends' ? "YOU'RE HER LOBSTER! 🦞" : "COPPER BOOM! 💥";
          } else if (currentStreak === 3) {
            return show === 'friends' ? "UNAGI! 🍣" : "OY WITH THE POODLES!";
          } else if (currentStreak >= 4) {
            return show === 'friends' ? "PIVOT!" : "IN OMNIA PARATUS! ☂️";
          }
        }

        // Generic messages for all paths
        const genericMessages = ["AWESOME!", "PERFECT!", "COMBO!", "UNSTOPPABLE!"];
        const index = Math.min(currentStreak - 1, genericMessages.length - 1);
        return genericMessages[Math.max(0, index)];
      },

      solveCurrentPuzzle: async () => {
        const { activePath, currentPuzzleId } = get();

        if (!activePath || !currentPuzzleId) {
          console.warn('⚠️ No active puzzle to solve');
          return;
        }

        console.log(`🎯 God Mode: Auto-solving puzzle ${currentPuzzleId} on path ${activePath}`);

        // Submit answer as correct with minimal time
        await get().submitAnswer(activePath, currentPuzzleId, true, 0, 1000);

        console.log('✅ Puzzle solved!');
      },
    };
    },
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
