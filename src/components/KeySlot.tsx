'use client';

import { Clock, Trophy } from 'lucide-react';
import { PATH_METADATA, type PathId } from '@/lib/paths';
import type { PathStats } from '@/store/useQuestStore';
import { getCountdownText, isPathUnlocked } from '@/lib/path-unlock';
import { formatTime } from '@/lib/themed-titles';
import { TARGET_SCORES, getTotalPuzzles } from '@/data/puzzles';
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

  // Allow clicking on collected paths to view Hall of Fame
  const isClickable = isTester ? true : (unlocked && !isCollected) || (isCollected);

  const targetScore = TARGET_SCORES[pathId];
  const totalPuzzles = getTotalPuzzles(pathId);
  const scoreProgress = Math.round((currentScore / targetScore) * 100);
  const hasStarted = completedCount > 0 && !isCollected;

  const getPathIcon = () => {
    switch (pathId) {
      case 1:
        return <img src='/images/cup.png' alt="Pop Culture" className="max-h-12" />;
      case 2:
        return <img src='/images/green-shape.png' alt="Renaissance" className="max-h-12" />;
      case 3:
        return <img className="max-h-12" src='/images/heart.svg' alt="Heart" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "relative w-full duo-card p-6 transition-all text-left",
        isClickable ? 'hover:shadow-lg cursor-pointer' : 'cursor-default',
        !unlocked && !isTester ? 'opacity-60' : '',
        isCollected ? 'border-amber-400 bg-amber-50/30' : ''
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
        <Badge
          variant={isCollected ? "default" : "outline"}
          className={isCollected ? "bg-amber-500" : ""}
        >
          {isCollected ? <Trophy className="h-3 w-3" /> : pathNumber}
        </Badge>
      </div>

      {/* Icon Section */}
      <div className="mb-4 flex items-center justify-center relative">
        <div className="relative z-10">
          {isCollected ? (
            <Trophy className="h-12 w-12 text-amber-500 animate-bounce" />
          ) : unlocked ? (
            <div className="relative flex flex-col items-center gap-2">
              {getPathIcon()}
            </div>
          ) : (
            <Clock className="h-12 w-12 text-neutral-400" strokeWidth={1.5} />
          )}
        </div>
      </div>

      {/* Path Info */}
      <div className="text-center relative z-10">
        <h3 className="mb-1 text-2xl font-bold text-neutral-900">{path.name}</h3>
        <p className="text-lg text-neutral-700">{path.subtitle}</p>
      </div>

      {/* PRIORITY 1: Mastered State (when isCollected is true) */}
      {isCollected && stats ? (
        <div className="mt-4 space-y-2 text-center bg-white/60 p-3 rounded-xl border border-amber-200 relative z-10">
          <p className="text-sm font-black text-amber-600 uppercase tracking-widest">Mastered</p>
          <p className="font-bold text-neutral-800">{stats.themedTitle || "The One with the Victory!"}</p>
          <div className="flex justify-center gap-4 text-xs font-bold text-neutral-500">
            <span>⏱️ {formatTime(stats.completionTime)}</span>
            <span>🎯 {stats.accuracy}%</span>
          </div>
          <div className="mt-2 inline-flex items-center gap-2 px-4 py-1 text-sm font-bold rounded-lg bg-amber-500 text-white">
            View Hall of Fame →
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
            className="h-3 bg-neutral-200"
            indicatorClassName="transition-all duration-500 rounded-full"
            indicatorStyle={{
              background: `linear-gradient(90deg, ${path.colors.primary}, ${path.colors.secondary})`,
            }}
          />
          <div className="text-center">
            <span className="text-base text-neutral-600">
              {completedCount} / {totalPuzzles} questions completed
            </span>
          </div>
          <div className="flex justify-center">
            <div className={cn(
              "inline-flex items-center justify-center gap-2 px-4 py-2 text-base font-semibold rounded-lg transition-all",
              "bg-duolingo-green text-white hover:bg-duolingo-green/90"
            )}>
              Continue →
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex justify-center relative z-10">
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg",
            unlocked ? 'bg-duolingo-green text-white' : 'bg-neutral-200 text-neutral-600'
          )}>
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
