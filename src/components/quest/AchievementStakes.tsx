'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { PathId } from '@/lib/paths';
import { PATH_IDS } from '@/lib/paths';

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
          title: 'Sitcom Completionist Award',
          icon: <Trophy className="h-4 w-4" />,
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
          title: 'Renaissance Completionist Award',
          icon: <Trophy className="h-4 w-4" />,
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
          title: 'Heartfelt Completionist Award',
          icon: <Trophy className="h-4 w-4" />,
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
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex items-center gap-2"
              layout
            >
              {/* Icon Badge */}
              <motion.div
                animate={
                  isPeeked && stake.requirementMet
                    ? {
                        scale: [1, 1.1, 1],
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
                  flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full
                  transition-all duration-300
                  ${
                    stake.requirementMet
                      ? 'bg-amber-100 text-amber-600 border-2 border-amber-300'
                      : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                  }
                `}
                title={stake.title}
              >
                {stake.icon}
              </motion.div>

              {/* Peek Title - Slides in horizontally */}
              <AnimatePresence mode="wait">
                {isPeeked && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                    layout
                  >
                    <motion.span
                      className={`
                        inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap
                        ${
                          stake.requirementMet
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : 'bg-zinc-100 text-zinc-600 border border-zinc-300'
                        }
                      `}
                      layout
                    >
                      {stake.title} 
                    </motion.span>
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
