'use client';

import { motion } from 'framer-motion';
import { Lock, Key, Clock, Sparkles, Tv, BookOpen, Heart as HeartIcon } from 'lucide-react';
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

  // Get thematic icon for each path
  const getPathIcon = () => {
    switch (pathId) {
      case 1: // Pop Culture
        return <Tv className="h-16 w-16" strokeWidth={1.5} />;
      case 2: // Renaissance
        return <BookOpen className="h-16 w-16" strokeWidth={1.5} />;
      case 3: // Heart
        return <HeartIcon className="h-16 w-16" strokeWidth={1.5} fill="currentColor" />;
      default:
        return null;
    }
  };

  // Get placeholder colors for each path
  const getPlaceholderColors = () => {
    switch (pathId) {
      case 1: // Pop Culture
        return 'from-celebration-pink/20 to-celebration-pink/5';
      case 2: // Renaissance
        return 'from-celebration-gold/20 to-celebration-gold/5';
      case 3: // Heart
        return 'from-starbucks-green/20 to-starbucks-green/5';
      default:
        return 'from-gray-200 to-gray-100';
    }
  };

  // Get border color for each path
  const getBorderColor = () => {
    switch (pathId) {
      case 1: // Pop Culture
        return 'border-celebration-pink';
      case 2: // Renaissance
        return 'border-celebration-gold';
      case 3: // Heart
        return 'border-starbucks-green';
      default:
        return 'border-gray-300';
    }
  };

  // Get icon color for each path
  const getIconColor = () => {
    switch (pathId) {
      case 1: // Pop Culture
        return 'text-celebration-pink';
      case 2: // Renaissance
        return 'text-celebration-gold';
      case 3: // Heart
        return 'text-starbucks-green';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className="relative w-full"
      whileHover={isClickable ? { scale: 1.02, rotate: isClickable ? 1 : 0 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
    >
      <div
        className={`
          relative overflow-hidden hand-drawn-card border-3 p-6
          transition-all duration-300
          ${
            isCollected
              ? `${getBorderColor()} bg-gradient-to-br ${getPlaceholderColors()}`
              : unlocked
              ? `${getBorderColor()} bg-soft-white hover:shadow-2xl selected-glow`
              : 'border-deep-brown/20 bg-gray-100'
          }
        `}
      >
        {/* Background Photo Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none"
          style={{
            backgroundImage: pathId === 1
              ? 'url(/images/pop-culture-thumb.jpg)'
              : pathId === 2
              ? 'url(/images/renaissance-thumb.jpg)'
              : 'url(/images/heart-thumb.jpg)'
          }}
        />

        {/* THEMATIC SKETCH PLACEHOLDER - Top Section */}
        <div className="mb-4 flex items-center justify-center relative">
          {/* Placeholder Frame for Custom Icon/Photo */}
          <div className={`absolute inset-0 bg-gradient-to-br ${getPlaceholderColors()} opacity-30 hand-drawn`} />

          <div className="relative z-10">
            {isCollected ? (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="relative"
              >
                {/* Collected Key with Thematic Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${getPlaceholderColors()} rounded-full blur-xl opacity-50`} />
                <Key
                  className={`h-12 w-12 relative z-10 ${getIconColor()}`}
                  strokeWidth={1.5}
                />
              </motion.div>
            ) : unlocked ? (
              <div className="relative">
                {/* PLACEHOLDER: Thematic Sketch Area */}
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className={`absolute inset-0 bg-gradient-to-br ${getPlaceholderColors()} hand-drawn-border ${getBorderColor()} opacity-40`}
                  style={{ width: '120px', height: '120px', top: '-30px', left: '-30px' }}
                />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`${getIconColor()}/60`}>
                    {getPathIcon()}
                  </div>
                  <p className="text-xs font-accent text-deep-brown/40 italic text-center px-4">
                    [Thematic Sketch]
                  </p>
                </div>
              </div>
            ) : (
              <Clock
                className="h-12 w-12 text-deep-brown/30"
                strokeWidth={1.5}
              />
            )}
          </div>
        </div>

        {/* Path Info */}
        <div className="text-center relative z-10">
          <h3
            className={`mb-1 text-xl font-display ${
              isCollected ? getIconColor() : 'text-starbucks-green'
            }`}
          >
            {path.name}
          </h3>
          <p className="text-sm font-accent text-deep-brown/70 italic">{path.subtitle}</p>
        </div>

        {/* Stats for Collected Paths */}
        {isCollected && stats ? (
          <div className="mt-4 space-y-3 relative z-10">
            <div className="flex items-center justify-center gap-1.5">
              <p className={`text-base font-semibold ${getIconColor()}`}>
                {stats.themedTitle}
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-deep-brown/70">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-medium font-accent">{formatTime(stats.completionTime)}</span>
              </div>
              <div className="h-3 w-px bg-deep-brown/30" />
              <div className="flex items-center gap-1 text-deep-brown/70">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-medium font-accent">{stats.accuracy}%</span>
              </div>
            </div>
          </div>
        ) : (
          /* Status Badge for Uncollected/Locked Paths */
          <div className="mt-4 flex justify-center relative z-10">
            <motion.div
              whileHover={unlocked ? { scale: 1.05 } : undefined}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={`
                inline-flex items-center gap-2 hand-drawn px-4 py-1.5 text-xs font-medium border-2
                ${
                  unlocked
                    ? `${getBorderColor()} bg-soft-white ${getIconColor()}`
                    : 'bg-deep-brown/10 text-deep-brown/60 border-deep-brown/20'
                }
              `}
            >
              {unlocked ? (
                <span className="font-display">Start Quest →</span>
              ) : (
                <>
                  <Clock className="h-3 w-3" />
                  <span className="font-accent">{countdownText}</span>
                </>
              )}
            </motion.div>
          </div>
        )}

        {/* Shimmer effect for unlocked paths */}
        {unlocked && !isCollected && (
          <motion.div
            className="absolute inset-0 opacity-0"
            animate={{
              opacity: [0, 0.15, 0],
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: 'easeInOut',
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
