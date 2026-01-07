import type { PathConfig } from '@/types/puzzle';
import { PATH_IDS } from '@/store/useQuestStore';

/**
 * Renaissance Path - General Knowledge Puzzles
 * Path ID: 2 (Deep Emerald & Gold)
 * TODO: Add Renaissance-themed puzzles in Phase 5
 */
export const renaissancePath: PathConfig = {
  pathId: PATH_IDS.RENAISSANCE,
  name: 'Renaissance',
  puzzles: [
    {
      id: 'ren-1',
      type: 'multiple-choice',
      question: 'Who painted the Mona Lisa?',
      options: ['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Donatello'],
      correctAnswer: 1,
      hint: 'He was also an inventor and scientist.',
      successMessage: 'Correct! Leonardo da Vinci created this masterpiece! 🎨',
      points: 10,
    },
    // TODO: Add more Renaissance puzzles
  ],
};
