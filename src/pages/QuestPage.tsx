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

const getFirstStrikeMessage = (pathId: PathId): string => {
  switch (pathId) {
    case 1: return "Pivot! That's one strike. Don't make us go on a 'break' from this question! ☕";
    case 2: return "Turbulence! One more wrong move and we're re-routing your flight. ✈️";
    case 3: return "Memory foggy? One more guess before we save this for the scrapbook! ❤️";
    default: return "That's strike one! One more wrong and we're moving on...";
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
    const p = allPuzzles.find(item => item.id === id);
    return p && !p.isBonus;
  });
  const completedBonusIds = progress.completedIds.filter(id => {
    const p = allPuzzles.find(item => item.id === id);
    return p && p.isBonus === true;
  });

  const scoreProgress = progress.isBonusMode
    ? Math.round((completedBonusIds.length / totalBonus) * 100)
    : Math.round((completedNonBonusIds.length / totalNonBonus) * 100);

  useEffect(() => {
    if (!currentPuzzleId) {
      const nextPuzzle = getNextUnsolvedPuzzle(pathId);
      if (nextPuzzle) setCurrentPuzzle(nextPuzzle);
    }
  }, [pathId, currentPuzzleId, setCurrentPuzzle, getNextUnsolvedPuzzle]);

  useEffect(() => {
    startNewRun();
    return () => resetRun();
  }, [pathId, startNewRun, resetRun]);

  useEffect(() => {
    const baseComplete = completedNonBonusIds.length === totalNonBonus;
    if (baseComplete && !progress.isBonusMode && !isTransitioningToBonus && totalBonus > 0) {
      setIsTransitioningToBonus(true);
    }
  }, [completedNonBonusIds.length, totalNonBonus, progress.isBonusMode, isTransitioningToBonus, totalBonus]);

  const handleSubmit = async (answer: string | number) => {
    if (!puzzle || !currentPuzzleId || isSubmitting) return;

    setIsSubmitting(true);
    const timeSpent = Date.now() - puzzleStartTime;
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = validateAnswer(puzzle, answer);
    setValidationResult(result);

    if (result.status === 'correct') {
      setFeedback({ type: 'success', message: result.message });
      setShowSuccessOverlay(true);
      setTimeout(() => setShowSuccessOverlay(false), 1200);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });

      // Submit and await update to DB/Store
      await submitAnswer(pathId, currentPuzzleId, true, 1.0, timeSpent);
      setPuzzleStartTime(Date.now());

      // FIX: Pull FRESH state after the await to check absolute latest completion
      const freshProgress = useQuestStore.getState().pathProgress[pathId];
      const allCompleted = freshProgress.completedIds.length === totalPuzzles;

      setTimeout(() => {
        if (allCompleted) {
          const accuracy = calculateAccuracy(totalPuzzles, freshProgress.mistakes);
          const stats = {
            completionTime: freshProgress.totalTimeSpent,
            accuracy,
            mistakes: freshProgress.mistakes,
            themedTitle: getThemedTitle(pathId, accuracy),
            completedAt: Date.now(),
            totalQuestions: totalPuzzles,
            perfectRunCompleted: freshProgress.isBonusMode,
            thresholdDecision: freshProgress.isBonusMode ? '100%' as const : '91%' as const,
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
      } else if (progress.isPerfectRunActive) {
        endPerfectRun(pathId, false);
        setShowPerfectRunFailure(true);
      } else {
        const weight = result.status === 'close' ? 0.5 : 1.0;
        await submitAnswer(pathId, currentPuzzleId, false, weight, timeSpent);
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
            const next = getNextUnsolvedPuzzle(pathId, currentPuzzleId);
            if (next) handleNavigate(next);
          }, 2500);
        }
      }
    }
    setIsSubmitting(false);
  };

  const handleNavigate = (puzzleId: string) => {
    setCurrentPuzzle(puzzleId);
    setFeedback(null);
    setValidationResult(null);
    setShowHint(false);
  };

  const handleBackToVault = () => navigate('/hub');

  if ((showCompletion || isPathCompleted) && !progress.isBonusMode && !isTransitioningToBonus) {
    const stats = getPathStats(pathId);
    if (stats) return <DetailedStatsScreen pathId={pathId} stats={stats} onReturnToHub={handleBackToVault} showPerfectRunBadge={stats.perfectRunCompleted} isTester={isTester} />;
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
        animate={progress.isBonusMode ? { filter: 'grayscale(20%) contrast(120%)' } : { filter: 'none' }}
        className={cn("flex min-h-screen flex-col", progress.isBonusMode ? 'bg-zinc-950' : 'bg-warm-cream')}
      >
        <header className={cn("fixed top-0 left-0 right-0 z-50 border-b h-16 transition-colors", progress.isBonusMode ? "bg-zinc-950/90 border-red-900 border-b-4" : "bg-white/90 border-neutral-100")}>
          <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-6">
            <Button onClick={handleBackToVault} variant="ghost" className={progress.isBonusMode ? "text-zinc-400" : "text-neutral-500"}>
              <ArrowLeft className="mr-2 h-5 w-5" /> Exit
            </Button>
            <div className="flex flex-col items-center w-40">
              <span className={cn("text-xs font-black", progress.isBonusMode ? "text-red-400" : "text-duolingo-green")}>{scoreProgress}%</span>
              <Progress value={scoreProgress} className="h-2" indicatorClassName={progress.isBonusMode ? "bg-red-500" : "bg-duolingo-green"} />
            </div>
            <img src='/images/smile-yellow.svg' className="h-8 w-8" />
          </div>
        </header>

        <div className="h-16" />
        
        {progress.isBonusMode && (
          <div className="bg-red-600 py-2 text-center text-white font-black animate-pulse">
            ⚡ SUDDEN DEATH MODE ⚡
            <p className="text-xs">{completedBonusIds.length}/{totalBonus} bonus puzzles completed</p>
          </div>
        )}

        <SuccessOverlay show={showSuccessOverlay} message={getStreakMessage()} />

        {/* FIX: Gating logic allows content during Sudden Death */}
        {!showThresholdModal && !showCompletion && (!isPathCompleted || progress.isBonusMode) && (
          <main className="flex flex-1 flex-col px-6 pt-10 pb-12">
            <div className="max-w-xl mx-auto w-full">
              <PuzzleRenderer 
                puzzle={puzzle} 
                onSubmit={handleSubmit} 
                isSubmitting={isSubmitting} 
                validationResult={validationResult} 
                pathId={pathId} 
                shake={shake} 
                isBonusMode={progress.isBonusMode}
              />
            </div>
          </main>
        )}
      </motion.div>
    </>
  );
};

export default QuestPage;