'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Lock } from 'lucide-react';
import type { PathId } from '@/store/useQuestStore';
import { PATH_IDS } from '@/store/useQuestStore';

interface AchievementStakesProps {
  pathId: PathId;
  currentMistakes: number;
  elapsedTime: number;
}

interface StakeItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  type: 'accuracy' | 'speed';
  isAvailable: boolean;
  requirementMet: boolean;
  description: string;
}

const getPathStakes = (pathId: PathId, mistakes: number, elapsed: number): StakeItem[] => {
  const eliteThreshold = 300_000; // 5 minutes

  switch (pathId) {
    case PATH_IDS.POP_CULTURE:
      return [
        {
          id: 'monica-approved',
          title: 'Monica Approved 🧹',
          icon: <Zap className="h-4 w-4" />,
          type: 'accuracy',
          isAvailable: mistakes === 0,
          requirementMet: mistakes === 0,
          description: 'Perfect accuracy',
        },
        {
          id: 'lorelai-5-coffees',
          title: 'Lorelai on 5 Coffees ☕',
          icon: <Clock className="h-4 w-4" />,
          type: 'speed',
          isAvailable: elapsed < eliteThreshold,
          requirementMet: elapsed < eliteThreshold,
          description: 'Under 5 minutes',
        },
      ];

    case PATH_IDS.RENAISSANCE:
      return [
        {
          id: 'renaissance-master',
          title: 'Renaissance Master 🎨',
          icon: <Zap className="h-4 w-4" />,
          type: 'accuracy',
          isAvailable: mistakes === 0,
          requirementMet: mistakes === 0,
          description: 'Perfect accuracy',
        },
        {
          id: 'supersonic-voyager',
          title: 'Supersonic Voyager 🚀',
          icon: <Clock className="h-4 w-4" />,
          type: 'speed',
          isAvailable: elapsed < eliteThreshold,
          requirementMet: elapsed < eliteThreshold,
          description: 'Under 5 minutes',
        },
      ];

    case PATH_IDS.HEART:
      return [
        {
          id: 'soulmate-certified',
          title: 'Soulmate Certified ❤️',
          icon: <Zap className="h-4 w-4" />,
          type: 'accuracy',
          isAvailable: mistakes === 0,
          requirementMet: mistakes === 0,
          description: 'Perfect accuracy',
        },
      ];

    default:
      return [];
  }
};

export const AchievementStakes = ({
  pathId,
  currentMistakes,
  elapsedTime,
}: AchievementStakesProps) => {
  const [stakes, setStakes] = useState<StakeItem[]>([]);
  const [previousMistakes, setPreviousMistakes] = useState(0);

  useEffect(() => {
    const newStakes = getPathStakes(pathId, currentMistakes, elapsedTime);
    setStakes(newStakes);
    setPreviousMistakes(currentMistakes);
  }, [pathId, currentMistakes, elapsedTime]);

  const accuracyStakes = stakes.filter((s) => s.type === 'accuracy');
  const speedStakes = stakes.filter((s) => s.type === 'speed');

  const hasAnyAchievementAvailable = stakes.some((s) => s.isAvailable);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-lg bg-white/60 backdrop-blur-sm border border-zinc-200 p-4"
    >
      {/* Section Header */}
      <div className="mb-3 flex items-center gap-2">
        <motion.div
          animate={{
            scale: hasAnyAchievementAvailable ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: hasAnyAchievementAvailable ? Infinity : 0,
          }}
        >
          <Trophy className="h-4 w-4 text-amber-600" />
        </motion.div>
        <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wide">
          Potential Rewards
        </span>
      </div>

      {/* Accuracy Stakes */}
      {accuracyStakes.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-purple-600" />
            <span className="text-xs font-medium text-zinc-600">Accuracy</span>
          </div>
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {accuracyStakes.map((stake) => (
                <motion.div
                  key={stake.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  layout
                >
                  <div
                    className={`
                      relative flex items-center gap-2 rounded px-3 py-2 text-xs font-medium
                      transition-all duration-300
                      ${
                        stake.isAvailable
                          ? 'bg-gradient-to-r from-purple-50 to-transparent border border-purple-200'
                          : 'bg-zinc-50 border border-zinc-200 opacity-50'
                      }
                    `}
                  >
                    {stake.isAvailable ? (
                      <>
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [1, 0.8, 1],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                          className="text-purple-600"
                        >
                          {stake.icon}
                        </motion.div>
                        <span className="text-purple-700">{stake.title}</span>
                        <span className="ml-auto text-purple-600">
                          ✓
                        </span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-3.5 w-3.5 text-zinc-400" />
                        <span className="line-through text-zinc-500">
                          {stake.title}
                        </span>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Speed Stakes */}
      {speedStakes.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-blue-600" />
            <span className="text-xs font-medium text-zinc-600">Speed</span>
          </div>
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {speedStakes.map((stake) => {
                const remainingTime = 300_000 - elapsedTime;
                const showCountdown = stake.type === 'speed' && stake.isAvailable;

                return (
                  <motion.div
                    key={stake.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    layout
                  >
                    <div
                      className={`
                        relative flex items-center gap-2 rounded px-3 py-2 text-xs font-medium
                        transition-all duration-300
                        ${
                          stake.isAvailable
                            ? 'bg-gradient-to-r from-blue-50 to-transparent border border-blue-200'
                            : 'bg-zinc-50 border border-zinc-200 opacity-50'
                        }
                      `}
                    >
                      {stake.isAvailable ? (
                        <>
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [1, 0.8, 1],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                            }}
                            className="text-blue-600"
                          >
                            {stake.icon}
                          </motion.div>
                          <span className="text-blue-700">{stake.title}</span>
                          {showCountdown && (
                            <span className="ml-auto text-blue-600 font-mono">
                              {Math.max(0, Math.floor(remainingTime / 1000))}s
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5 text-zinc-400" />
                          <span className="line-through text-zinc-500">
                            {stake.title}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* No Stakes Available Warning */}
      {!hasAnyAchievementAvailable && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 rounded bg-amber-50 border border-amber-200 px-3 py-2"
        >
          <Lock className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-medium text-amber-700">
            No rewards currently available. Try to recover!
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

// Import Trophy icon
import { Trophy } from 'lucide-react';
