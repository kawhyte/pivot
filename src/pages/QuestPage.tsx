import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { useQuestStore } from '@/store/useQuestStore';
import { PATH_METADATA, type PathId } from '@/lib/paths';
import { getPuzzleById, getTotalPuzzles, getTotalNonBonusPuzzles, getTotalBonusPuzzles, getRandomCoupon, TARGET_SCORES, getPathPuzzles } from '@/data/puzzles';
import { validateAnswer } from '@/lib/puzzle-validator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PuzzleRenderer } from '@/components/puzzles/PuzzleRenderer';
import { QuestionNavigator } from '@/components/puzzles/QuestionNavigator';
import { SuccessOverlay } from '@/components/puzzles/SuccessOverlay';
import { calculateAccuracy, getThemedTitle } from '@/lib/themed-titles';
import { getThemedAchievement } from '@/lib/achievements';
import { PerformanceSummary } from '@/components/quest/PerformanceSummary';
import { KeyUnlockedToast } from '@/components/quest/KeyUnlockedToast';
import { BonusCoupon } from '@/components/puzzles/BonusCoupon';
import { ThresholdDecisionModal } from '@/components/quest/ThresholdDecisionModal';
import { PerfectRunBanner } from '@/components/quest/PerfectRunBanner';
import { PerfectRunFailureModal } from '@/components/quest/PerfectRunFailureModal';
import { DetailedStatsScreen } from '@/components/quest/DetailedStatsScreen';
import { QuestionSkippedToast } from '@/components/quest/QuestionSkippedToast';
import { QuestSimulationToolbar } from '@/components/quest/QuestSimulationToolbar';
import { SuddenDeathTransition } from '@/components/quest/SuddenDeathTransition';
import { cn } from '@/lib/utils';
import type { ValidationResult } from '@/types/puzzle';

/**
 * Get themed pun message for first strike (warning before skip)
 */
const getFirstStrikeMessage = (pathId: PathId): string => {
  switch (pathId) {
    case 1: // Pop Culture
      return "Pivot! That's one strike. Don't make us go on a 'break' from this question! ☕";
    case 2: // Renaissance
      return "Turbulence! One more wrong move and we're re-routing your flight. ✈️";
    case 3: // Heart
      return "Memory foggy? One more guess before we save this for the scrapbook! ❤️";
    default:
      return "That's strike one! One more wrong and we're moving on...";
  }
};

/**
 * Get themed pun message for second strike (auto-skip)
 */
const getSecondStrikeMessage = (pathId: PathId): string => {
  switch (pathId) {
    case 1: // Pop Culture
      return "We're putting this on 'break'! Moving on... ☕";
    case 2: // Renaissance
      return "Flight re-routed! Next question incoming! ✈️";
    case 3: // Heart
      return "Saved to the scrapbook! Let's come back to this later! ❤️";
    default:
      return "Strike two! Moving on to the next question...";
  }
};

