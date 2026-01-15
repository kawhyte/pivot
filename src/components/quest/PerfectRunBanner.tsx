'use client';

import { useEffect, useState } from 'react';
import { Trophy, Flame, AlertTriangle } from 'lucide-react';

interface PerfectRunBannerProps {
  streak: number;
  remainingPuzzles: number;
  pathId: number;
  isTester?: boolean;
}

export const PerfectRunBanner = ({
  streak,
  remainingPuzzles,
  isTester = false,
}: PerfectRunBannerProps) => {
  const [prevStreak, setPrevStreak] = useState(streak);

  // Trigger pulse animation on streak increment
  useEffect(() => {
    if (streak > prevStreak) {
      // Streak increased, trigger pulse
      setPrevStreak(streak);
    }
  }, [streak, prevStreak]);

  const shouldPulse = streak !== prevStreak;

  return (
    <div className={`duo-perfect-run-banner ${isTester ? 'bg-cyan-600' : ''}`}>
      <div className="flex items-center justify-center gap-3 text-xs sm:gap-4 sm:text-sm">
        {/* Trophy Icon */}
        <div className="flex items-center gap-1.5">
          <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-extrabold uppercase tracking-wide">Perfect Run</span>
        </div>

        {/* Divider */}
        <span className="text-white/60">•</span>

        {/* Streak Counter with Pulse Animation */}
        <div className={`flex items-center gap-1.5 ${shouldPulse ? 'duo-streak-pulse' : ''}`}>
          <Flame className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-bold">
            Streak: <span className="text-yellow-300">{streak}</span>
          </span>
        </div>

        {/* Divider */}
        <span className="text-white/60">•</span>

        {/* Remaining Puzzles */}
        <div className="flex items-center gap-1.5">
          <span className="font-medium">
            Remaining: <span className="font-bold">{remainingPuzzles}</span>
          </span>
        </div>

        {/* Divider */}
        <span className="text-white/60">•</span>

        {/* Warning */}
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-4 w-4 text-red-400 sm:h-5 sm:w-5" />
          <span className="font-bold uppercase tracking-wide text-red-100">
            One Mistake = End
          </span>
        </div>
      </div>
    </div>
  );
};
