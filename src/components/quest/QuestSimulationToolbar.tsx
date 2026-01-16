import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  ChevronUp,
  Bug,
  Play,
  CheckCircle,
  XCircle,
  Zap,
  Award,
  Target,
  Heart,
  AlertCircle,
} from 'lucide-react';
import { TESTER_THEME } from '@/lib/debug-utils';
import { useQuestSimulation } from '@/hooks/useQuestSimulation';
import { PATH_METADATA, type PathId } from '@/lib/paths';

interface QuestSimulationToolbarProps {
  pathId: PathId;
  currentPuzzleId: string | null;
  onSubmit: (answer: string | number) => Promise<void>;
  currentScore: number;
  targetScore: number;
  remainingPuzzles: number;
  attempts: number;
  showThresholdModal: boolean;
  showPerfectRunFailure: boolean;
}

export const QuestSimulationToolbar = ({
  pathId,
  currentPuzzleId,
  onSubmit,
  currentScore,
  targetScore,
  remainingPuzzles,
  attempts,
  showThresholdModal,
  showPerfectRunFailure,
}: QuestSimulationToolbarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const simulation = useQuestSimulation({
    pathId,
    currentPuzzleId,
    onSubmit,
    showThresholdModal,
    showPerfectRunFailure,
  });

  const pathMeta = PATH_METADATA[pathId];
  const scoreProgress = Math.round((currentScore / targetScore) * 100);

  // Keyboard shortcut: Ctrl+Shift+S to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-6 z-40 p-4 rounded-full shadow-lg border-2"
        style={{
          backgroundColor: TESTER_THEME.primary,
          borderColor: TESTER_THEME.primaryDark,
        }}
        title="Quest Simulator (Ctrl+Shift+S)"
      >
        <Bug className="h-5 w-5 text-white" />
      </motion.button>
    );
  }

  return (
    <>
      {/* Auto-Playing Indicator Overlay */}
      <AnimatePresence>
        {simulation.isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-32 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg border-2"
            style={{
              backgroundColor: TESTER_THEME.primary,
              borderColor: TESTER_THEME.primaryDark,
            }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Bug className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-base font-black text-white">
                🤖 AUTO-PLAYING {simulation.currentScenario && `(${simulation.currentScenario})`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toolbar */}
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-20 right-6 z-40 w-96 max-h-[75vh] overflow-hidden rounded-2xl shadow-2xl border-4"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: TESTER_THEME.primary,
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <div
          className="px-4 py-3 border-b-2"
          style={{
            backgroundColor: TESTER_THEME.primary,
            borderColor: TESTER_THEME.primaryDark,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-white" />
              <h2 className="text-base font-black text-white">Quest Simulator</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label={isMinimized ? 'Expand' : 'Collapse'}
              >
                {isMinimized ? (
                  <ChevronDown className="h-4 w-4 text-white" />
                ) : (
                  <ChevronUp className="h-4 w-4 text-white" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Close Simulator"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
          <div className="mt-1 text-xs text-white/80">Keyboard: Ctrl+Shift+S</div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-y-auto max-h-[calc(75vh-4rem)] p-4"
            >
              <div className="space-y-4">
                {/* Progress Stats */}
                <div
                  className="p-3 rounded-lg border-2"
                  style={{ borderColor: TESTER_THEME.border, backgroundColor: TESTER_THEME.bg }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4" style={{ color: TESTER_THEME.primary }} />
                    <span className="text-sm font-bold" style={{ color: TESTER_THEME.text }}>
                      Current Progress
                    </span>
                  </div>
                  <div className="space-y-1 text-xs" style={{ color: TESTER_THEME.text }}>
                    <div className="flex justify-between">
                      <span>Score:</span>
                      <span className="font-bold">
                        {currentScore} / {targetScore} ({scoreProgress}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Puzzles:</span>
                      <span className="font-bold">{remainingPuzzles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Attempts:</span>
                      <span className="font-bold">{attempts} / 2</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Path:</span>
                      <span className="font-bold">{pathMeta.name}</span>
                    </div>
                  </div>
                </div>

                {/* Manual Controls */}
                <div
                  className="p-3 rounded-lg border-2"
                  style={{ borderColor: TESTER_THEME.border, backgroundColor: TESTER_THEME.bg }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4" style={{ color: TESTER_THEME.primary }} />
                    <span className="text-sm font-bold" style={{ color: TESTER_THEME.text }}>
                      Manual Controls
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={simulation.submitCorrect}
                      disabled={simulation.isPlaying || !currentPuzzleId}
                      className="px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: '#10B981',
                        borderColor: '#059669',
                        color: 'white',
                      }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Correct</span>
                      </div>
                    </button>
                    <button
                      onClick={simulation.submitWrong}
                      disabled={simulation.isPlaying || !currentPuzzleId}
                      className="px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: '#EF4444',
                        borderColor: '#DC2626',
                        color: 'white',
                      }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Wrong</span>
                      </div>
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-center text-neutral-600">
                    One-click answer submission
                  </div>
                </div>

                {/* Scenario Buttons */}
                <div
                  className="p-3 rounded-lg border-2"
                  style={{ borderColor: TESTER_THEME.border, backgroundColor: TESTER_THEME.bg }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Play className="h-4 w-4" style={{ color: TESTER_THEME.primary }} />
                    <span className="text-sm font-bold" style={{ color: TESTER_THEME.text }}>
                      Auto-Play Scenarios
                    </span>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={simulation.completeTo91}
                      disabled={simulation.isPlaying}
                      className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: 'white',
                        borderColor: TESTER_THEME.border,
                        color: TESTER_THEME.primary,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Target className="h-3.5 w-3.5 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Complete to 91%</div>
                          <div className="text-xs text-neutral-600">Reach threshold, show modal</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={simulation.completePerfect}
                      disabled={simulation.isPlaying}
                      className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: 'white',
                        borderColor: TESTER_THEME.border,
                        color: TESTER_THEME.primary,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-3.5 w-3.5 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Complete Perfect</div>
                          <div className="text-xs text-neutral-600">Solve all puzzles correctly</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={simulation.triggerThreshold}
                      disabled={simulation.isPlaying}
                      className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: 'white',
                        borderColor: TESTER_THEME.border,
                        color: TESTER_THEME.primary,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Trigger Threshold</div>
                          <div className="text-xs text-neutral-600">Stop at exactly 91%</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={simulation.failPerfectRun}
                      disabled={simulation.isPlaying}
                      className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
                      style={{
                        backgroundColor: '#FEE2E2',
                        borderColor: '#EF4444',
                        color: '#DC2626',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className="h-3.5 w-3.5 flex-shrink-0" />
                        <div>
                          <div className="font-bold">Fail Perfect Run</div>
                          <div className="text-xs opacity-75">Start perfect run + fail</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Playback Controls */}
                {simulation.isPlaying && (
                  <div
                    className="p-3 rounded-lg border-2"
                    style={{ borderColor: TESTER_THEME.border, backgroundColor: TESTER_THEME.bg }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Play className="h-4 w-4" style={{ color: TESTER_THEME.primary }} />
                      <span className="text-sm font-bold" style={{ color: TESTER_THEME.text }}>
                        Playback Controls
                      </span>
                    </div>

                    {/* Stop Button */}
                    <button
                      onClick={simulation.stop}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all"
                      style={{
                        backgroundColor: '#EF4444',
                        borderColor: '#DC2626',
                        color: 'white',
                      }}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <X className="h-3.5 w-3.5" />
                        <span>Stop Auto-Play</span>
                      </div>
                    </button>

                    <div className="mt-2 text-xs text-center text-neutral-600">
                      Simulation runs automatically at full speed
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div
          className="px-4 py-2 border-t-2 text-center text-xs"
          style={{
            backgroundColor: TESTER_THEME.bg,
            borderColor: TESTER_THEME.border,
            color: TESTER_THEME.text,
          }}
        >
          Tester Mode • {pathMeta.name} Simulator
        </div>
      </motion.div>
    </>
  );
};
