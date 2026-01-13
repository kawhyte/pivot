import { use, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Trophy, Sparkles, Clock, Flag } from 'lucide-react';
import { useQuestStore, PATH_METADATA, type PathId } from '@/store/useQuestStore';
import { getPuzzleById, getTotalPuzzles, getRandomCoupon, TARGET_SCORES } from '@/data/puzzles';
import { validateAnswer } from '@/lib/puzzle-validator';
import { PuzzleRenderer } from '@/components/puzzles/PuzzleRenderer';
import { QuestionNavigator } from '@/components/puzzles/QuestionNavigator';
import { formatTime, calculateAccuracy, getThemedTitle } from '@/lib/themed-titles';
import { getThemedAchievement } from '@/lib/achievements';
import { PerformanceSummary } from '@/components/quest/PerformanceSummary';
import { KeyUnlockedToast } from '@/components/quest/KeyUnlockedToast';
import { BonusCoupon } from '@/components/puzzles/BonusCoupon';
import { AchievementStakes } from '@/components/quest/AchievementStakes';
import type { ValidationResult } from '@/types/puzzle';

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
    isPathUnlocked,
    getNextUnsolvedPuzzle,
    startNewRun,
    recordMistake,
    resetRun,
    currentRun,
  } = useQuestStore();

  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showKeyUnlockedToast, setShowKeyUnlockedToast] = useState(false);

  // Timer & performance tracking
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0); // For live display
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalPuzzles = getTotalPuzzles(pathId);
  const puzzle = currentPuzzleId ? getPuzzleById(pathId, currentPuzzleId) : null;
  const pathMeta = PATH_METADATA[pathId];
  const isPathCompleted = keysCollected.includes(pathId);
  const progress = pathProgress[pathId];
  const currentScore = getPathScore(pathId);
  const targetScore = TARGET_SCORES[pathId];

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

  // Timer: Update current time every second
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setCurrentTime(elapsedTime + (Date.now() - startTime));
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [startTime, elapsedTime]);

  // Visibility: Pause timer when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause timer
        setElapsedTime((prev) => prev + (Date.now() - startTime));
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      } else {
        // Resume timer
        setStartTime(Date.now());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startTime]);

  // Fire confetti
  const fireConfetti = () => {
    const colors = [pathMeta.colors.primary, pathMeta.colors.secondary];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
    }, 200);

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
    }, 400);
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
          const finalTime = elapsedTime + (Date.now() - startTime);
          const accuracy = calculateAccuracy(totalPuzzles, progress.mistakes);
          const themedTitle = getThemedTitle(pathId, accuracy);

          const stats = {
            completionTime: finalTime,
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
    } else if (result.status === 'close') {
      // Track "close" as 0.5 mistakes
      await submitAnswer(pathId, currentPuzzleId, false, 0.5);
      recordMistake(); // Update live achievement stakes

      // Don't show feedback for "close" - handled by puzzle component
      if (result.showHint) {
        setTimeout(() => setShowHint(true), 500);
      }
    } else {
      // Status is "incorrect" - track as 1.0 mistake
      await submitAnswer(pathId, currentPuzzleId, false, 1.0);
      recordMistake(); // Update live achievement stakes

      setFeedback({ type: 'error', message: result.message });
      if (result.showHint) {
        setTimeout(() => setShowHint(true), 500);
      }
    }

    setIsSubmitting(false);
  };

  const handleBackToVault = () => {
    navigate('/hub');
  };

  const handleFinishAndClaim = () => {
    // Calculate final stats
    const finalTime = elapsedTime + (Date.now() - startTime);
    const accuracy = calculateAccuracy(totalPuzzles, progress.mistakes);
    const themedTitle = getThemedTitle(pathId, accuracy);

    const stats = {
      completionTime: finalTime,
      accuracy,
      mistakes: progress.mistakes,
      themedTitle,
      completedAt: Date.now(),
    };

    // Show completion screen and add key
    setShowCompletion(true);
    if (!keysCollected.includes(pathId)) {
      addKey(pathId, stats);
    }
  };

  // Determine if we can show the Finish & Claim Key button
  const canClaimKey = currentScore >= targetScore && !isPathCompleted;

  // Path completion screen
  if (showCompletion || isPathCompleted) {
    const stats = getPathStats(pathId);
    const isPerfect = isPerfectRun(pathId);
    const bonusCoupon = isPerfect ? getRandomCoupon(pathId) : null;

    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-festive-cream via-festive-peach/30 to-festive-cream">
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
                style={{ color: pathMeta.colors.primary }}
                strokeWidth={1.5}
              />
            </motion.div>

            <h1 className="mb-4 text-3xl font-bold text-zinc-900">
              Path Complete!
            </h1>
            <p className="mb-2 text-lg text-zinc-700">
              You've earned the <span className="font-semibold">{pathMeta.name}</span> key!
            </p>
            <p className="mb-8 text-sm text-zinc-600">
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
              className="w-full rounded-full bg-zinc-900 px-8 py-4 font-semibold text-white"
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-festive-cream via-festive-peach/20 to-festive-cream">
      {/* Header - Mission Dashboard */}
      <header className="border-b-3 border-starbucks-green/20 bg-soft-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left: Back Button + Achievement Stakes */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={handleBackToVault}
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                className="hand-drawn flex items-center gap-2 text-sm font-medium text-deep-brown bg-white px-4 py-2 border-3 border-starbucks-green/30 hover:border-starbucks-green/60 transition-colors shadow-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Vault
              </motion.button>

              {/* Achievement Stakes in Header */}
              <AchievementStakes
                pathId={pathId}
                currentMistakes={currentRun.mistakes}
                elapsedTime={currentTime}
              />
            </div>

            {/* Right: Timer + Points + Finish Button */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm font-medium text-deep-brown">
                <Clock className="h-4 w-4 text-starbucks-green" />
                <span>{formatTime(currentTime)}</span>
              </div>
              <div className="h-4 w-px bg-deep-brown/20" />
              {/* Points Meter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-deep-brown">
                  {currentScore} / {targetScore} pts
                </span>
                <div className="hand-drawn h-3 w-24 overflow-hidden bg-starbucks-green/10 relative border-2 border-starbucks-green/30">
                  <motion.div
                    className="h-full bg-starbucks-green"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min((currentScore / targetScore) * 100, 100)}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Finish & Claim Key Button */}
              {canClaimKey && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  onClick={handleFinishAndClaim}
                  className="hand-drawn ml-2 px-5 py-2.5 font-semibold text-white text-sm flex items-center gap-2 shadow-md border-3 bg-starbucks-green border-starbucks-green"
                  whileHover={{ scale: 1.08, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Flag className="h-4 w-4" />
                  </motion.div>
                  Finish & Claim Key
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Key Unlocked Toast */}
      <AnimatePresence>
        {showKeyUnlockedToast && (
          <KeyUnlockedToast
            pathId={pathId}
            onDismiss={() => setShowKeyUnlockedToast(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex flex-1 flex-col px-6 py-12">
        {/* Question Navigator Grid */}
        {currentPuzzleId && (
          <QuestionNavigator
            pathId={pathId}
            currentPuzzleId={currentPuzzleId}
            onNavigate={handleNavigate}
          />
        )}

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
              elapsedTime={currentTime}
              currentScore={currentScore}
              targetScore={targetScore}
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
                  className="w-full text-center text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                  Skip for Now →
                </button>
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
                  rounded-xl p-4 text-center font-medium
                  ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                      : 'bg-red-50 text-red-900 border border-red-200'
                  }
                `}
              >
                {feedback.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default QuestPage;
