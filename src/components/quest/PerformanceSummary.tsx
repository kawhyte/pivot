'use client';

import { motion } from 'framer-motion';
import { Clock, Sparkles, Zap, Award } from 'lucide-react';
import { formatTime } from '@/lib/themed-titles';
import { isPersonalBest } from '@/lib/achievements';
import type { AchievementResult } from '@/lib/achievements';

interface PerformanceSummaryProps {
  achievement: AchievementResult;
  accuracy: number;
  completionTime: number;
  previousAccuracy?: number;
  previousTime?: number;
}

export const PerformanceSummary = ({
  achievement,
  accuracy,
  completionTime,
  previousAccuracy,
  previousTime,
}: PerformanceSummaryProps) => {
  const isNewPersonalBest = isPersonalBest(accuracy, completionTime, previousAccuracy, previousTime);

  const getTierColor = () => {
    switch (achievement.tier) {
      case 'elite':
        return 'from-yellow-400 to-amber-500';
      case 'pro':
        return 'from-blue-400 to-cyan-500';
      default:
        return 'from-gray-400 to-slate-500';
    }
  };

  const getTierIcon = () => {
    switch (achievement.tier) {
      case 'elite':
        return <Zap className="h-5 w-5" />;
      case 'pro':
        return <Award className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8 rounded-2xl bg-white p-6 shadow-sm"
    >
      {/* Achievement Title with Tier Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-4 flex items-center justify-center gap-3"
      >
        <h2 className="text-2xl font-bold text-zinc-900">{achievement.title}</h2>
        <div className={`rounded-full bg-gradient-to-r ${getTierColor()} p-2 text-white`}>
          {getTierIcon()}
        </div>
      </motion.div>

      {/* Achievement Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-6 text-center text-sm text-zinc-600"
      >
        {achievement.message}
      </motion.p>

      {/* Personal Best Indicator */}
      {isNewPersonalBest && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-4 w-4 text-emerald-600" />
          </motion.div>
          <span className="font-semibold text-emerald-700">New Personal Best!</span>
        </motion.div>
      )}

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Accuracy */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center gap-1.5 text-sm text-zinc-600">
            <Sparkles className="h-4 w-4" />
            <span>Accuracy</span>
          </div>
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 100 }}
            className="mt-2 text-3xl font-bold text-zinc-900"
          >
            {accuracy}%
          </motion.p>
          {previousAccuracy && accuracy > previousAccuracy && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-1 text-xs text-emerald-600 font-medium"
            >
              ↑ {accuracy - previousAccuracy}% better
            </motion.p>
          )}
        </motion.div>

        {/* Time */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-center gap-1.5 text-sm text-zinc-600">
            <Clock className="h-4 w-4" />
            <span>Time</span>
          </div>
          <motion.p
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 100 }}
            className="mt-2 text-3xl font-bold text-zinc-900"
          >
            {formatTime(completionTime)}
          </motion.p>
          {previousTime && completionTime < previousTime && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-1 text-xs text-blue-600 font-medium"
            >
              ↓ {formatTime(previousTime - completionTime)} faster
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Achievement Category Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-6 flex justify-center"
      >
        <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white ${
          achievement.category === 'accuracy'
            ? 'bg-purple-500'
            : achievement.category === 'speed'
            ? 'bg-blue-500'
            : 'bg-slate-500'
        }`}>
          {achievement.category === 'accuracy' && <Award className="h-3.5 w-3.5" />}
          {achievement.category === 'speed' && <Zap className="h-3.5 w-3.5" />}
          {achievement.category === 'standard' && <Sparkles className="h-3.5 w-3.5" />}
          <span className="capitalize">{achievement.category} Achievement</span>
        </span>
      </motion.div>
    </motion.div>
  );
};
