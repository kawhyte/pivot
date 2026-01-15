/**
 * Debug Utilities for Testing Birthday Quest
 * Only accessible when isTester === true
 */

import type { PathId } from '@/lib/paths';
import { PATH_IDS } from '@/lib/paths';
import { calculateNextPathUnlockTime } from '@/lib/path-unlock';
import { savePathCompletion } from '@/lib/supabase-sync';
import { TARGET_SCORES, getTotalPuzzles } from '@/data/puzzles';

/**
 * Tester Theme Colors (Cyan)
 */
export const TESTER_THEME = {
  primary: '#06B6D4',      // cyan-500
  primaryDark: '#0891B2',  // cyan-600
  bg: '#ECFEFF',           // cyan-50
  border: '#67E8F9',       // cyan-300
  text: '#164E63',         // cyan-900
};

/**
 * Time Manipulation Utilities
 */
export const timeTravel = {
  /**
   * Fast-forward time by X days
   * Updates database unlock times to simulate time passing
   */
  async addDays(
    days: number,
    completedPaths: Array<{ pathId: PathId; completedAt: string; nextPathUnlockAt?: string }>,
    agentId: number
  ) {
    console.log(`⏩ Fast-forwarding ${days} days...`);

    // For each completed path, subtract days from unlock time
    for (const path of completedPaths) {
      if (path.nextPathUnlockAt) {
        const originalUnlockTime = new Date(path.nextPathUnlockAt);
        const newUnlockTime = new Date(originalUnlockTime);
        newUnlockTime.setDate(newUnlockTime.getDate() - days);

        // Update in database
        await savePathCompletion(agentId, path.pathId, {
          completedIds: [],
          skippedIds: [],
          finalScore: TARGET_SCORES[path.pathId],
          accuracy: 100,
          mistakes: 0,
          themedTitle: 'Test',
          nextPathUnlockAt: newUnlockTime.toISOString(),
        });
      }
    }

    console.log('✅ Time travel complete! Reload page to see changes.');
  },

  /**
   * Reset time manipulation
   */
  async reset(
    completedPaths: Array<{ pathId: PathId; completedAt: string }>,
    agentId: number
  ) {
    console.log('🔄 Resetting unlock times to original values...');

    for (const path of completedPaths) {
      const correctUnlockTime = calculateNextPathUnlockTime(new Date(path.completedAt));

      await savePathCompletion(agentId, path.pathId, {
        completedIds: [],
        skippedIds: [],
        finalScore: TARGET_SCORES[path.pathId],
        accuracy: 100,
        mistakes: 0,
        themedTitle: 'Test',
        nextPathUnlockAt: correctUnlockTime.toISOString(),
      });
    }

    console.log('✅ Time reset complete!');
  },
};

/**
 * Path Completion Scenarios
 */
export const pathSimulator = {
  /**
   * Auto-complete path with perfect score (100%)
   */
  async completePerfect(pathId: PathId, agentId: number) {
    console.log(`🎯 Auto-completing ${pathId} with perfect score...`);

    const totalPuzzles = getTotalPuzzles(pathId);
    const completedIds = Array.from({ length: totalPuzzles }, (_, i) => `${pathId}-${i + 1}`);
    const completedAt = new Date();
    const nextPathUnlockAt = calculateNextPathUnlockTime(completedAt);

    await savePathCompletion(agentId, pathId, {
      completedIds,
      skippedIds: [],
      finalScore: TARGET_SCORES[pathId],
      accuracy: 100,
      mistakes: 0,
      themedTitle: 'Perfect Run',
      timeTaken: 300, // 5 minutes
      totalQuestions: totalPuzzles,
      firstTryCount: totalPuzzles,
      firstTryRate: 100,
      skippedCount: 0,
      avgTimePerQuestion: 300 / totalPuzzles,
      perfectRunCompleted: true,
      thresholdDecision: 'n/a',
      nextPathUnlockAt: nextPathUnlockAt.toISOString(),
    });

    console.log('✅ Perfect completion saved!');
  },

  /**
   * Auto-complete path at threshold (93%)
   */
  async completeThreshold(pathId: PathId, agentId: number) {
    console.log(`📊 Auto-completing ${pathId} at 93% threshold...`);

    const totalPuzzles = getTotalPuzzles(pathId);
    const requiredCorrect = Math.ceil(totalPuzzles * 0.93);
    const completedIds = Array.from({ length: requiredCorrect }, (_, i) => `${pathId}-${i + 1}`);
    const completedAt = new Date();
    const nextPathUnlockAt = calculateNextPathUnlockTime(completedAt);

    await savePathCompletion(agentId, pathId, {
      completedIds,
      skippedIds: [],
      finalScore: TARGET_SCORES[pathId],
      accuracy: 93,
      mistakes: totalPuzzles - requiredCorrect,
      themedTitle: 'Threshold Master',
      timeTaken: 400,
      totalQuestions: totalPuzzles,
      firstTryCount: requiredCorrect,
      firstTryRate: 93,
      skippedCount: 0,
      avgTimePerQuestion: 400 / totalPuzzles,
      perfectRunCompleted: false,
      thresholdDecision: 'accept',
      nextPathUnlockAt: nextPathUnlockAt.toISOString(),
    });

    console.log('✅ Threshold completion saved!');
  },

  /**
   * Auto-complete path with skips
   */
  async completeWithSkips(pathId: PathId, agentId: number) {
    console.log(`⏭️ Auto-completing ${pathId} with skips...`);

    const totalPuzzles = getTotalPuzzles(pathId);
    const completedCount = Math.ceil(totalPuzzles * 0.7);
    const skippedCount = totalPuzzles - completedCount;

    const completedIds = Array.from({ length: completedCount }, (_, i) => `${pathId}-${i + 1}`);
    const skippedIds = Array.from({ length: skippedCount }, (_, i) => `${pathId}-${completedCount + i + 1}`);
    const completedAt = new Date();
    const nextPathUnlockAt = calculateNextPathUnlockTime(completedAt);

    await savePathCompletion(agentId, pathId, {
      completedIds,
      skippedIds,
      finalScore: TARGET_SCORES[pathId],
      accuracy: 85,
      mistakes: 5,
      themedTitle: 'Skip Master',
      timeTaken: 600,
      totalQuestions: totalPuzzles,
      firstTryCount: completedCount - 3,
      firstTryRate: 70,
      skippedCount,
      avgTimePerQuestion: 600 / totalPuzzles,
      perfectRunCompleted: false,
      thresholdDecision: 'skip',
      nextPathUnlockAt: nextPathUnlockAt.toISOString(),
    });

    console.log('✅ Skip completion saved!');
  },

  /**
   * Reset specific path progress
   */
  async reset(pathId: PathId, agentId: number) {
    console.log(`🔄 Resetting progress for path ${pathId}...`);

    await savePathCompletion(agentId, pathId, {
      completedIds: [],
      skippedIds: [],
      finalScore: 0,
      accuracy: 0,
      mistakes: 0,
      themedTitle: '',
      nextPathUnlockAt: undefined,
    });

    console.log('✅ Path reset complete!');
  },
};

