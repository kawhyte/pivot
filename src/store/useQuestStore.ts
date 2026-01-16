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

  // NEW: Time Tracking
  startPathTimer: (pathId: PathId) => void;
  pausePathTimer: (pathId: PathId) => void;
  resumePathTimer: (pathId: PathId) => void;

  // NEW: Puzzle-Level Tracking
  recordPuzzleAttempt: (pathId: PathId, puzzleId: string, timeSpent: number) => void;
  completePuzzle: (pathId: PathId, puzzleId: string, isFirstTry: boolean) => void;

  // NEW: Threshold Decision
  recordThresholdDecision: (pathId: PathId, decision: '91%' | '100%') => void;
  setHasSeenThresholdModal: (pathId: PathId, seen: boolean) => void;
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
            };
          });

          // Mark puzzle as completed
          get().completePuzzle(pathId, puzzleId, isFirstTry);

          // 3. Perfect run handling
          if (progress.isPerfectRunActive) {
            get().incrementPerfectRunStreak(pathId);

            // Check if 100% completion reached
            const totalPuzzles = getTotalPuzzles(pathId);
            const newCompletedCount = get().pathProgress[pathId].completedIds.length;

            if (newCompletedCount === totalPuzzles) {
              // PERFECT RUN SUCCESS! 🎉
              // Calculate final stats and add key
              const finalProgress = get().pathProgress[pathId];
              const score = get().getPathScore(pathId);

              // Calculate detailed stats
              const totalQuestions = totalPuzzles;
              const firstTryCount = Object.values(finalProgress.puzzleAttempts)
                .filter((a) => a.isFirstTry && a.isCompleted).length;
              const firstTryRate = Math.round((firstTryCount / totalQuestions) * 100);
              const skippedCount = finalProgress.skippedIds.length;
              const avgTimePerQuestion = totalQuestions > 0
                ? Math.round(finalProgress.totalTimeSpent / totalQuestions)
                : 0;

              const stats: PathStats = {
                completionTime: finalProgress.totalTimeSpent,
                accuracy: Math.round(((totalQuestions - finalProgress.mistakes) / totalQuestions) * 100),
                mistakes: finalProgress.mistakes,
                themedTitle: 'Perfect!',
                completedAt: Date.now(),
                totalQuestions,
                firstTryCount,
                firstTryRate,
                skippedCount,
                avgTimePerQuestion,
                perfectRunCompleted: true,
                thresholdDecision: '100%',
              };

              await get().addKey(pathId, stats);
            }
          }
          // 4. Check 91% threshold (if not in perfect run mode)
          else {
            const score = get().getPathScore(pathId);
            const threshold = TARGET_SCORES[pathId];

            // Note: We don't auto-unlock here anymore
            // The modal will be triggered in QuestPage when hasSeenThresholdModal = false
          }
        } else {
          // WRONG ANSWER

          // Perfect run failure?
          if (progress.isPerfectRunActive) {
            // END PERFECT RUN (failure)
            get().endPerfectRun(pathId, false);
            // Note: PerfectRunFailureModal will be shown in QuestPage
            return; // Exit early, don't track mistakes
          }

          // Standard mistake tracking (non-perfect-run mode)
          set((state) => {
            const progress = { ...state.pathProgress[pathId] };
            progress.mistakes += mistakeWeight;

            return {
              pathProgress: { ...state.pathProgress, [pathId]: progress },
            };
          });
        }

        // 5. SUPABASE SYNC: Sync progress to database (REAL-TIME)
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
          });

          await syncSessionProgress(agentId, pathId, {
            currentPuzzleId: puzzleId,
            score,
            mistakes: Math.round(currentProgress.mistakes * 10), // Store as integer
            // NEW: Real-time progress (critical for mid-quiz persistence)
            completedIds: currentProgress.completedIds,
            skippedIds: currentProgress.skippedIds,
            // NEW: Perfect run state
            isPerfectRunActive: currentProgress.isPerfectRunActive,
            perfectRunStartScore: currentProgress.perfectRunStartScore,
            perfectRunStreak: currentProgress.perfectRunStreak,
            hasSeenThresholdModal: currentProgress.hasSeenThresholdModal,
            // NEW: Time tracking
            totalTimeSpent: currentProgress.totalTimeSpent,
            isPaused: currentProgress.isPaused,
            // NEW: Per-puzzle attempts
            puzzleAttempts: currentProgress.puzzleAttempts,
          });
        } else {
          console.error('❌ No agentId found - cannot sync to database!');
        }
      },

      skipPuzzle: async (pathId, puzzleId) => {
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
        const threshold = TARGET_SCORES[pathId];
        return score >= threshold;
      },

      getNextUnsolvedPuzzle: (pathId, excludeId) => {
        const progress = get().pathProgress[pathId];
        const pathConfig = getPathPuzzles(pathId);
        if (!pathConfig) {
          console.log('❌ No path config found for pathId:', pathId);
          return null;
        }

        console.log('🔍 Getting next unsolved puzzle for path:', pathId);
        console.log('📊 Completed IDs:', progress.completedIds);
        console.log('⏭️  Skipped IDs:', progress.skippedIds);
        console.log('🚫 Exclude ID:', excludeId);

        // GAUNTLET MODE: First try to get fresh puzzles (not completed, not skipped)
        let freshPuzzles = pathConfig.puzzles.filter(
          (p) => !progress.completedIds.includes(p.id) && !progress.skippedIds.includes(p.id)
        );

        console.log('🆕 Fresh puzzles before exclude:', freshPuzzles.map(p => p.id));

        // Exclude the current puzzle ID if provided
        if (excludeId) {
          freshPuzzles = freshPuzzles.filter((p) => p.id !== excludeId);
          console.log('🆕 Fresh puzzles after exclude:', freshPuzzles.map(p => p.id));
        }

        // If we have fresh puzzles, pick one
        if (freshPuzzles.length > 0) {
          const randomIndex = Math.floor(Math.random() * freshPuzzles.length);
          const selectedPuzzle = freshPuzzles[randomIndex].id;
          console.log('✨ Selected fresh puzzle:', selectedPuzzle);
          return selectedPuzzle;
        }

        console.log('⚠️ No fresh puzzles, looking for skipped puzzles to retry...');

        // If no fresh puzzles, allow retrying skipped puzzles
        let skippedPuzzles = pathConfig.puzzles.filter(
          (p) => !progress.completedIds.includes(p.id) && progress.skippedIds.includes(p.id)
        );

        console.log('🔄 Skipped puzzles available for retry:', skippedPuzzles.map(p => p.id));

        // Exclude the current puzzle ID if provided
        if (excludeId) {
          skippedPuzzles = skippedPuzzles.filter((p) => p.id !== excludeId);
          console.log('🔄 Skipped puzzles after exclude:', skippedPuzzles.map(p => p.id));
        }

        if (skippedPuzzles.length > 0) {
          const randomIndex = Math.floor(Math.random() * skippedPuzzles.length);
          const selectedPuzzle = skippedPuzzles[randomIndex].id;
          console.log('✨ Selected skipped puzzle for retry:', selectedPuzzle);
          return selectedPuzzle;
        }

        console.log('❌ No puzzles remaining (all completed)');
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

              // NEW: Restore perfect run state
              pathProgress[pathIdNum].isPerfectRunActive = session.is_perfect_run_active ?? false;
              pathProgress[pathIdNum].perfectRunStartScore = session.perfect_run_start_score ?? 0;
              pathProgress[pathIdNum].perfectRunStreak = session.perfect_run_streak ?? 0;
              pathProgress[pathIdNum].hasSeenThresholdModal = session.has_seen_threshold_modal ?? false;

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

      // ====================
      // NEW: Threshold Decision
      // ====================
      recordThresholdDecision: (pathId, decision) => {
        // Store decision in pathStats if needed
        set((state) => ({
          pathStats: {
            ...state.pathStats,
            [pathId]: {
              ...state.pathStats[pathId],
              thresholdDecision: decision,
            } as PathStats,
          },
        }));
      },

      setHasSeenThresholdModal: async (pathId, seen) => {
        set((state) => ({
          pathProgress: {
            ...state.pathProgress,
            [pathId]: {
              ...state.pathProgress[pathId],
              hasSeenThresholdModal: seen,
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
            hasSeenThresholdModal: seen,
            puzzleAttempts: currentProgress.puzzleAttempts,
          });
        }
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
