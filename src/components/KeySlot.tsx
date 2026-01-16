'use client';

import { Key, Clock, Sparkles, Tv, BookOpen, Heart as HeartIcon } from 'lucide-react';
import { PATH_METADATA, type PathId } from '@/lib/paths';
import type { PathStats } from '@/store/useQuestStore';
import { getCountdownText, isPathUnlocked, getDependencyName } from '@/lib/path-unlock';
import { formatTime } from '@/lib/themed-titles';
import { TARGET_SCORES, getTotalPuzzles } from '@/data/puzzles';

interface KeySlotProps {
  pathId: PathId;
  isCollected: boolean;
  onClick: () => void;
  stats?: PathStats;
  isTester?: boolean;
  // NEW: Progress data for started quizzes
  currentScore?: number;
  completedCount?: number;
  // NEW: Completion-based unlock system
  completedPathsData: Array<{ pathId: PathId; completedAt: string; nextPathUnlockAt?: string }>;
  pathNumber: number; // 1, 2, or 3 for Day badges
}

export const KeySlot = ({
  pathId,
  isCollected,
  onClick,
  stats,
  isTester = false,
  currentScore = 0,
  completedCount = 0,
  completedPathsData,
  pathNumber,
}: KeySlotProps) => {
  const path = PATH_METADATA[pathId];
  const unlocked = isPathUnlocked(pathId, completedPathsData, isTester);
  const countdownText = getCountdownText(pathId, completedPathsData, isTester);
  const dependencyName = getDependencyName(pathId);

  // GOD MODE: Testers can always click any path (even if collected) for testing
  const isClickable = isTester ? unlocked : (unlocked && !isCollected);

  // Calculate progress for started quizzes
  const targetScore = TARGET_SCORES[pathId];
  const totalPuzzles = getTotalPuzzles(pathId);
  const scoreProgress = Math.round((currentScore / targetScore) * 100);
  const hasStarted = completedCount > 0 && !isCollected;

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
      className={`relative w-full duo-card p-6 ${isClickable ? 'hover:shadow-lg cursor-pointer' : 'cursor-default'} ${!unlocked && !isTester ? 'opacity-60' : ''}`}
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

      {/* Day Number Badge */}
      <div className="absolute top-4 left-4 z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full border-2 border-neutral-300 shadow-sm">
          <span className="text-xs font-bold text-neutral-600">DAY</span>
          <span className="text-lg font-black" style={{ color: path.colors.primary }}>
            {pathNumber}
          </span>
        </div>
      </div>

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
          {/* GOD MODE: Show re-test button for collected paths */}
          {isTester && (
            <div className="flex justify-center mt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-500 text-white">
                <span>Re-Test Quest →</span>
              </div>
            </div>
          )}
        </div>
      ) : hasStarted ? (
        /* Progress for Started Quizzes */
        <div className="mt-4 space-y-3 relative z-10">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-semibold text-neutral-700">In Progress</span>
            <span className="text-sm font-bold" style={{ color: path.colors.primary }}>
              {scoreProgress}%
            </span>
          </div>
          <div className="relative h-3 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(scoreProgress, 100)}%`,
                background: `linear-gradient(90deg, ${path.colors.primary}, ${path.colors.secondary})`,
              }}
            />
          </div>
          <div className="text-center">
            <span className="text-xs text-neutral-600">
              {completedCount} / {totalPuzzles} questions completed
            </span>
          </div>
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-duolingo-green text-white">
              <span>Continue →</span>
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
