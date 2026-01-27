'use client';

import { Clock } from 'lucide-react';
import { PATH_METADATA, type PathId } from '@/lib/paths';
import { KeyIcon } from '@/components/icons/KeyIcon';
import { SparklesIcon } from '@/components/icons/SparklesIcon';
import type { PathStats } from '@/store/useQuestStore';
import { getCountdownText, isPathUnlocked } from '@/lib/path-unlock';
import { formatTime } from '@/lib/themed-titles';
import { TARGET_SCORES, getTotalPuzzles, getTotalNonBonusPuzzles } from '@/data/puzzles';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { cn } from '@/lib/utils';

interface KeySlotProps {
  pathId: PathId;
  isCollected: boolean;
  onClick: () => void;
  stats?: PathStats;
  isTester?: boolean;
  currentScore?: number;
  completedCount?: number;
  completedPathsData: Array<{ pathId: PathId; completedAt: string; nextPathUnlockAt?: string }>;
  pathNumber: number;
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

  // Clickable if unlocked AND not collected (unless tester)
  // We keep it clickable if collected to view stats/hall of fame
  const isClickable = isTester ? unlocked : (unlocked);

  const targetScore = TARGET_SCORES[pathId];
  const totalPuzzles = getTotalPuzzles(pathId);
  const totalNonBonus = getTotalNonBonusPuzzles(pathId);
  const scoreProgress = Math.round((completedCount / totalNonBonus) * 100);
  const hasStarted = completedCount > 0 && !isCollected;

  const getPathIcon = () => {
    switch (pathId) {
      case 1:
        return <img src='/images/cup.png' alt="Pop Culture" />;
      case 2:
        return <img src='/images/green-shape.png' alt="Renaissance" />;
      case 3:
        return <img className="h-20 w-20" src='/images/heart.svg' alt="Heart" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "relative w-full duo-card p-6 transition-all",
        isClickable ? 'hover:shadow-lg cursor-pointer' : 'cursor-default',
        !unlocked && !isTester ? 'opacity-60' : ''
      )}
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
        <Badge variant={isCollected ? 'default' : 'outline'}>{isCollected ? '🏆' : pathNumber}</Badge>
      </div>

      {/* Icon Section */}
      <div className="mb-4 flex items-center justify-center relative">
        <div className="relative z-10">
          {isCollected ? (
            <div className="relative flex items-center justify-center">
              <KeyIcon
                className="h-16 w-16 rotate-90 relative z-10"
                color={path.colors.primary}
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
        <h3 className="mb-1 text-2xl font-bold text-neutral-900">
          {path.name}
        </h3>
        <p className="text-lg text-neutral-700">{path.subtitle}</p>
      </div>

      {/* TERMINAL STATE: Stats for Collected Paths */}
      {isCollected ? (
        <div className="mt-4 space-y-3 relative z-10">
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-lg font-semibold text-neutral-900">
              {stats?.themedTitle || "Path Completed!"}
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 text-lg">
            <div className="flex items-center gap-1 text-neutral-700">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">{stats ? formatTime(stats.completionTime) : "--"}</span>
            </div>
            <div className="h-3 w-px bg-neutral-300" />
            <div className="flex items-center gap-1 text-neutral-700">
              <SparklesIcon className="h-3.5 w-3.5" />
              <span className="font-medium">{stats?.accuracy || 100}%</span>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 text-base font-semibold rounded-lg bg-celebration-gold text-white">
              <span>View Stats →</span>
            </div>
          </div>
        </div>
      ) : hasStarted ? (
        <div className="mt-4 space-y-3 relative z-10">
          <div className="flex items-center justify-between px-2">
            <span className="text-base font-semibold text-neutral-700">In Progress</span>
            <span className="text-base font-bold" style={{ color: path.colors.primary }}>
              {scoreProgress}%
            </span>
          </div>
          <Progress
            value={Math.min(scoreProgress, 100)}
            className="h-3"
          />
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 text-base font-semibold rounded-lg bg-duolingo-green text-white">
              Continue →
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex justify-center relative z-10">
          <div
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg",
              unlocked
                ? 'bg-duolingo-green text-white'
                : 'bg-neutral-200 text-neutral-600'
            )}
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
