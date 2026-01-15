import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { useQuestStore } from '@/store/useQuestStore';
import { PATH_METADATA, type PathId } from '@/lib/paths';
import { getPuzzleById, getTotalPuzzles, getRandomCoupon, TARGET_SCORES, getPathPuzzles } from '@/data/puzzles';
import { validateAnswer } from '@/lib/puzzle-validator';
import { PuzzleRenderer } from '@/components/puzzles/PuzzleRenderer';
import { QuestionNavigator } from '@/components/puzzles/QuestionNavigator';
import { SuccessOverlay } from '@/components/puzzles/SuccessOverlay';
import { calculateAccuracy, getThemedTitle } from '@/lib/themed-titles';
import { getThemedAchievement } from '@/lib/achievements';
import { PerformanceSummary } from '@/components/quest/PerformanceSummary';
import { KeyUnlockedToast } from '@/components/quest/KeyUnlockedToast';
import { BonusCoupon } from '@/components/puzzles/BonusCoupon';
import { AchievementStakes } from '@/components/quest/AchievementStakes';
import { ThresholdDecisionModal } from '@/components/quest/ThresholdDecisionModal';
import { PerfectRunBanner } from '@/components/quest/PerfectRunBanner';
import { PerfectRunFailureModal } from '@/components/quest/PerfectRunFailureModal';
import { DetailedStatsScreen } from '@/components/quest/DetailedStatsScreen';
import { QuestionSkippedToast } from '@/components/quest/QuestionSkippedToast';
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
    recordThresholdDecision,
    setHasSeenThresholdModal,
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

  const totalPuzzles = getTotalPuzzles(pathId);
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

  // Calculate completion percentage (for visual progress, not for counter)
  const completedPuzzles = progress.completedIds.length;
  const completionPercentage = Math.round((completedPuzzles / totalPuzzles) * 100);

  // Current position within remaining puzzles
  const currentRemainingIndex = remainingPuzzles.findIndex(
    (p) => p.id === currentPuzzleId
  );

  // GAUNTLET MODE: 93% threshold (TARGET_SCORES already represent 93% of max points)
  const canClaimKey = currentScore >= targetScore && !isPathCompleted;

  // Progress percentage for glow button
  const scoreProgress = Math.round((currentScore / targetScore) * 100);
  const showFinishButton = scoreProgress >= 93 && canClaimKey;
  // Glow at 95%+ (now that 93% is base requirement)
  const isCompletionistPending = scoreProgress >= 95 && scoreProgress < 100 && canClaimKey;

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

  // NEW: 91% Threshold Detection - Show modal when user reaches 91% (not in perfect run, key not collected, modal not seen)
  useEffect(() => {
    const score = getPathScore(pathId);
    const threshold = TARGET_SCORES[pathId]; // Now 91%

    // Show modal if: score >= 91% AND not in perfect run AND key not collected AND modal not seen
    if (
      score >= threshold &&
      !progress.isPerfectRunActive &&
      !keysCollected.includes(pathId) &&
      !progress.hasSeenThresholdModal
    ) {
      setShowThresholdModal(true);
      setHasSeenThresholdModal(pathId, true); // Prevent re-showing
    }
  }, [currentScore, pathId, progress.isPerfectRunActive, progress.hasSeenThresholdModal, keysCollected, getPathScore, setHasSeenThresholdModal]);

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

  const handleSkip = () => {
    if (!currentPuzzleId) return;
    skipPuzzle(pathId, currentPuzzleId);

    // Navigate to next unsolved
    const nextPuzzle = getNextUnsolvedPuzzle(pathId);
    if (nextPuzzle) {
      handleNavigate(nextPuzzle);
    }
  };

  // NEW: Handle 91% threshold decision
  const handleThresholdDecision = (decision: 'claim' | 'perfect-run') => {
    setShowThresholdModal(false);

    if (decision === 'claim') {
      // User chose to claim key and stop - navigate to detailed stats screen
      recordThresholdDecision(pathId, '91%');
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
      recordThresholdDecision(pathId, '100%');
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
          // Move to next unsolved puzzle
          const nextPuzzle = getNextUnsolvedPuzzle(pathId);
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
        skipPuzzle(pathId, currentPuzzleId);

        // Wait 2.5 seconds for user to read the toast, then auto-navigate
        setTimeout(() => {
          setShowSkippedToast(false);

          const nextPuzzle = getNextUnsolvedPuzzle(pathId);
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
  if (showCompletion || isPathCompleted) {
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
              className="mb-6 flex justify-center"
            >
              <Trophy
                className="h-24 w-24"
                style={{ color: isTester ? '#06b6d4' : pathMeta.colors.primary }}
                strokeWidth={1.5}
              />
            </motion.div>

            <h1 className={`mb-4 text-3xl font-bold ${isTester ? 'text-cyan-400' : 'text-zinc-900'}`}>
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
              className="mx-auto mb-8 w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${pathMeta.colors.primary}, ${pathMeta.colors.secondary})`,
              }}
            >
              <Sparkles className="h-16 w-16 text-white" strokeWidth={2} />
            </div>

            <motion.button
              onClick={handleBackToVault}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-full rounded-full px-8 py-4 font-semibold text-white ${
                isTester ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-zinc-900'
              }`}
            >
              Return to Vault
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return null;
  }

  return (
    <div className={`flex min-h-screen flex-col ${
      isTester
        ? 'bg-zinc-950'
        : 'bg-gradient-to-br from-festive-cream via-festive-peach/20 to-festive-cream'
    }`}>
      {/* Fixed Header - Slim Progress Bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-zinc-900 z-50">
        <div className="h-full flex items-center justify-between px-4 gap-4">
          {/* Back Button */}
          <motion.button
            onClick={handleBackToVault}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="duo-button flex items-center gap-2 text-sm bg-neutral-200 text-neutral-900 hover:bg-neutral-300 px-4 py-2 flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </motion.button>

          {/* Progress Bar */}
          <div className="flex-1 mx-4">
            <div className="duo-progress-bar">
              <motion.div
                className="duo-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((currentScore / targetScore) * 100, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <div className="duo-progress-streak">
                {/* Mobile: Percentage only */}
                <span className="sm:hidden">{scoreProgress}%</span>
                {/* Desktop: Percentage + Points */}
                <span className="hidden sm:inline">{scoreProgress}% • {currentScore} / {targetScore} PTS</span>
              </div>
            </div>
          </div>

          {/* Right Side Container - Score & Achievement Stakes */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <AchievementStakes
              pathId={pathId}
              completionPercentage={completionPercentage}
            />
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-14" />

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
      <SuccessOverlay show={showSuccessOverlay} message="AWESOME!" />

      {/* Main Content */}
      <main className="flex flex-1 flex-col px-6 pt-20 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={puzzle.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
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
                className="mx-auto mt-4 w-full max-w-lg"
              >
                <button
                  onClick={handleSkip}
                  className={`w-full text-center text-sm transition-colors ${
                    isTester
                      ? 'text-zinc-400 hover:text-cyan-400'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  Skip for Now →
                </button>
              </motion.div>
            )}

            {/* Finish Button - Show at 93% threshold */}
            {showFinishButton && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mx-auto mt-8 w-full max-w-lg"
              >
                <button
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
                  className={`duo-button w-full py-4 text-xl font-black text-white ${
                    isTester
                      ? 'bg-cyan-600 hover:bg-cyan-500'
                      : 'bg-duolingo-green hover:bg-duolingo-green-dark'
                  }`}
                >
                  Finish & Claim Key
                </button>

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

        {/* Feedback Message */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto mt-6 w-full max-w-lg"
            >
              <div
                className={`
                  duo-card p-4 text-center font-bold
                  ${
                    feedback.type === 'success'
                      ? 'bg-success-bg border-duolingo-green text-neutral-900'
                      : 'bg-red-50 border-error-red text-neutral-900'
                  }
                `}
              >
                {feedback.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Question Navigator - Dynamic Vanishing Navigation */}
      {currentPuzzleId && remainingPuzzles.length > 0 && (
        <QuestionNavigator
          pathId={pathId}
          currentPuzzleId={currentPuzzleId}
          remainingPuzzles={remainingPuzzles}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
};

export default QuestPage;
