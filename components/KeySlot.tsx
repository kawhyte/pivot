'use client';

import { motion } from 'framer-motion';
import { Lock, Key, Clock, Sparkles } from 'lucide-react';
import { PATH_METADATA, type PathId, type PathStats } from '@/store/useQuestStore';
import { getCountdownText, isPathUnlocked } from '@/lib/daily-drop';
import { formatTime } from '@/lib/themed-titles';

interface KeySlotProps {
  pathId: PathId;
  isCollected: boolean;
  onClick: () => void;
  stats?: PathStats;
}

export const KeySlot = ({ pathId, isCollected, onClick, stats }: KeySlotProps) => {
  const path = PATH_METADATA[pathId];
  const unlocked = isPathUnlocked(pathId);
  const countdownText = getCountdownText(pathId);

  const isClickable = unlocked && !isCollected;

  return (
    <motion.button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className="relative w-full"
      whileHover={isClickable ? { scale: 1.02 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl border-2 p-6
          transition-all duration-300
          ${
            isCollected
              ? 'border-emerald-500 bg-emerald-50'
              : unlocked
              ? 'border-zinc-300 bg-white hover:border-zinc-400 hover:shadow-lg'
              : 'border-zinc-200 bg-zinc-50'
          }
        `}
        style={
          isCollected
            ? {
                background: `linear-gradient(135deg, ${path.colors.primary}15, ${path.colors.secondary}15)`,
              }
            : undefined
        }
      >
        {/* Status Icon */}
        <div className="mb-4 flex items-center justify-center">
          {isCollected ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Key
                className="h-12 w-12"
                style={{ color: path.colors.primary }}
                strokeWidth={1.5}
              />
            </motion.div>
          ) : unlocked ? (
            <Lock
              className="h-12 w-12 text-zinc-400"
              strokeWidth={1.5}
            />
          ) : (
            <Clock
              className="h-12 w-12 text-zinc-300"
              strokeWidth={1.5}
            />
          )}
        </div>

        {/* Path Info */}
        <div className="text-center">
          <h3
            className={`mb-1 text-xl font-semibold ${
              isCollected ? 'text-emerald-900' : 'text-zinc-900'
            }`}
          >
            {path.name}
          </h3>
          <p className="text-sm text-zinc-600">{path.subtitle}</p>
        </div>

        {/* Stats for Collected Paths */}
        {isCollected && stats ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-center gap-1.5">
              <p className="text-base font-semibold text-emerald-900">
                {stats.themedTitle}
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-zinc-600">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium">{formatTime(stats.completionTime)}</span>
              </div>
              <div className="h-3 w-px bg-zinc-300" />
              <div className="flex items-center gap-1 text-zinc-600">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-medium">{stats.accuracy}%</span>
              </div>
            </div>
          </div>
        ) : (
          /* Status Badge for Uncollected/Locked Paths */
          <div className="mt-4 flex justify-center">
            <div
              className={`
                inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium
                ${
                  unlocked
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-200 text-zinc-600'
                }
              `}
            >
              {unlocked ? (
                'Start Quest'
              ) : (
                <>
                  <Clock className="h-3 w-3" />
                  {countdownText}
                </>
              )}
            </div>
          </div>
        )}

        {/* Shimmer effect for unlocked paths */}
        {unlocked && !isCollected && (
          <motion.div
            className="absolute inset-0 opacity-0"
            animate={{
              opacity: [0, 0.1, 0],
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
            }}
          />
        )}
      </div>
    </motion.button>
  );
};
