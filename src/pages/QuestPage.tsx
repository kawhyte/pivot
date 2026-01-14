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

  const handleSubmit = async (answer: string | number) => {
    if (!puzzle || !currentPuzzleId || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

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

      // Submit correct answer to store
      await submitAnswer(pathId, currentPuzzleId, true);

      // Check if key just unlocked (score >= targetScore)
      const wasAlreadyUnlocked = keysCollected.includes(pathId);
      const isNowUnlocked = getPathScore(pathId) >= targetScore;
      if (!wasAlreadyUnlocked && isNowUnlocked) {
        setShowKeyUnlockedToast(true);
      }

      // Check if all puzzles are now completed (Perfect Run scenario)
      const allCompleted = progress.completedIds.length + 1 === totalPuzzles;

      setTimeout(() => {
        if (allCompleted) {
          // Show completion screen - Perfect Run Bonus applies here
          const accuracy = calculateAccuracy(totalPuzzles, progress.mistakes);
          const themedTitle = getThemedTitle(pathId, accuracy);

          const stats = {
            completionTime: 0,
            accuracy,
            mistakes: progress.mistakes,
            themedTitle,
            completedAt: Date.now(),
          };

          setShowCompletion(true);
          if (!keysCollected.includes(pathId)) {
            addKey(pathId, stats);
          }
        } else {
          // Move to next unsolved puzzle - do NOT auto-complete
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
      // TWO-STRIKE MERCY: First wrong answer is a warning, second is a skip
      const mistakeWeight = result.status === 'close' ? 0.5 : 1.0;

      // Track mistake in store
      await submitAnswer(pathId, currentPuzzleId, false, mistakeWeight);
      recordMistake(); // Update live achievement stakes

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
        const secondStrikePun = getSecondStrikeMessage(pathId);
        setFeedback({ type: 'error', message: secondStrikePun });

        // Auto-skip this puzzle (remove from remaining)
        skipPuzzle(pathId, currentPuzzleId);

        // Wait 1.5 seconds for user to read the pun, then auto-navigate
        setTimeout(() => {
          const nextPuzzle = getNextUnsolvedPuzzle(pathId);
          if (nextPuzzle) {
            handleNavigate(nextPuzzle);
          } else {
            // No more unsolved puzzles - check if path is complete
            const allCompleted = progress.completedIds.length === totalPuzzles;
            if (allCompleted) {
              const accuracy = calculateAccuracy(totalPuzzles, progress.mistakes);
              const themedTitle = getThemedTitle(pathId, accuracy);
              const stats = {
                completionTime: 0,
                accuracy,
                mistakes: progress.mistakes,
                themedTitle,
                completedAt: Date.now(),
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
        }, 1500);
      }
    }

    setIsSubmitting(false);
  };

  const handleBackToVault = () => {
    navigate('/hub');
  };


  // Path completion screen
  if (showCompletion || isPathCompleted) {
    const stats = getPathStats(pathId);
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
                {currentScore} / {targetScore} PTS
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

      {/* Key Unlocked Toast */}
      <AnimatePresence>
        {showKeyUnlockedToast && (
          <KeyUnlockedToast
            pathId={pathId}
            onDismiss={() => setShowKeyUnlockedToast(false)}
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
