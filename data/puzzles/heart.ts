import type { PathConfig } from '@/types/puzzle';
import { PATH_IDS } from '@/store/useQuestStore';

/**
 * Heart Path - Personal Memories & Our Story
 * Path ID: 3 (Soft Crimson & Rose)
 * TODO: Add personal memory puzzles in Phase 6
 */
export const heartPath: PathConfig = {
  pathId: PATH_IDS.HEART,
  name: 'Heart',
  puzzles: [
    {
      id: 'heart-1',
      type: 'text-input',
      question: 'Where did we have our first date?',
      correctAnswer: 'TODO: Add real answer',
      placeholder: 'Type the location...',
      hint: 'Think about that special evening...',
      successMessage: 'Yes! That was such a magical night! ❤️',
      points: 10,
    },
    // TODO: Add more personal memory puzzles
  ],
};