const QuestPage = () => {
  const navigate = useNavigate();
  const { pathId: pathIdString } = useParams<{ pathId: string }>();
  const pathId = parseInt(pathIdString!) as PathId;

  const {
    pathProgress,
    currentPuzzleId,
    setCurrentPuzzle,
    submitAnswer,
    skipPuzzle,
    addKey,
    keysCollected,
    getPathStats,
    getPathScore,
    isPerfectRun,
    getNextUnsolvedPuzzle,
    startNewRun,
    recordMistake,
    resetRun,
    currentRun,
    isTester, // GOD MODE / GHOST MODE
    // NEW: Perfect Run & Time Tracking
    startPerfectRun,
    endPerfectRun,
    startPathTimer,
    pausePathTimer,
    resumePathTimer,
    // NEW: Bonus Mode (Sudden Death)
    startBonusMode,
    // Streak-based messages
    getStreakMessage,
  } = useQuestStore();

  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showKeyUnlockedToast, setShowKeyUnlockedToast] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [shake, setShake] = useState(false);

  // NEW: Threshold & Perfect Run modals
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [showPerfectRunFailure, setShowPerfectRunFailure] = useState(false);

  // NEW: Question Skipped Toast
  const [showSkippedToast, setShowSkippedToast] = useState(false);

  // NEW: Per-puzzle time tracking
  const [puzzleStartTime, setPuzzleStartTime] = useState<number>(Date.now());

  // NEW: Sudden Death Transition
  const [isTransitioningToBonus, setIsTransitioningToBonus] = useState(false);

  const totalPuzzles = getTotalPuzzles(pathId);
  const totalNonBonus = getTotalNonBonusPuzzles(pathId);
  const totalBonus = getTotalBonusPuzzles(pathId);
  const puzzle = currentPuzzleId ? getPuzzleById(pathId, currentPuzzleId) : null;
  const pathMeta = PATH_METADATA[pathId];
  const isPathCompleted = keysCollected.includes(pathId);
  const progress = pathProgress[pathId];
  const currentScore = getPathScore(pathId);
  const targetScore = TARGET_SCORES[pathId];

  // Dynamic Vanishing Navigation: Filter out completed & skipped puzzles
  const allPuzzles = getPathPuzzles(pathId)?.puzzles || [];
  const remainingPuzzles = allPuzzles.filter(
    (p) => !progress.completedIds.includes(p.id) && !progress.skippedIds.includes(p.id)
  );

  // NEW: Count completed non-bonus and bonus puzzles separately
  const completedNonBonusIds = progress.completedIds.filter(id => {
    const puzzle = allPuzzles.find(p => p.id === id);
    return puzzle && !puzzle.isBonus;
  });
  const completedBonusIds = progress.completedIds.filter(id => {
    const puzzle = allPuzzles.find(p => p.id === id);
    return puzzle && puzzle.isBonus === true;
  });

  // Calculate completion percentage (for visual progress, not for counter)
  const completedPuzzles = progress.completedIds.length;
  const completionPercentage = Math.round((completedPuzzles / totalPuzzles) * 100);

  // Current position within remaining puzzles
  const currentRemainingIndex = remainingPuzzles.findIndex(
    (p) => p.id === currentPuzzleId
  );

  // NEW: Progress calculation based on mode
  // - If NOT in bonus mode: calculate based on non-bonus puzzles only (reaches 100% when base complete)
  // - If IN bonus mode: calculate based on bonus puzzles only
  const scoreProgress = progress.isBonusMode
    ? Math.round((completedBonusIds.length / totalBonus) * 100)
    : Math.round((completedNonBonusIds.length / totalNonBonus) * 100);

  // Legacy logic (no longer used with completion-first model)
  const canClaimKey = currentScore >= targetScore && !isPathCompleted;
  const showFinishButton = false; // Disabled: Auto-unlock at 100%
  const isCompletionistPending = false; // Disabled

  // Initialize: Set current puzzle to first unsolved
  useEffect(() => {
    if (!currentPuzzleId) {
      const nextPuzzle = getNextUnsolvedPuzzle(pathId);
      if (nextPuzzle) {
        setCurrentPuzzle(nextPuzzle);
      }
    }
  }, [pathId, currentPuzzleId, setCurrentPuzzle, getNextUnsolvedPuzzle]);

  // Start a new run when path loads
  useEffect(() => {
    startNewRun();
    return () => {
      resetRun();
    };
  }, [pathId, startNewRun, resetRun]);

  // Redirect if path is invalid or already completed
  useEffect(() => {
    if (isPathCompleted) {
      // Can stay on page to show completion screen
      return;
    }

    if (!puzzle && currentPuzzleId) {
      // If we have a puzzle ID but can't find the puzzle, redirect
      navigate('/hub');
    }
  }, [puzzle, currentPuzzleId, isPathCompleted, navigate]);

  // Reset attempts when puzzle changes
  useEffect(() => {
    setAttempts(0);
    setShake(false);
  }, [currentPuzzleId]);

  // NEW: 100% Base Completion Detection - Auto-trigger Sudden Death transition
  useEffect(() => {
    // Check if all non-bonus puzzles completed (100% base)
    const baseComplete = completedNonBonusIds.length === totalNonBonus;

    // Auto-trigger transition if:
    // - Base 100% complete
    // - Not already in bonus mode
    // - Not already transitioning
    // - Bonus puzzles exist
    if (
      baseComplete &&
      !progress.isBonusMode &&
      !isTransitioningToBonus &&
      totalBonus > 0
    ) {
      setIsTransitioningToBonus(true);
    }
  }, [completedNonBonusIds.length, totalNonBonus, progress.isBonusMode, isTransitioningToBonus, totalBonus]);

  // NEW: Reset timer when puzzle changes
  useEffect(() => {
    if (currentPuzzleId) {
      setPuzzleStartTime(Date.now());
    }
  }, [currentPuzzleId]);

  // NEW: Pause timer on tab switch, resume on return
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pausePathTimer(pathId);
      } else {
        resumePathTimer(pathId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathId, pausePathTimer, resumePathTimer]);


  // Fire confetti (reduced to 50 particles, single burst)
  const fireConfetti = () => {
    const colors = [pathMeta.colors.primary, pathMeta.colors.secondary];

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors,
    });
  };

  const handleNavigate = (puzzleId: string) => {
    setCurrentPuzzle(puzzleId);
    setFeedback(null);
    setValidationResult(null);
    setShowHint(false);
  };

  const handleSkip = async () => {
    if (!currentPuzzleId) return;
    const skippedPuzzleId = currentPuzzleId;

    // Await skip operation to ensure state is updated
    await skipPuzzle(pathId, skippedPuzzleId);

    // Navigate to next unsolved (exclude the puzzle we just skipped)
    const nextPuzzle = getNextUnsolvedPuzzle(pathId, skippedPuzzleId);

    if (nextPuzzle) {
      handleNavigate(nextPuzzle);
    }
  };

  // NOTE: Threshold decision handler (legacy - kept for perfect run modal compatibility)
  const handleThresholdDecision = (decision: 'claim' | 'perfect-run') => {
    setShowThresholdModal(false);

    if (decision === 'claim') {
      // User chose to claim key and stop - navigate to detailed stats screen
      const accuracy = calculateAccuracy(totalPuzzles, progress.mistakes);
      const themedTitle = getThemedTitle(pathId, accuracy);

      // Calculate detailed stats
      const firstTryCount = Object.values(progress.puzzleAttempts).filter((p) => p.isFirstTry).length;
      const firstTryRate = totalPuzzles > 0 ? Math.round((firstTryCount / totalPuzzles) * 100) : 0;
      const skippedCount = progress.skippedIds.length;
      const avgTimePerQuestion = progress.totalTimeSpent > 0 && totalPuzzles > 0
        ? Math.round(progress.totalTimeSpent / totalPuzzles)
        : 0;

      const stats = {
        completionTime: progress.totalTimeSpent,
        accuracy,
        mistakes: progress.mistakes,
        themedTitle,
        completedAt: Date.now(),
        totalQuestions: totalPuzzles,
        firstTryCount,
        firstTryRate,
        skippedCount,
        avgTimePerQuestion,
        perfectRunCompleted: false,
        thresholdDecision: '91%' as const,
      };

      setShowCompletion(true);
      if (!keysCollected.includes(pathId)) {
        addKey(pathId, stats);
      }
    } else {
      // User chose to go for 100% - start perfect run mode
      startPerfectRun(pathId);
      startPathTimer(pathId);
    }
  };

  const handleSubmit = async (answer: string | number) => {
    if (!puzzle || !currentPuzzleId || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

    // NEW: Calculate time spent on this puzzle
    const timeSpent = Date.now() - puzzleStartTime;

    // Simulate network delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = validateAnswer(puzzle, answer);
    setValidationResult(result);

    if (result.status === 'correct') {
      setFeedback({ type: 'success', message: result.message });

      // Show success overlay
      setShowSuccessOverlay(true);
      setTimeout(() => setShowSuccessOverlay(false), 1200);

      fireConfetti();

      // NEW: Submit correct answer with time tracking
      await submitAnswer(pathId, currentPuzzleId, true, 1.0, timeSpent);

      // NEW: Reset timer for next puzzle
      setPuzzleStartTime(Date.now());

      // Check if key just unlocked (score >= targetScore) - BUT NOT during perfect run
      if (!progress.isPerfectRunActive) {
        const wasAlreadyUnlocked = keysCollected.includes(pathId);
        const isNowUnlocked = getPathScore(pathId) >= targetScore;
        if (!wasAlreadyUnlocked && isNowUnlocked) {
          setShowKeyUnlockedToast(true);
        }
      }

      // Check if all puzzles are now completed
      const allCompleted = progress.completedIds.length + 1 === totalPuzzles;

      setTimeout(() => {
        if (allCompleted) {
          // NEW: Perfect Run completion - award key with detailed stats
          const accuracy = calculateAccuracy(totalPuzzles, progress.mistakes);
          const themedTitle = getThemedTitle(pathId, accuracy);

          // Calculate detailed stats
          const firstTryCount = Object.values(progress.puzzleAttempts).filter((p) => p.isFirstTry).length;
          const firstTryRate = totalPuzzles > 0 ? Math.round((firstTryCount / totalPuzzles) * 100) : 0;
          const skippedCount = progress.skippedIds.length;
          const avgTimePerQuestion = progress.totalTimeSpent > 0 && totalPuzzles > 0
            ? Math.round(progress.totalTimeSpent / totalPuzzles)
            : 0;

          const stats = {
            completionTime: progress.totalTimeSpent,
            accuracy,
            mistakes: progress.mistakes,
            themedTitle,
            completedAt: Date.now(),
            totalQuestions: totalPuzzles,
            firstTryCount,
            firstTryRate,
            skippedCount,
            avgTimePerQuestion,
            perfectRunCompleted: progress.isPerfectRunActive, // TRUE if in perfect run mode
            thresholdDecision: progress.isPerfectRunActive ? '100%' as const : '91%' as const,
          };

          setShowCompletion(true);
          if (!keysCollected.includes(pathId)) {
            addKey(pathId, stats);
          }
        } else {
          // Move to next unsolved puzzle (exclude current one to ensure fresh puzzle)
          const completedPuzzleId = currentPuzzleId;
          const nextPuzzle = getNextUnsolvedPuzzle(pathId, completedPuzzleId);

          if (nextPuzzle) {
            handleNavigate(nextPuzzle);
          }
          setFeedback(null);
          setValidationResult(null);
          setShowHint(false);
        }
      }, 1500);
    } else {
      // WRONG ANSWER

      // NEW: Bonus Mode (Sudden Death) failure check - ONE wrong answer ends attempt
      if (progress.isBonusMode) {
        // Submit the wrong answer first (this will call endBonusMode internally)
        await submitAnswer(pathId, currentPuzzleId, false, 1.0, timeSpent);
        setShowPerfectRunFailure(true);
        setIsSubmitting(false);
        return; // Exit early, modal will handle navigation
      }

      // NEW: Perfect Run failure check - ONE wrong answer ends attempt
      if (progress.isPerfectRunActive) {
        endPerfectRun(pathId, false);
        setShowPerfectRunFailure(true);
        setIsSubmitting(false);
        return; // Exit early, modal will handle navigation
      }

      // TWO-STRIKE MERCY: First wrong answer is a warning, second is a skip
      const mistakeWeight = result.status === 'close' ? 0.5 : 1.0;

      // NEW: Track mistake with time spent
      await submitAnswer(pathId, currentPuzzleId, false, mistakeWeight, timeSpent);
      recordMistake(); // Update live achievement stakes

      // NEW: Reset timer
      setPuzzleStartTime(Date.now());

      if (attempts === 0) {
        // FIRST STRIKE: Show warning pun and shake animation
        const firstStrikePun = getFirstStrikeMessage(pathId);
        setFeedback({ type: 'error', message: firstStrikePun });

        // Trigger shake animation
        setShake(true);
        setTimeout(() => setShake(false), 400);

        // Increment attempts
        setAttempts(1);
      } else {
        // SECOND STRIKE: Auto-skip and move to next puzzle
        // Show prominent skip toast instead of subtle feedback
        setShowSkippedToast(true);

        // Auto-skip this puzzle (remove from remaining)
        const autoSkippedPuzzleId = currentPuzzleId;
        await skipPuzzle(pathId, autoSkippedPuzzleId);

        // Wait 2.5 seconds for user to read the toast, then auto-navigate
        setTimeout(() => {
          setShowSkippedToast(false);

          const nextPuzzle = getNextUnsolvedPuzzle(pathId, autoSkippedPuzzleId);
          if (nextPuzzle) {
            handleNavigate(nextPuzzle);
          } else {
            // No more unsolved puzzles - check if path is complete
            const allCompleted = progress.completedIds.length === totalPuzzles;
            if (allCompleted) {
              const accuracy = calculateAccuracy(totalPuzzles, progress.mistakes);
              const themedTitle = getThemedTitle(pathId, accuracy);

              // Calculate detailed stats
              const firstTryCount = Object.values(progress.puzzleAttempts).filter((p) => p.isFirstTry).length;
              const firstTryRate = totalPuzzles > 0 ? Math.round((firstTryCount / totalPuzzles) * 100) : 0;
              const skippedCount = progress.skippedIds.length;
              const avgTimePerQuestion = progress.totalTimeSpent > 0 && totalPuzzles > 0
                ? Math.round(progress.totalTimeSpent / totalPuzzles)
                : 0;

              const stats = {
                completionTime: progress.totalTimeSpent,
                accuracy,
                mistakes: progress.mistakes,
                themedTitle,
                completedAt: Date.now(),
                totalQuestions: totalPuzzles,
                firstTryCount,
                firstTryRate,
                skippedCount,
                avgTimePerQuestion,
                perfectRunCompleted: false,
                thresholdDecision: '91%' as const,
              };
              setShowCompletion(true);
              if (!keysCollected.includes(pathId)) {
                addKey(pathId, stats);
              }
            }
          }
          setFeedback(null);
          setValidationResult(null);
          setShowHint(false);
        }, 2500);
      }
    }

    setIsSubmitting(false);
  };

  const handleBackToVault = () => {
    navigate('/hub');
  };


  // Path completion screen - NEW: Using DetailedStatsScreen
  // GUARD: Don't show completion screen if in bonus mode or transitioning to bonus
  if ((showCompletion || isPathCompleted) && !progress.isBonusMode && !isTransitioningToBonus) {
    const stats = getPathStats(pathId);

    if (stats) {
      return (
        <DetailedStatsScreen
          pathId={pathId}
          stats={stats}
          onReturnToHub={handleBackToVault}
          showPerfectRunBadge={stats.perfectRunCompleted || false}
          isTester={isTester}
        />
      );
    }

    // Fallback to old completion screen if stats not available
    const isPerfect = isPerfectRun(pathId);
    const bonusCoupon = isPerfect ? getRandomCoupon(pathId) : null;

    return (
      <div className={`flex min-h-screen flex-col ${
        isTester
          ? 'bg-zinc-950'
          : 'bg-gradient-to-br from-festive-cream via-festive-peach/30 to-festive-cream'
      }`}>
        <div className="flex flex-1 items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              className="mb-6 flex justify-center rotate-1"
            >
              <Trophy
                className="h-24 w-24"
                style={{ color: isTester ? '#06b6d4' : pathMeta.colors.primary }}
                strokeWidth={1.5}
              />
            </motion.div>

            <h1 className={`mb-4 text-3xl font-bold font-doodle ${isTester ? 'text-cyan-400' : 'text-zinc-900'}`}>
              Path Complete!
            </h1>
            <p className={`mb-2 text-lg ${isTester ? 'text-zinc-300' : 'text-zinc-700'}`}>
              You've earned the <span className="font-semibold">{pathMeta.name}</span> key!
            </p>
            <p className={`mb-8 text-sm ${isTester ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {pathMeta.subtitle}
            </p>

            {/* Performance Summary with Achievement */}
            {stats && (
              <PerformanceSummary
                achievement={getThemedAchievement(pathId, stats.accuracy, stats.completionTime)}
                accuracy={stats.accuracy}
                completionTime={stats.completionTime}
              />
            )}

            {/* Perfect Run Bonus Coupon */}
            {isPerfect && bonusCoupon && (
              <BonusCoupon coupon={bonusCoupon} pathId={pathId} />
            )}

            <div
              className="mx-auto mb-8 w-32 h-32 rounded-full flex items-center justify-center -rotate-1"
              style={{
                background: `linear-gradient(135deg, ${pathMeta.colors.primary}, ${pathMeta.colors.secondary})`,
              }}
            >
              <Sparkles className="h-16 w-16 text-white" strokeWidth={2} />
            </div>

            <Button
              onClick={handleBackToVault}
              size="lg"
              className={cn(
                "w-full rounded-full px-8 py-4 font-semibold text-white",
                isTester ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-zinc-900 hover:bg-zinc-800'
              )}
            >
              Return to Vault
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return null;
  }

  return (
    <>
      {/* Sudden Death Transition Overlay */}
      <SuddenDeathTransition
        show={isTransitioningToBonus}
        onComplete={async () => {
          setIsTransitioningToBonus(false);
          await startBonusMode(pathId);
          // Force Load: Explicitly find first bonus puzzle to avoid state sync issues
          const pathConfig = getPathPuzzles(pathId);
          const firstBonus = pathConfig?.puzzles.find(p => p.isBonus === true);
          if (firstBonus) {
            handleNavigate(firstBonus.id);
          }
        }}
      />

      {/* Main Quest Page with Hardcore Theme Filter */}
      <motion.div
        animate={progress.isBonusMode ? { filter: 'grayscale(20%) contrast(120%)' } : { filter: 'grayscale(0%) contrast(100%)' }}
        transition={{ duration: 0.5 }}
        className={`flex min-h-screen flex-col ${
          progress.isBonusMode
            ? 'bg-zinc-950' // Hardcore theme for bonus mode
            : isTester
            ? 'bg-zinc-950 tester-mode-quest'
            : 'bg-gradient-to-br from-festive-cream via-festive-peach/20 to-festive-cream'
        }`}
      >
      <header className={cn(
  "fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md h-16 transition-colors duration-300",
  progress.isBonusMode
    ? "bg-zinc-950/90 border-red-900 border-b-4 border-red-600/50" // Hardcore theme for bonus mode with danger border
    : isTester
    ? "bg-zinc-950/90 border-zinc-800"
    : "bg-white/90 border-neutral-100"
)}>
  <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-4 sm:px-6 gap-4">
    
    {/* Left: Mission Exit & Identity */}
    <div className="flex items-center gap-3">
      <Button
        onClick={handleBackToVault}
        variant="ghost"
        size="sm"
        className={cn(
          "group h-10 gap-2 rounded-2xl px-3 font-bold transition-all active:scale-95",
          isTester 
            ? "text-zinc-400 hover:bg-zinc-800 hover:text-cyan-400" 
            : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        )}
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" strokeWidth={2.5} />
        <span className="hidden md:inline text-base">Exit Mission</span>
      </Button>
      
      <div className={cn("h-6 w-px hidden sm:block", isTester ? "bg-zinc-800" : "bg-neutral-200")} />
      
      <div className="hidden sm:flex flex-col leading-none">
        <span className={cn(
          "text-[16px] font-black uppercase tracking-[0.3em]",
          isTester ? "text-zinc-600" : "text-neutral-400"
        )}>
          Path
        </span>
        <span className={cn(
          "text-lg font-black uppercase tracking-wide font-doodle",
          isTester ? "text-zinc-300" : "text-neutral-800"
        )}>
          {pathMeta.name}
        </span>
      </div>
    </div>

    {/* Center: Tactical Progress */}
    <div className="flex flex-1 flex-col items-center max-w-[180px] sm:max-w-xs">
      <div className="mb-1.5 flex w-full items-end justify-between px-1">
        <span className={cn(
          "text-[16px] font-black uppercase tracking-widest marker-highlight",
          isTester ? "text-cyan-400" : "text-duolingo-green"
        )}>
          {scoreProgress}%
        </span>
        <span className={cn(
          "hidden xs:inline text-[16px] font-bold marker-highlight px-1.5 py-0.5 rounded",
          isTester ? "text-zinc-500" : "text-neutral-400"
        )}>
          {currentScore} / {targetScore} PTS
        </span>
      </div>
      
      {/* Refined Progress Bar */}
      <Progress
        value={Math.min(scoreProgress, 100)}
        className={cn(
          "h-3.5 rounded-full p-0.5 border transition-all",
          isTester ? "bg-zinc-900 border-zinc-800" : "bg-neutral-100 border-neutral-200/50 shadow-inner"
        )}
        indicatorClassName={cn(
          "h-full rounded-full transition-all duration-700",
          isTester ? "bg-cyan-500" : "bg-duolingo-green"
        )}
        indicatorStyle={{
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: scoreProgress >= 93
            ? (isTester ? '0 0 12px rgba(6,182,212,0.4)' : '0 0 12px rgba(88,204,2,0.4)')
            : 'none'
        }}
      />
    </div>
 
    {/* Right: Achievement Stakes */}
    <div className="flex items-center min-w-fit">
      <img src='/images/smile-yellow.svg' alt="Achievement" className="h-8 w-8" />
    </div>
    
  </div>
</header>

      {/* Spacer for fixed header */}
      <div className="h-14" />

      {/* Gap between banner and content - increased for bonus mode */}
      <div className={progress.isBonusMode ? 'mb-12' : 'mb-0'} />

      {/* HARDCORE BANNER (Sudden Death Mode) */}
      {progress.isBonusMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-950 via-red-600 to-red-950 shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse"
        >
          <div className="mx-auto max-w-3xl px-6 py-3 text-center">
            <p className="text-white font-black text-lg uppercase tracking-wider">
              ⚡ SUDDEN DEATH MODE ⚡
            </p>
            <p className="text-red-100 text-sm font-bold mt-1">
              One mistake ends it all. {completedBonusIds.length}/{totalBonus} bonus puzzles completed.
            </p>
          </div>
        </motion.div>
      )}

      {/* Perfect Run Banner (shows when in perfect run mode) */}
      {progress.isPerfectRunActive && (
        <PerfectRunBanner
          streak={progress.perfectRunStreak}
          remainingPuzzles={remainingPuzzles.length}
          pathId={pathId}
          isTester={isTester}
        />
      )}

      {/* Threshold Decision Modal (91% choice) */}
      <AnimatePresence>
        {showThresholdModal && (
          <ThresholdDecisionModal
            pathId={pathId}
            currentScore={currentScore}
            targetScore={targetScore}
            remainingPuzzles={remainingPuzzles.length}
            onDecision={handleThresholdDecision}
            isTester={isTester}
          />
        )}
      </AnimatePresence>

      {/* Perfect Run Failure Modal */}
      <AnimatePresence>
        {showPerfectRunFailure && (
          <PerfectRunFailureModal
            pathId={pathId}
            streak={progress.perfectRunStreak}
            remainingPuzzles={remainingPuzzles.length}
            onClose={() => {
              setShowPerfectRunFailure(false);
              navigate('/hub');
            }}
            isTester={isTester}
          />
        )}
      </AnimatePresence>

      {/* Key Unlocked Toast */}
      <AnimatePresence>
        {showKeyUnlockedToast && (
          <KeyUnlockedToast
            pathId={pathId}
            onDismiss={() => setShowKeyUnlockedToast(false)}
          />
        )}
      </AnimatePresence>

      {/* Question Skipped Toast */}
      <AnimatePresence>
        {showSkippedToast && (
          <QuestionSkippedToast
            pathId={pathId}
            onDismiss={() => setShowSkippedToast(false)}
            isTester={isTester}
          />
        )}
      </AnimatePresence>

      {/* Success Overlay */}
      <SuccessOverlay show={showSuccessOverlay} message={getStreakMessage()} />

      {/* Main Content - Hidden when modals are showing to prevent ghost questions */}
      {!showThresholdModal && !showCompletion && !isPathCompleted && (
        <main className="flex flex-1 flex-col px-6 pt-20 pb-12">
          <div className="max-w-xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={puzzle.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <PuzzleRenderer
                  puzzle={puzzle}
                  onSubmit={handleSubmit}
                  showHint={showHint}
                  isSubmitting={isSubmitting}
                  validationResult={validationResult}
                  pathId={pathId}
                  currentMistakes={currentRun.mistakes}
                  currentScore={currentScore}
                  targetScore={targetScore}
                  shake={shake}
                  isTester={isTester}
                />

                {/* Skip Button */}
                {!isSubmitting && currentPuzzleId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      onClick={handleSkip}
                      variant="ghost"
                      className={cn(
                        "w-full text-center text-base transition-colors",
                        isTester
                          ? 'text-zinc-400 hover:text-cyan-400 hover:bg-transparent'
                          : 'text-zinc-500 hover:text-zinc-700 hover:bg-transparent'
                      )}
                    >
                      Skip Question for Now →
                    </Button>
                  </motion.div>
                )}

                {/* Finish Button - Show at 93% threshold */}
                {showFinishButton && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      onClick={() => {
                        const accuracy = Math.round(((progress.completedIds.length / totalPuzzles) * 100));
                        const stats = {
                          completionTime: 0,
                          accuracy,
                          mistakes: progress.mistakes,
                          themedTitle: getThemedTitle(pathId, accuracy),
                          completedAt: Date.now(),
                        };

                        setShowCompletion(true);
                        if (!keysCollected.includes(pathId)) {
                          addKey(pathId, stats);
                        }
                      }}
                      variant="doodle"
                      size="lg"
                      className={cn(
                        "w-full",
                        isTester && 'bg-cyan-600 hover:bg-cyan-500'
                      )}
                    >
                      Finish & Claim Key
                    </Button>

                    {/* Hint Text - Only at 95%+ */}
                    {isCompletionistPending && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-center text-sm text-neutral-700 font-semibold"
                      >
                        Go for 100%?
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Feedback Message */}
          <div className="max-w-xl mx-auto w-full mt-6">
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div
                    className={cn(
                      "doodle-sticker p-4 text-center font-bold",
                      feedback.type === 'success'
                        ? 'bg-success-bg'
                        : 'bg-red-50'
                    )}
                  >
                    {feedback.message}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      )}

      {/* Question Navigator - Fixed Mission Log */}
      {/* {currentPuzzleId && allPuzzles.length > 0 && (
        <QuestionNavigator
          pathId={pathId}
          currentPuzzleId={currentPuzzleId}
          allPuzzles={allPuzzles}
          completedIds={progress.completedIds}
          onNavigate={handleNavigate}
        />
      )} */}

      {/* Quest Simulation Toolbar (Tester Mode Only) */}
      {isTester && currentPuzzleId && (
        <QuestSimulationToolbar
          pathId={pathId}
          currentPuzzleId={currentPuzzleId}
          onSubmit={handleSubmit}
          currentScore={currentScore}
          targetScore={targetScore}
          remainingPuzzles={remainingPuzzles.length}
          attempts={attempts}
          showThresholdModal={showThresholdModal}
          showPerfectRunFailure={showPerfectRunFailure}
        />
      )}
      </motion.div>
    </>
  );
};

export default QuestPage;
