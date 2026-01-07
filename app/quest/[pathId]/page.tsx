'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { useQuestStore, PATH_METADATA, type PathId } from '@/store/useQuestStore';
import { getPuzzle, getTotalPuzzles } from '@/data/puzzles';
import { validateAnswer } from '@/lib/puzzle-validator';
import { PuzzleRenderer } from '@/components/puzzles/PuzzleRenderer';

interface QuestPageProps {
  params: { pathId: string };
}

const QuestPage = ({ params }: QuestPageProps) => {
  const router = useRouter();
  const pathId = parseInt(params.pathId) as PathId;

  const { pathLevels, updatePathLevel, addKey, keysCollected } = useQuestStore();

  const [currentLevel, setCurrentLevel] = useState(pathLevels[pathId] || 1);
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const totalPuzzles = getTotalPuzzles(pathId);
  const puzzle = getPuzzle(pathId, currentLevel - 1);
  const pathMeta = PATH_METADATA[pathId];
  const isPathCompleted = keysCollected.includes(pathId);

  // Redirect if path is invalid or already completed
  useEffect(() => {
    if (!puzzle && !isPathCompleted) {
      router.push('/');
    }
  }, [puzzle, isPathCompleted, router]);

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

  const handleSubmit = async (answer: string | number) => {
    if (!puzzle || isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

    // Simulate network delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = validateAnswer(puzzle, answer);

    if (result.isCorrect) {
      setFeedback({ type: 'success', message: result.message });
      fireConfetti();

      // Check if path is complete
      if (currentLevel >= totalPuzzles) {
        setTimeout(() => {
          setShowCompletion(true);
          addKey(pathId);
          updatePathLevel(pathId, totalPuzzles);
        }, 1500);
      } else {
        // Move to next puzzle
        setTimeout(() => {
          const nextLevel = currentLevel + 1;
          setCurrentLevel(nextLevel);
          updatePathLevel(pathId, nextLevel);
          setFeedback(null);
          setShowHint(false);
        }, 1500);
      }
    } else {
      setFeedback({ type: 'error', message: result.message });
      if (result.showHint) {
        setTimeout(() => setShowHint(true), 500);
      }
    }

    setIsSubmitting(false);
  };

  const handleBackToVault = () => {
    router.push('/');
  };

  // Path completion screen
  if (showCompletion || isPathCompleted) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-50 to-zinc-100">
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
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-50 to-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToVault}
              className="flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-zinc-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Vault
            </button>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-zinc-600">
                {currentLevel} / {totalPuzzles}
              </span>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200">
                <motion.div
                  className="h-full"
                  style={{ background: pathMeta.colors.primary }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(currentLevel / totalPuzzles) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col px-6 py-12">
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
            />
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
