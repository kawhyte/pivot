import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuestStore } from '@/store/useQuestStore';
import { getPathPuzzles, getPuzzleById, TARGET_SCORES } from '@/data/puzzles';
import type { PathId } from '@/lib/paths';
import type { Puzzle } from '@/types/puzzle';

interface UseQuestSimulationProps {
  pathId: PathId;
  currentPuzzleId: string | null;
  onSubmit: (answer: string | number) => Promise<void>;
  showThresholdModal: boolean;
  showPerfectRunFailure: boolean;
}

interface SimulationState {
  isPlaying: boolean;
  scenario: 'complete-91' | 'complete-perfect' | 'fail-perfect' | null;
}

export const useQuestSimulation = ({
  pathId,
  currentPuzzleId,
  onSubmit,
  showThresholdModal,
  showPerfectRunFailure,
}: UseQuestSimulationProps) => {
  const {
    pathProgress,
    getPathScore,
    startPerfectRun,
  } = useQuestStore();

  const [state, setState] = useState<SimulationState>({
    isPlaying: false,
    scenario: null,
  });

  const previousPuzzleIdRef = useRef<string | null>(null);

  // Helper: Get all unsolved puzzles (dynamic - checks current state)
  const getAllUnsolvedPuzzles = useCallback((): Puzzle[] => {
    const allPuzzles = getPathPuzzles(pathId)?.puzzles || [];
    const progress = pathProgress[pathId];

    return allPuzzles.filter(
      (p) => !progress.completedIds.includes(p.id) && !progress.skippedIds.includes(p.id)
    );
  }, [pathId, pathProgress]);

  // ============================================
  // CORE AUTO-PLAY LOGIC (EVENT-DRIVEN)
  // ============================================

  useEffect(() => {
    // Don't run if not playing or no puzzle
    if (!state.isPlaying || !currentPuzzleId) return;

    // Prevent re-submitting same puzzle
    if (previousPuzzleIdRef.current === currentPuzzleId) return;
    previousPuzzleIdRef.current = currentPuzzleId;

    // Check stopping conditions first
    const currentScore = getPathScore(pathId);
    const targetScore = TARGET_SCORES[pathId];
    const remaining = getAllUnsolvedPuzzles();

    // SCENARIO: Complete to 91%
    if (state.scenario === 'complete-91' && currentScore >= targetScore) {
      console.log('✅ Reached 91% threshold!');
      stop();
      return;
    }

    // SCENARIO: Complete Perfect
    if (state.scenario === 'complete-perfect' && remaining.length === 0) {
      console.log('✅ All puzzles completed!');
      stop();
      return;
    }

    // Get puzzle data (has correct answer!)
    const puzzle = getPuzzleById(pathId, currentPuzzleId);
    if (!puzzle) {
      console.warn('⚠️ Puzzle not found:', currentPuzzleId);
      stop();
      return;
    }

    // Extract correct answer directly from puzzle data
    const correctAnswer = puzzle.correctAnswer;

    // Submit answer (QuestPage handles validation, animation, navigation)
    console.log(`🤖 Auto-submitting answer for ${puzzle.id}:`, correctAnswer);
    onSubmit(correctAnswer);

  }, [currentPuzzleId, state.isPlaying, state.scenario, getPathScore, pathId, getAllUnsolvedPuzzles, onSubmit]);

  // ============================================
  // PAUSE ON MODALS
  // ============================================

  useEffect(() => {
    if (showThresholdModal || showPerfectRunFailure) {
      console.log('⏸️ Modal detected, pausing simulation');
      setState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [showThresholdModal, showPerfectRunFailure]);

  // ============================================
  // SCENARIO STARTERS
  // ============================================

  const completeTo91 = useCallback(() => {
    console.log('🎯 Starting: Complete to 91%');
    previousPuzzleIdRef.current = null; // Reset
    setState({ isPlaying: true, scenario: 'complete-91' });
  }, []);

  const completePerfect = useCallback(() => {
    console.log('⭐ Starting: Complete Perfect');
    previousPuzzleIdRef.current = null; // Reset
    setState({ isPlaying: true, scenario: 'complete-perfect' });
  }, []);

  const failPerfectRun = useCallback(() => {
    console.log('💔 Starting: Fail Perfect Run');
    startPerfectRun(pathId);
    // Submit wrong answer immediately
    setTimeout(() => onSubmit('INTENTIONALLY_WRONG_ANSWER_FOR_TESTING'), 100);
  }, [startPerfectRun, pathId, onSubmit]);

  const stop = useCallback(() => {
    console.log('⏹️ Stopping simulation');
    setState({ isPlaying: false, scenario: null });
    previousPuzzleIdRef.current = null;
  }, []);

  // ============================================
  // MANUAL CONTROLS
  // ============================================

  const submitCorrect = useCallback(() => {
    if (!currentPuzzleId) return;
    const puzzle = getPuzzleById(pathId, currentPuzzleId);
    if (!puzzle) return;
    console.log(`👆 Manual submit correct for ${puzzle.id}:`, puzzle.correctAnswer);
    onSubmit(puzzle.correctAnswer);
  }, [currentPuzzleId, pathId, onSubmit]);

  const submitWrong = useCallback(() => {
    console.log('👆 Manual submit wrong answer');
    onSubmit('INTENTIONALLY_WRONG_ANSWER_FOR_TESTING');
  }, [onSubmit]);

  return {
    // State
    isPlaying: state.isPlaying,
    currentScenario: state.scenario,

    // Controls
    stop,

    // Scenarios
    completeTo91,
    completePerfect,
    triggerThreshold: completeTo91, // Same as completeTo91
    failPerfectRun,

    // Manual controls
    submitCorrect,
    submitWrong,
  };
};
