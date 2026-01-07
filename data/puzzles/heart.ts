import type { PathConfig } from '@/types/puzzle';
import { PATH_IDS } from '@/store/useQuestStore';

/**
 * Heart Path - Personal Memories & Our Story
 * Path ID: 3 (Soft Crimson & Rose)
 *
 * 🎁 CUSTOMIZE THESE PUZZLES WITH YOUR REAL MEMORIES! 🎁
 * Replace the placeholder answers and questions with actual details from your relationship.
 * Make them meaningful, romantic, and specific to your love story!
 */
export const heartPath: PathConfig = {
  pathId: PATH_IDS.HEART,
  name: 'Heart',
  puzzles: [
    {
      id: 'heart-1',
      type: 'text-input',
      question: 'Where did we have our first date?',
      // TODO: Replace with actual location (e.g., "Central Park", "Olive Garden", "The Coffee Shop")
      correctAnswer: 'The Coffee House',
      acceptableAnswers: ['coffee house', 'the coffee shop'],
      placeholder: 'Type the place name...',
      hint: 'Remember that cozy spot where we talked for hours?',
      successMessage: 'Yes! That was such a magical evening! I knew you were special from that first moment. ❤️',
      points: 10,
    },
    {
      id: 'heart-2',
      type: 'multiple-choice',
      question: 'What song was playing during our first dance?',
      // TODO: Replace with your actual song options and correct answer
      options: [
        'Perfect by Ed Sheeran',
        'At Last by Etta James',
        'Thinking Out Loud by Ed Sheeran',
        'All of Me by John Legend'
      ],
      correctAnswer: 1, // TODO: Update index (0-3) for correct song
      hint: 'It was that classic romantic song we both love.',
      successMessage: 'Perfect! That moment was absolutely beautiful! 💃',
      points: 10,
    },
    {
      id: 'heart-3',
      type: 'text-input',
      question: 'What&apos;s my special nickname for you?',
      // TODO: Replace with actual pet name/nickname
      correctAnswer: 'Sweetheart',
      acceptableAnswers: ['sweet heart', 'sweetie'],
      placeholder: 'Type the nickname...',
      hint: 'It&apos;s what I call you every morning.',
      successMessage: 'That&apos;s right, my dear! You&apos;re everything to me! 💕',
      points: 10,
    },
    {
      id: 'heart-4',
      type: 'multiple-choice',
      question: 'In which month did we get engaged?',
      // TODO: Replace with your actual engagement month
      options: ['June', 'September', 'December', 'February'],
      correctAnswer: 2, // TODO: Update index for correct month
      hint: 'It was during the holiday season.',
      successMessage: 'Yes! The happiest day when you said yes! 💍',
      points: 10,
    },
    {
      id: 'heart-5',
      type: 'text-input',
      question: 'What&apos;s our special place we always go back to?',
      // TODO: Replace with your meaningful location
      correctAnswer: 'The Beach',
      acceptableAnswers: ['beach', 'the beach', 'our beach'],
      placeholder: 'Type the location...',
      hint: 'We always say we need to visit more often.',
      successMessage: 'Perfect! That place holds so many beautiful memories for us! 🌅',
      points: 10,
    },
  ],
};
