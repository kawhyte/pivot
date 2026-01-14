import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { useQuestStore, PATH_METADATA, type PathId } from '@/store/useQuestStore';
import { getPuzzleById, getTotalPuzzles, getRandomCoupon, TARGET_SCORES, getPathPuzzles } from '@/data/puzzles';
import { validateAnswer } from '@/lib/puzzle-validator';
import { PuzzleRenderer } from '@/components/puzzles/PuzzleRenderer';
import { QuestionNavigator } from '@/components/puzzles/QuestionNavigator';
import { calculateAccuracy, getThemedTitle } from '@/lib/themed-titles';
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

  const totalPuzzles = getTotalPuzzles(pathId);
  const puzzle = currentPuzzleId ? getPuzzleById(pathId, currentPuzzleId) : null;
  const pathMeta = PATH_METADATA[pathId];
  const isPathCompleted = keysCollected.includes(pathId);
  const progress = pathProgress[pathId];
  const currentScore = getPathScore(pathId);
  const targetScore = TARGET_SCORES[pathId];

  // Dynamic Vanishing Navigation: Filter out completed puzzles
  const allPuzzles = getPathPuzzles(pathId)?.puzzles || [];
  const remainingPuzzles = allPuzzles.filter(
    (p) => !progress.completedIds.includes(p.id)
  );

  // Calculate completion percentage (for visual progress, not for counter)
  const completedPuzzles = progress.completedIds.length;
  const completionPercentage = Math.round((completedPuzzles / totalPuzzles) * 100);

  // Current position within remaining puzzles
  const currentRemainingIndex = remainingPuzzles.findIndex(
    (p) => p.id === currentPuzzleId
  );

  // GAUNTLET MODE: 93% threshold to claim key
  const claimKeyThreshold = Math.ceil(targetScore * 0.93);
  const canClaimKey = currentScore >= claimKeyThreshold && !isPathCompleted;

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
      {/* Fixed Header - Slim Progress Bar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-zinc-900 z-50">
        <div className="h-full flex items-center justify-between px-4 gap-4">
          {/* Back Button */}
          <motion.button
            onClick={handleBackToVault}
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            className="hand-drawn flex items-center gap-2 text-xs font-medium text-white bg-zinc-800 px-3 py-1.5 border-2 border-zinc-700 hover:border-zinc-600 transition-colors shadow-sm flex-shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back</span>
          </motion.button>

          {/* Dynamic Progress Background */}
          <div className="flex-1 relative h-full bg-zinc-800 overflow-hidden mx-4">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 via-orange-400 to-red-500 origin-left"
              initial={{ scaleX: 0 }}
              animate={{
                scaleX: Math.min(currentScore / targetScore, 1),
              }}
              transition={{ duration: 0.5 }}
            />
            {/* Content inside progress bar */}
            <div className="relative h-full flex items-center justify-center">
              <div className="text-xs font-mono text-zinc-200">
                {currentScore} / {targetScore} pts
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

            {/* Glow Button - Show at 80%, Glow at 90% */}
            {showFinishButton && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mx-auto mt-8 w-full max-w-lg"
              >
                <div className="relative">
                  {/* Gold Glow Effect when >= 90% */}
                  {isCompletionistPending && (
                    <motion.div
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-300 to-amber-300 blur-xl"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Button */}
                  <motion.button
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative w-full px-6 py-3 rounded-lg font-semibold text-white text-center
                      transition-all duration-300
                      ${
                        isCompletionistPending
                          ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 shadow-[0_0_20px_rgba(255,215,0,0.5)] animate-pulse'
                          : 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-md'
                      }
                    `}
                  >
                    Finish & Claim Key
                  </motion.button>

                  {/* Hint Text - Only at 90%+ */}
                  {isCompletionistPending && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-center text-xs text-amber-600 font-medium"
                    >
                      Go for 100%? 🏆
                    </motion.p>
                  )}
                </div>
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
