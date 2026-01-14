'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import type { PathId } from '@/store/useQuestStore';
import { PATH_IDS } from '@/store/useQuestStore';

interface AchievementStakesProps {
  pathId: PathId;
  completionPercentage: number;
}

interface StakeItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  type: 'completionist';
  isAvailable: boolean;
  requirementMet: boolean;
  description: string;
}

const getPathStakes = (pathId: PathId, completionPercentage: number): StakeItem[] => {
  const isCompleted = completionPercentage === 100;

  switch (pathId) {
    case PATH_IDS.POP_CULTURE:
      return [
        {
          id: 'friends-completionist',
          title: 'Friends Completionist ☕',
          icon: <Zap className="h-4 w-4" />,
          type: 'completionist',
          isAvailable: true,
          requirementMet: isCompleted,
          description: 'Complete all puzzles',
        },
      ];

    case PATH_IDS.RENAISSANCE:
      return [
        {
          id: 'renaissance-completionist',
          title: 'Renaissance Completionist 🎨',
          icon: <Zap className="h-4 w-4" />,
          type: 'completionist',
          isAvailable: true,
          requirementMet: isCompleted,
          description: 'Complete all puzzles',
        },
      ];

    case PATH_IDS.HEART:
      return [
        {
          id: 'heartfelt-completionist',
          title: 'Heartfelt Completionist ❤️',
          icon: <Zap className="h-4 w-4" />,
          type: 'completionist',
          isAvailable: true,
          requirementMet: isCompleted,
          description: 'Complete all puzzles',
        },
      ];

    default:
      return [];
  }
};

export const AchievementStakes = ({
  pathId,
  completionPercentage,
}: AchievementStakesProps) => {
  const [stakes, setStakes] = useState<StakeItem[]>([]);
  const [peekIndex, setPeekIndex] = useState(0);

  useEffect(() => {
    const newStakes = getPathStakes(pathId, completionPercentage);
    setStakes(newStakes);
  }, [pathId, completionPercentage]);

  // Ambient Awareness: Cycle peekIndex every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPeekIndex((prev) => (prev + 1) % Math.max(stakes.length, 1));
    }, 15000);

    return () => clearInterval(interval);
  }, [stakes.length]);

  const availableStakes = stakes.filter((s) => s.isAvailable);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3"
      layout
    >
      <AnimatePresence mode="popLayout">
        {availableStakes.map((stake, index) => {
          const isPeeked = peekIndex === index;

          return (
            <motion.div
              key={stake.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative"
              layout
            >
              {/* Icon Button */}
              <motion.button
                animate={
                  isPeeked && stake.requirementMet
                    ? {
                        scale: [1, 1.08, 1],
                      }
                    : {}
                }
                transition={
                  isPeeked && stake.requirementMet
                    ? {
                        duration: 0.6,
                        repeat: Infinity,
                      }
                    : {}
                }
                className={`
                  relative flex items-center justify-center h-8 w-8 rounded-full
                  transition-all duration-300
                  ${
                    stake.requirementMet
                      ? 'bg-purple-100/80 text-purple-700 border border-purple-300'
                      : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                  }
                `}
                title={stake.title}
              >
                {stake.icon}
              </motion.button>

              {/* Peek Tooltip */}
              <AnimatePresence mode="wait">
                {isPeeked && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap overflow-hidden"
                    layout
                  >
                    <motion.div
                      className={`
                        px-2 py-1 rounded text-xs font-medium whitespace-nowrap
                        ${
                          stake.requirementMet
                            ? 'bg-purple-100 text-purple-700 border border-purple-300'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-300'
                        }
                      `}
                      layout
                    >
                      {stake.title}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};
