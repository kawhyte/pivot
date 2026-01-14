'use client';

import { Key, Clock, Sparkles, Tv, BookOpen, Heart as HeartIcon } from 'lucide-react';
import { PATH_METADATA, type PathId } from '@/lib/paths';
import type { PathStats } from '@/store/useQuestStore';
import { getCountdownText, isPathUnlocked } from '@/lib/daily-drop';
import { formatTime } from '@/lib/themed-titles';

interface KeySlotProps {
  pathId: PathId;
  isCollected: boolean;
  onClick: () => void;
  stats?: PathStats;
  isTester?: boolean;
}

export const KeySlot = ({ pathId, isCollected, onClick, stats, isTester = false }: KeySlotProps) => {
  const path = PATH_METADATA[pathId];
  const unlocked = isPathUnlocked(pathId, isTester);
  const countdownText = getCountdownText(pathId, isTester);

  const isClickable = unlocked && !isCollected;

  // Get thematic icon for each path
  const getPathIcon = () => {
    switch (pathId) {
      case 1: // Pop Culture
        return <Tv className="h-16 w-16" strokeWidth={1.5} style={{ color: path.colors.primary }} />;
      case 2: // Renaissance
        return <BookOpen className="h-16 w-16" strokeWidth={1.5} style={{ color: path.colors.primary }} />;
      case 3: // Heart
        return <HeartIcon className="h-16 w-16" strokeWidth={1.5} fill={path.colors.primary} style={{ color: path.colors.primary }} />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      disabled={!isClickable}
      className={`relative w-full duo-card p-6 ${isClickable ? 'hover:shadow-lg cursor-pointer' : 'cursor-default'} ${!unlocked ? 'opacity-60' : ''}`}
    >
      {/* Background Photo Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none rounded-2xl"
        style={{
          backgroundImage: pathId === 1
            ? 'url(/images/pop-culture-thumb.jpg)'
            : pathId === 2
            ? 'url(/images/renaissance-thumb.jpg)'
            : 'url(/images/heart-thumb.jpg)'
        }}
      />

      {/* Icon Section */}
      <div className="mb-4 flex items-center justify-center relative">
        <div className="relative z-10">
          {isCollected ? (
            <div className="relative flex items-center justify-center">
              <Key
                className="h-12 w-12 relative z-10"
                strokeWidth={1.5}
                style={{ color: path.colors.primary }}
              />
            </div>
          ) : unlocked ? (
            <div className="relative flex flex-col items-center gap-2">
              {getPathIcon()}
            </div>
          ) : (
            <Clock
              className="h-12 w-12 text-neutral-400"
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>

      {/* Path Info */}
      <div className="text-center relative z-10">
        <h3 className="mb-1 text-xl font-bold text-neutral-900">
          {path.name}
        </h3>
        <p className="text-sm text-neutral-700">{path.subtitle}</p>
      </div>

      {/* Stats for Collected Paths */}
      {isCollected && stats ? (
        <div className="mt-4 space-y-3 relative z-10">
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-base font-semibold text-neutral-900">
              {stats.themedTitle}
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-neutral-700">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">{formatTime(stats.completionTime)}</span>
            </div>
            <div className="h-3 w-px bg-neutral-300" />
            <div className="flex items-center gap-1 text-neutral-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-medium">{stats.accuracy}%</span>
            </div>
          </div>
        </div>
      ) : (
        /* Status Badge for Uncollected/Locked Paths */
        <div className="mt-4 flex justify-center relative z-10">
          <div
            className={`
              inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg
              ${
                unlocked
                  ? 'bg-duolingo-green text-white'
                  : 'bg-neutral-200 text-neutral-600'
              }
            `}
          >
            {unlocked ? (
              <span>Start Quest →</span>
            ) : (
              <>
                <Clock className="h-3.5 w-3.5" />
                <span>{countdownText}</span>
              </>
            )}
          </div>
        </div>
      )}
    </button>
  );
};
