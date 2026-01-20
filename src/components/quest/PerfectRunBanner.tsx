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
    <div className="bg-black/20 py-1">
      <div className={`
        ${isTester
          ? 'bg-gradient-to-r from-cyan-900 via-cyan-600 to-cyan-900'
          : 'bg-gradient-to-r from-red-900 via-red-600 to-red-900'
        }
        animate-pulse
        shadow-[0_0_15px_rgba(220,38,38,0.5)]
        px-4 py-3
      `}>
        <div className="flex items-center justify-center gap-3 text-xs sm:gap-4 sm:text-sm text-white">
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

          {/* HARDCORE WARNING */}
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-300" />
            <span className="font-black uppercase tracking-tighter text-white text-base sm:text-lg">
              ONE MISTAKE = END
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
