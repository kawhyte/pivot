import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, SkipForward } from 'lucide-react';
import { useQuestStore } from '@/store/useQuestStore';
import { PATH_METADATA, type PathId } from '@/lib/paths';
import { getPuzzleById, getTotalPuzzles, getTotalNonBonusPuzzles, getTotalBonusPuzzles, TARGET_SCORES, getPathPuzzles } from '@/data/puzzles';
import { validateAnswer } from '@/lib/puzzle-validator';
import { updateUnlockFlags } from '@/lib/supabase-sync';
import { getRandomFeedback } from '@/lib/themed-feedback';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PuzzleRenderer } from '@/components/puzzles/PuzzleRenderer';
import { SuccessOverlay } from '@/components/puzzles/SuccessOverlay';
import { calculateAccuracy, getThemedTitle } from '@/lib/themed-titles';
import { KeyUnlockedToast } from '@/components/quest/KeyUnlockedToast';
import { ThresholdDecisionModal } from '@/components/quest/ThresholdDecisionModal';
import { PerfectRunBanner } from '@/components/quest/PerfectRunBanner';
import { PerfectRunFailureModal } from '@/components/quest/PerfectRunFailureModal';
import { DetailedStatsScreen } from '@/components/quest/DetailedStatsScreen';
import { QuestionSkippedToast } from '@/components/quest/QuestionSkippedToast';
import { QuestSimulationToolbar } from '@/components/quest/QuestSimulationToolbar';
import { SuddenDeathTransition } from '@/components/quest/SuddenDeathTransition';
import { cn } from '@/lib/utils';
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
    _hasHydrated,
    pathUnlockStatus,
    setPathUnlockStatus,
    agentId,
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
  const [skipType, setSkipType] = useState<'manual' | 'auto'>('auto');
  const [puzzleStartTime, setPuzzleStartTime] = useState<number>(Date.now());
  const [isTransitioningToBonus, setIsTransitioningToBonus] = useState(false);
  const [pendingKeyUnlock, setPendingKeyUnlock] = useState(false);

  const totalPuzzles = getTotalPuzzles(pathId);
  const totalNonBonus = getTotalNonBonusPuzzles(pathId);
  const totalBonus = getTotalBonusPuzzles(pathId);
  const puzzle = currentPuzzleId ? getPuzzleById(pathId, currentPuzzleId) : null;
  const pathMeta = PATH_METADATA[pathId];
  const isPathCompleted = keysCollected.includes(pathId);
  const progress = pathProgress[pathId];
  const currentScore = getPathScore(pathId);
  const targetScore = TARGET_SCORES[pathId];
  const currentPathUnlockStatus = pathUnlockStatus[pathId];

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

  // Navigation Bouncer: Redirect to hub if path is already completed (prevents URL hacking)
  useEffect(() => {
    if (_hasHydrated && keysCollected.includes(pathId) && !progress.isBonusMode) {
      navigate('/hub');
    }
  }, [_hasHydrated, keysCollected, pathId, navigate, progress.isBonusMode]);

  // THE FIX: Force initialization if puzzle is missing or mismatched
  useEffect(() => {
    if (_hasHydrated) {
      const isMismatched = currentPuzzleId && !getPuzzleById(pathId, currentPuzzleId);
      if (!currentPuzzleId || isMismatched) {
        const nextPuzzle = getNextUnsolvedPuzzle(pathId);
        if (nextPuzzle) {
          setCurrentPuzzle(nextPuzzle);
        }
      }
    }
  }, [_hasHydrated, pathId, currentPuzzleId, getNextUnsolvedPuzzle, setCurrentPuzzle]);

  useEffect(() => {
    startNewRun();
    return () => resetRun();
  }, [pathId, startNewRun, resetRun]);

  // NEW LOGIC: Show decision modal instead of auto-transitioning to Sudden Death
  useEffect(() => {
    const baseComplete = completedNonBonusIds.length === totalNonBonus;
    const hasKeyAlready = currentPathUnlockStatus?.isKeyUnlocked;

    // Check if user just completed 100% base for the FIRST time
    if (baseComplete && !hasKeyAlready && !progress.isBonusMode && !showThresholdModal && totalBonus > 0) {
      // Set key unlocked flag in store and DB
      setPathUnlockStatus(pathId, { isKeyUnlocked: true });

      // Sync to database immediately
      if (agentId) {
        updateUnlockFlags(agentId, pathId, { isKeyUnlocked: true });
      }

      // Show decision modal (user chooses: claim key OR risk upgrade)
      setShowThresholdModal(true);
      setPendingKeyUnlock(true);
    }
  }, [
    completedNonBonusIds.length,
    totalNonBonus,
    currentPathUnlockStatus?.isKeyUnlocked,
    progress.isBonusMode,
    showThresholdModal,
    totalBonus,
    pathId,
    setPathUnlockStatus,
    agentId,
  ]);

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

      await submitAnswer(pathId, currentPuzzleId, true, 1.0, timeSpent);
      setPuzzleStartTime(Date.now());

      // Pull FRESH state from store after submission to check for completion
      const freshProgress = useQuestStore.getState().pathProgress[pathId];
      const allCompleted = freshProgress.completedIds.length === totalPuzzles;

      setTimeout(() => {
        if (allCompleted) {
          const accuracy = calculateAccuracy(totalPuzzles, freshProgress.mistakes);
          
          // Calculate all required statistics for PathStats
          const firstTryCount = Object.values(freshProgress.puzzleAttempts).filter((p) => p.isFirstTry).length;
          const firstTryRate = totalPuzzles > 0 ? Math.round((firstTryCount / totalPuzzles) * 100) : 0;
          const skippedCount = freshProgress.skippedIds.length;
          const avgTimePerQuestion = freshProgress.totalTimeSpent > 0 && totalPuzzles > 0
            ? Math.round(freshProgress.totalTimeSpent / totalPuzzles)
            : 0;

          const stats = {
            completionTime: freshProgress.totalTimeSpent,
            accuracy,
            mistakes: freshProgress.mistakes,
            themedTitle: getThemedTitle(pathId, accuracy),
            completedAt: Date.now(),
            totalQuestions: totalPuzzles,
            firstTryCount,
            firstTryRate,
            skippedCount,
            avgTimePerQuestion,
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
          setFeedback({ type: 'error', message: getRandomFeedback(pathId) });
          toast.error(getRandomFeedback(pathId) + ' (One more mistake and this question will be auto-skipped)');
          setShake(true);
          setTimeout(() => setShake(false), 400);
          setAttempts(1);
        } else {
          setSkipType('auto');
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


const handleManualSkip = async () => {
    if (!currentPuzzleId || isSubmitting) return;

    setIsSubmitting(true);
    setSkipType('manual');
    setShowSkippedToast(true);

    // Call the existing store action
    await skipPuzzle(pathId, currentPuzzleId);
    
    setTimeout(() => {
      setShowSkippedToast(false);
      const next = getNextUnsolvedPuzzle(pathId, currentPuzzleId);
      if (next) {
        handleNavigate(next);
      } else {
        navigate('/hub');
      }
      setIsSubmitting(false);
    }, 1000);
  };

  // NEW: Modal decision handlers
  const handleClaimKey = async () => {
    setShowThresholdModal(false);

    // Award key to vault with stats (is_key_unlocked: true, is_bonus_unlocked: false)
    const finalProgress = pathProgress[pathId];
    const accuracy = calculateAccuracy(totalNonBonus, finalProgress.mistakes);
    const themedTitle = getThemedTitle(pathId, accuracy, finalProgress.mistakes);

    const stats: import('@/store/useQuestStore').PathStats = {
      completionTime: finalProgress.totalTimeSpent,
      accuracy,
      mistakes: finalProgress.mistakes,
      themedTitle,
      completedAt: Date.now(),
      totalQuestions: totalNonBonus,
      firstTryCount: Object.values(finalProgress.puzzleAttempts).filter((p) => p.isFirstTry && p.isCompleted).length,
      firstTryRate: Math.round((Object.values(finalProgress.puzzleAttempts).filter((p) => p.isFirstTry && p.isCompleted).length / totalNonBonus) * 100),
      skippedCount: finalProgress.skippedIds.length,
      avgTimePerQuestion: Math.round(finalProgress.totalTimeSpent / totalNonBonus),
      perfectRunCompleted: false,
      thresholdDecision: '100%',
      isKeyUnlocked: true,
      isBonusUnlocked: false,
    };

    await addKey(pathId, stats);

    // Navigate to stats screen
    setShowCompletion(true);
  };

  const handleRiskUpgrade = async () => {
    setShowThresholdModal(false);

    // Start Sudden Death transition
    setIsTransitioningToBonus(true);
  };

  const handleBackToVault = () => navigate('/hub');

  // Show loader while hydrating or initializing puzzle
  if (!_hasHydrated || !puzzle) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-warm-cream p-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-duolingo-green opacity-50" />
        </motion.div>
        <p className="mt-4 font-bold text-neutral-500">Preparing your quest...</p>
      </div>
    );
  }

  if ((showCompletion || isPathCompleted) && !progress.isBonusMode && !isTransitioningToBonus) {
    const stats = getPathStats(pathId);
    if (stats) return <DetailedStatsScreen pathId={pathId} stats={stats} onReturnToHub={handleBackToVault} showPerfectRunBadge={stats.perfectRunCompleted} isTester={isTester} />;
  }

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

      {/* Threshold Decision Modal (100% Base Completion Fork) */}
      {showThresholdModal && (
        <ThresholdDecisionModal
          pathId={pathId}
          currentScore={currentScore}
          targetScore={targetScore}
          remainingPuzzles={totalBonus}
          onDecision={(decision) => {
            if (decision === 'claim') {
              handleClaimKey();
            } else {
              handleRiskUpgrade();
            }
          }}
          isTester={isTester}
        />
      )}

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

        {/* Gating logic allowing gameplay content during Sudden Death */}
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
                showHint={showHint}
                currentMistakes={progress.mistakes}
                currentScore={currentScore}
                targetScore={targetScore}
                isTester={isTester}
              />

<AnimatePresence>
                {!progress.isBonusMode && !showCompletion && (allPuzzles.length - progress.completedIds.length) > 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center mt-8"
                  >
                    <Button
                      variant="outline"
                      onClick={handleManualSkip}
                      disabled={isSubmitting}
                      className="rounded-xl border-2 border-b-4 border-neutral-200 hover:bg-neutral-50 active:border-b-2 active:translate-y-[2px] transition-all text-neutral-500 font-black px-8"
                    >
                      <SkipForward className="mr-2 h-5 w-5" />
                      SKIP FOR NOW
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </main>
        )}

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

      <AnimatePresence>
        {showSkippedToast && (
          <QuestionSkippedToast
            show={showSkippedToast}
            message={
              skipType === 'manual'
                ? "Skipped for now - you can revisit this later"
                : "Second strike! Auto-skipped this puzzle"
            }
            pathId={pathId}
            onDismiss={() => setShowSkippedToast(false)}
            isTester={isTester}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default QuestPage;