/**
 * One-Click Scenario Runners
 */
export const scenarios = {
  /**
   * Test unlock flow: Complete Pop Culture, check Renaissance countdown
   */
  async testUnlockFlow(agentId: number) {
    console.log('🎬 Running unlock flow test...');

    // Complete Pop Culture with perfect score
    await pathSimulator.completePerfect(PATH_IDS.POP_CULTURE, agentId);

    console.log('✅ Scenario complete! Renaissance should show countdown.');
    console.log('💡 Tip: Reload page and check Renaissance card.');
  },

  /**
   * Test vault unlock: Complete all 3 paths
   */
  async testVaultUnlock(agentId: number) {
    console.log('🎬 Running vault unlock test...');

    // Complete all paths with perfect scores
    await pathSimulator.completePerfect(PATH_IDS.POP_CULTURE, agentId);
    await pathSimulator.completePerfect(PATH_IDS.RENAISSANCE, agentId);
    await pathSimulator.completePerfect(PATH_IDS.HEART, agentId);

    console.log('✅ Scenario complete! Vault should be unlocked.');
    console.log('💡 Tip: Reload page and check for "Open Vault" button.');
  },

  /**
   * Test threshold modal: Complete path at exactly 93%
   */
  async testThreshold(agentId: number) {
    console.log('🎬 Running threshold modal test...');

    await pathSimulator.completeThreshold(PATH_IDS.POP_CULTURE, agentId);

    console.log('✅ Scenario complete! Check threshold modal behavior.');
  },

  /**
   * Reset all progress (nuclear option)
   */
  async resetAll(agentId: number) {
    console.log('💣 RESETTING ALL PROGRESS...');

    await pathSimulator.reset(PATH_IDS.POP_CULTURE, agentId);
    await pathSimulator.reset(PATH_IDS.RENAISSANCE, agentId);
    await pathSimulator.reset(PATH_IDS.HEART, agentId);

    // Clear localStorage
    localStorage.removeItem('birthday-quest-seen-welcome');

    console.log('✅ All progress reset! Reload page to start fresh.');
  },
};

/**
 * State Inspection Helpers
 */
export const inspector = {
  /**
   * Log current quest state to console
   */
  logState(state: any) {
    console.group('🔍 Quest State Inspector');
    console.log('Keys Collected:', state.keysCollected);
    console.log('Unlocked Paths:', state.unlockedPaths);
    console.log('Vault Unlocked:', state.isVaultUnlocked);
    console.log('Completed Paths Data:', state.completedPathsData);
    console.log('Path Progress:', state.pathProgress);
    console.log('Is Tester:', state.isTester);
    console.groupEnd();
  },

  /**
   * Calculate hours until next unlock
   */
  getHoursUntilUnlock(unlockTime: string): number {
    const now = new Date();
    const unlock = new Date(unlockTime);
    const diff = unlock.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60)));
  },

  /**
   * Format unlock time for display
   */
  formatUnlockTime(unlockTime: string): string {
    const unlock = new Date(unlockTime);
    return unlock.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  },
};
