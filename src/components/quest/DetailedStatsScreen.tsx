'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Clock, Target, SkipForward, Zap, Award } from 'lucide-react';
import { PATH_METADATA, type PathId, type PathStats } from '@/store/useQuestStore';
import { TrophyIcon } from '@/components/icons/TrophyIcon';
import { SparklesIcon } from '@/components/icons/SparklesIcon';

interface DetailedStatsScreenProps {
  pathId: PathId;
  stats: PathStats;
  onReturnToHub: () => void;
  showPerfectRunBadge?: boolean;
  isTester?: boolean;
}

// Format milliseconds to "Xm Ys" or "Xs"
const formatTime = (ms: number): string => {
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
};

export const DetailedStatsScreen = ({
  pathId,
  stats,
  onReturnToHub,
  showPerfectRunBadge = false,
  isTester = false,
}: DetailedStatsScreenProps) => {
  const pathMeta = PATH_METADATA[pathId];
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  // Fire confetti for perfect run completion
  useEffect(() => {
    if (showPerfectRunBadge && !hasShownConfetti) {
      const colors = [pathMeta.colors.primary, pathMeta.colors.secondary];

      // Multiple confetti bursts for perfect run
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors,
      });

      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors,
        });
      }, 200);

      setHasShownConfetti(true);
    }
  }, [showPerfectRunBadge, hasShownConfetti, pathMeta.colors]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Path Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-6 flex justify-center"
        >
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            // style={{
            //   background: `linear-gradient(135deg, ${pathMeta.colors.primary}, ${pathMeta.colors.secondary})`,
            // }}
          >
            {showPerfectRunBadge ? (
              <TrophyIcon className="h-24 w-24" />
            ) : (
              <SparklesIcon className="h-10 w-10 text-white" />
            )}
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mb-2 text-center text-3xl font-bold ${
            isTester ? 'text-cyan-400' : 'text-neutral-900'
          }`}
        >
          {showPerfectRunBadge ? 'Perfect Run Complete!' : 'Path Complete!'}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`mb-6 text-center ${isTester ? 'text-zinc-300' : 'text-neutral-700'}`}
        >
          {pathMeta.name} - {stats.themedTitle}
        </motion.p>

        {/* Perfect Run Badge (if applicable) */}
        {showPerfectRunBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 px-4 py-3"
          >
            <div className="flex items-center justify-center gap-2">
              <TrophyIcon className="h-24 w-24" />
              <p className="font-bold text-amber-900">100% Perfect Run Achievement!</p>
            </div>
          </motion.div>
        )}

        {/* Overall Performance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h3 className={`mb-3 text-sm font-bold uppercase tracking-wide ${
            isTester ? 'text-zinc-400' : 'text-neutral-500'
          }`}>
            Overall Performance
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Accuracy */}
            <div className="duo-stats-card">
              <div className="flex items-center gap-2 text-neutral-600">
                <Target className="h-4 w-4" />
                <span className="text-xs font-medium">Accuracy</span>
              </div>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 100 }}
                className="mt-2 text-3xl font-bold text-neutral-900"
              >
                {stats.accuracy}%
              </motion.p>
            </div>

            {/* Time */}
            <div className="duo-stats-card">
              <div className="flex items-center gap-2 text-neutral-600">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Time</span>
              </div>
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 100 }}
                className="mt-2 text-3xl font-bold text-neutral-900"
              >
                {formatTime(stats.completionTime)}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Question Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-6"
        >
          <h3 className={`mb-3 text-sm font-bold uppercase tracking-wide ${
            isTester ? 'text-zinc-400' : 'text-neutral-500'
          }`}>
            Question Breakdown
          </h3>
          <div className="duo-stats-card space-y-3">
            {/* Total Questions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-700">
                <span className="text-2xl">📝</span>
                <span className="font-medium">Total Questions</span>
              </div>
              <span className="text-xl font-bold text-neutral-900">{stats.totalQuestions}</span>
            </div>

            {/* First-Try Correct */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-700">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">First-Try Correct</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-neutral-900">{stats.firstTryCount}</span>
                <span className="ml-2 text-sm text-neutral-600">({stats.firstTryRate}%)</span>
              </div>
            </div>

            {/* Skipped */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-700">
                <SkipForward className="h-5 w-5 text-neutral-400" />
                <span className="font-medium">Skipped</span>
              </div>
              <span className="text-xl font-bold text-neutral-900">{stats.skippedCount}</span>
            </div>

            {/* Avg Time/Question */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-neutral-700">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Avg Time/Question</span>
              </div>
              <span className="text-xl font-bold text-neutral-900">
                {formatTime(stats.avgTimePerQuestion)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Achievement Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-6 flex justify-center"
        >
          {/* <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Mastery Achievement</span>
            </div>
          </div> */}
        </motion.div>

        {/* Return to Vault Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          onClick={onReturnToHub}
          className={`duo-button w-full py-4 text-white ${
            isTester
              ? 'bg-cyan-600 hover:bg-cyan-500'
              : 'bg-duolingo-green hover:bg-duolingo-green-dark'
          }`}
        >
          <span className="font-bold">Return to Vault</span>
        </motion.button>
      </motion.div>
    </div>
  );
};
