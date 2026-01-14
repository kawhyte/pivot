'use client';

import { useEffect, useState } from 'react';
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
          icon: <Trophy className="h-5 w-5" />,
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
          icon: <Trophy className="h-5 w-5" />,
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
          icon: <Trophy className="h-5 w-5" />,
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

  useEffect(() => {
    const newStakes = getPathStakes(pathId, completionPercentage);
    setStakes(newStakes);
  }, [pathId, completionPercentage]);

  const availableStakes = stakes.filter((s) => s.isAvailable);

  return (
    <div className="flex items-center gap-3">
      {availableStakes.map((stake) => (
        <div key={stake.id} className="flex items-center gap-2">
          {/* Icon Badge */}
          <div
            className={`
              flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full
              ${
                stake.requirementMet
                  ? 'bg-warning-orange text-white'
                  : 'bg-neutral-200 text-neutral-400'
              }
            `}
            title={stake.title}
          >
            {stake.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
