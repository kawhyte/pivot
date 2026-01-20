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
import { Progress } from '@/components/ui/progress';
import { PuzzleRenderer } from '@/components/puzzles/PuzzleRenderer';
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
    case 1: 
      return "Pivot! That's one strike. Don't make us go on a 'break' from this question! ☕";
    case 2: 
      return "Turbulence! One more wrong move and we're re-routing your flight. ✈️";
    case 3: 
      return "Memory foggy? One more guess before we save this for the scrapbook! ❤️";
    default:
      return "That's strike one! One more wrong and we're moving on...";
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
    isTester,
    startPerfectRun,
    endPerfectRun,
    startPathTimer,
    pausePathTimer,
    resumePathTimer,
    startBonusMode,
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
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [showPerfectRunFailure, setShowPerfectRunFailure] = useState(false);
  const [showSkippedToast, setShowSkippedToast] = useState(false);
  const [puzzleStartTime, setPuzzleStartTime] = useState<number>(Date.now());
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

  const allPuzzles = getPathPuzzles(pathId)?.puzzles || [];
  const remainingPuzzles = allPuzzles.filter(
    (p) => !progress.completedIds.includes(p.id) && !progress.skippedIds.includes(p.id)
  );

  const completedNonBonusIds = progress.completedIds.filter(id => {
    const puzzle = allPuzzles.find(p => p.id === id);
    return puzzle && !puzzle.isBonus;
  });
  
  const completedBonusIds = progress.completedIds.filter(id => {
    const puzzle = allPuzzles.find(p => p.id === id);
    return puzzle && puzzle.isBonus === true;
  });

  const scoreProgress = progress.isBonusMode
    ? Math.round((completedBonusIds.length / totalBonus) * 100)
    : Math.round((completedNonBonusIds.length / totalNonBonus) * 100);

  useEffect(() => {
    if (!currentPuzzleId) {
      const nextPuzzle = getNextUnsolvedPuzzle(pathId);
      if (nextPuzzle) {
        setCurrentPuzzle(nextPuzzle);
      }
    }
  }, [pathId, currentPuzzleId, setCurrentPuzzle, getNextUnsolvedPuzzle]);

  useEffect(() => {
    startNewRun();
    return () => resetRun();
  }, [pathId, startNewRun, resetRun]);

  useEffect(() => {
    if (isPathCompleted && !progress.isBonusMode) return;
    if (!puzzle && currentPuzzleId) navigate('/hub');
  }, [puzzle, currentPuzzleId, isPathCompleted, progress.isBonusMode, navigate]);

  useEffect(() => {
    setAttempts(0);
    setShake(false);
  }, [currentPuzzleId]);

  useEffect(() => {
    const baseComplete = completedNonBonusIds.length === totalNonBonus;
    if (baseComplete && !progress.isBonusMode && !isTransitioningToBonus && totalBonus > 0) {
      setIsTransitioningToBonus(true);
    }
  }, [completedNonBonusIds.length, totalNonBonus, progress.isBonusMode, isTransitioningToBonus, totalBonus]);

  useEffect(() => {
    if (currentPuzzleId) setPuzzleStartTime(Date.now());
  }, [currentPuzzleId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      document.hidden ? pausePathTimer(pathId) : resumePathTimer(pathId);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pathId, pausePathTimer, resumePathTimer]);

  const fireConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: [pathMeta.colors.primary, pathMeta.colors.secondary],
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
    await skipPuzzle(pathId, currentPuzzleId);
    const nextPuzzle = getNextUnsolvedPuzzle(pathId, currentPuzzleId);
    if (nextPuzzle) handleNavigate(nextPuzzle);
  };

  const handleThresholdDecision = (decision: 'claim' | 'perfect-run') => {
    setShowThresholdModal(false);
    if (decision === 'claim') {
      const accuracy = calculateAccuracy(totalPuzzles, progress.mistakes);
      const stats = {
        completionTime: progress.totalTimeSpent,
        accuracy,
        mistakes: progress.mistakes,
        themedTitle: getThemedTitle(pathId, accuracy),
        completedAt: Date.now(),
        totalQuestions: totalPuzzles,
        firstTryCount: Object.values(progress.puzzleAttempts).filter((p) => p.isFirstTry).length,
        firstTryRate: totalPuzzles > 0 ? Math.round((Object.values(progress.puzzleAttempts).filter((p) => p.isFirstTry).length / totalPuzzles) * 100) : 0,
        skippedCount: progress.skippedIds.length,
        avgTimePerQuestion: progress.totalTimeSpent > 0 && totalPuzzles > 0 ? Math.round(progress.totalTimeSpent / totalPuzzles) : 0,
        perfectRunCompleted: false,
        thresholdDecision: '91%' as const,
      };
      setShowCompletion(true);
      if (!keysCollected.includes(pathId)) addKey(pathId, stats);
    } else {
      startPerfectRun(pathId);
      startPathTimer(pathId);
    }
  };

  const handleSubmit = async (answer: string | number) => {
    if (!puzzle || !currentPuzzleId || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);
    const timeSpent = Date.now() - puzzleStartTime;
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = validateAnswer(puzzle, answer);
    setValidationResult(result);

    if (result.status === 'correct') {
      setFeedback({ type: 'success', message: result.message });
      setShowSuccessOverlay(true);
      setTimeout(() => setShowSuccessOverlay(false), 1200);
      fireConfetti();

      await submitAnswer(pathId, currentPuzzleId, true, 1.0, timeSpent);
      setPuzzleStartTime(Date.now());

      if (!progress.isPerfectRunActive) {
        if (!keysCollected.includes(pathId) && getPathScore(pathId) >= targetScore) {
          setShowKeyUnlockedToast(true);
        }
      }

      // FIX: Store is already updated, check for true completion
      const allCompleted = progress.completedIds.length === totalPuzzles;

      setTimeout(() => {
        if (allCompleted) {
          const accuracy = calculateAccuracy(totalPuzzles, progress.mistakes);
          const stats = {
            completionTime: progress.totalTimeSpent,
            accuracy,
            mistakes: progress.mistakes,
            themedTitle: getThemedTitle(pathId, accuracy),
            completedAt: Date.now(),
            totalQuestions: totalPuzzles,
            firstTryCount: Object.values(progress.puzzleAttempts).filter((p) => p.isFirstTry).length,
            firstTryRate: totalPuzzles > 0 ? Math.round((Object.values(progress.puzzleAttempts).filter((p) => p.isFirstTry).length / totalPuzzles) * 100) : 0,
            skippedCount: progress.skippedIds.length,
            avgTimePerQuestion: progress.totalTimeSpent > 0 && totalPuzzles > 0 ? Math.round(progress.totalTimeSpent / totalPuzzles) : 0,
            perfectRunCompleted: progress.isPerfectRunActive,
            thresholdDecision: progress.isPerfectRunActive ? '100%' as const : '91%' as const,
          };
          setShowCompletion(true);
          if (!keysCollected.includes(pathId)) addKey(pathId, stats);
        } else {
          const nextPuzzle = getNextUnsolvedPuzzle(pathId, currentPuzzleId);
          if (nextPuzzle) handleNavigate(nextPuzzle);
        }
      }, 1500);
    } else {
      if (progress.isBonusMode) {
        await submitAnswer(pathId, currentPuzzleId, false, 1.0, timeSpent);
        setShowPerfectRunFailure(true);
        setIsSubmitting(false);
        return;
      }

      if (progress.isPerfectRunActive) {
        endPerfectRun(pathId, false);
        setShowPerfectRunFailure(true);
        setIsSubmitting(false);
        return;
      }

      const mistakeWeight = result.status === 'close' ? 0.5 : 1.0;
      await submitAnswer(pathId, currentPuzzleId, false, mistakeWeight, timeSpent);
      recordMistake();
      setPuzzleStartTime(Date.now());

      if (attempts === 0) {
        setFeedback({ type: 'error', message: getFirstStrikeMessage(pathId) });
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setAttempts(1);
      } else {
        setShowSkippedToast(true);
        await skipPuzzle(pathId, currentPuzzleId);
        setTimeout(() => {
          setShowSkippedToast(false);
          const nextPuzzle = getNextUnsolvedPuzzle(pathId, currentPuzzleId);
          if (nextPuzzle) handleNavigate(nextPuzzle);
          else if (progress.completedIds.length === totalPuzzles) {
            setShowCompletion(true);
          }
        }, 2500);
      }
    }
    setIsSubmitting(false);
  };

  const handleBackToVault = () => navigate('/hub');

  if ((showCompletion || isPathCompleted) && !progress.isBonusMode && !isTransitioningToBonus) {
    const stats = getPathStats(pathId);
    if (stats) return (
      <DetailedStatsScreen 
        pathId={pathId} 
        stats={stats} 
        onReturnToHub={handleBackToVault} 
        showPerfectRunBadge={stats.perfectRunCompleted || false} 
        isTester={isTester} 
      />
    );
  }

  if (!puzzle) return null;

  return (
    <>
      <SuddenDeathTransition
        show={isTransitioningToBonus}
        onComplete={async () => {
          setIsTransitioningToBonus(false);
          await startBonusMode(pathId);
          const firstBonus = getPathPuzzles(pathId)?.puzzles.find(p => p.isBonus === true);
          if (firstBonus) setCurrentPuzzle(firstBonus.id);
        }}
      />

      <motion.div
        animate={progress.isBonusMode ? { filter: 'grayscale(20%) contrast(120%)' } : { filter: 'grayscale(0%) contrast(100%)' }}
        className={`flex min-h-screen flex-col ${progress.isBonusMode ? 'bg-zinc-950' : isTester ? 'bg-zinc-950 tester-mode-quest' : 'bg-gradient-to-br from-festive-cream via-festive-peach/20 to-festive-cream'}`}
      >
        <header className={cn("fixed top-0 left-0 right-0 z-50 border-b h-16 transition-colors", progress.isBonusMode ? "bg-zinc-950/90 border-red-900 border-b-4 border-red-600/50" : "bg-white/90 border-neutral-100")}>
          <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Button onClick={handleBackToVault} variant="ghost" size="sm" className={cn("h-10 gap-2", progress.isBonusMode ? "text-zinc-400 hover:text-red-400" : "text-neutral-500 hover:text-neutral-900")}>
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden md:inline">Exit Mission</span>
              </Button>
            </div>
            <div className="flex flex-1 flex-col items-center max-w-[180px]">
              <div className="flex w-full items-end justify-between px-1">
                <span className={cn("font-black uppercase tracking-widest", progress.isBonusMode ? "text-red-400" : "text-duolingo-green")}>{scoreProgress}%</span>
              </div>
              <Progress value={Math.min(scoreProgress, 100)} className={cn("h-3.5", progress.isBonusMode ? "bg-zinc-900 border-zinc-800" : "bg-neutral-100")} indicatorClassName={progress.isBonusMode ? "bg-red-500" : "bg-duolingo-green"} />
            </div>
            <div className="flex items-center"><img src='/images/smile-yellow.svg' className="h-8 w-8" /></div>
          </div>
        </header>

        <div className="h-14" />
        <div className={progress.isBonusMode ? 'mb-12' : 'mb-0'} />

        {progress.isBonusMode && (
          <motion.div className="bg-gradient-to-r from-red-950 via-red-600 to-red-950 shadow-lg animate-pulse py-3 text-center">
            <p className="text-white font-black text-lg uppercase tracking-wider">⚡ SUDDEN DEATH MODE ⚡</p>
            <p className="text-red-100 text-sm font-bold mt-1">One mistake ends it all. {completedBonusIds.length}/{totalBonus} bonus puzzles completed.</p>
          </motion.div>
        )}

        <AnimatePresence>
          {showPerfectRunFailure && (
            <PerfectRunFailureModal pathId={pathId} streak={progress.perfectRunStreak} remainingPuzzles={remainingPuzzles.length} onClose={() => { setShowPerfectRunFailure(false); navigate('/hub'); }} isTester={isTester} />
          )}
        </AnimatePresence>

        <SuccessOverlay show={showSuccessOverlay} message={getStreakMessage()} />

        {/* FIX: Use mode-aware gating to show puzzles during Sudden Death */}
        {!showThresholdModal && !showCompletion && (!isPathCompleted || progress.isBonusMode) && (
          <main className="flex flex-1 flex-col px-6 pt-20 pb-12">
            <div className="max-w-xl mx-auto w-full">
              <AnimatePresence mode="wait">
                <motion.div key={puzzle.id} className="space-y-8">
                  <PuzzleRenderer puzzle={puzzle} onSubmit={handleSubmit} showHint={showHint} isSubmitting={isSubmitting} validationResult={validationResult} pathId={pathId} currentMistakes={currentRun.mistakes} currentScore={currentScore} targetScore={targetScore} shake={shake} isTester={isTester} />
                  {!isSubmitting && (
                    <Button onClick={handleSkip} variant="ghost" className="w-full text-zinc-500 hover:text-zinc-700">Skip Question for Now →</Button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {feedback && (
              <motion.div className={cn("max-w-xl mx-auto w-full mt-6 doodle-sticker p-4 font-bold", feedback.type === 'success' ? 'bg-success-bg' : 'bg-red-50')}>
                {feedback.message}
              </motion.div>
            )}
          </main>
        )}

        {isTester && currentPuzzleId && (
          <QuestSimulationToolbar pathId={pathId} currentPuzzleId={currentPuzzleId} onSubmit={handleSubmit} currentScore={currentScore} targetScore={targetScore} remainingPuzzles={remainingPuzzles.length} attempts={attempts} showThresholdModal={showThresholdModal} showPerfectRunFailure={showPerfectRunFailure} />
        )}
      </motion.div>
    </>
  );
};

export default QuestPage;