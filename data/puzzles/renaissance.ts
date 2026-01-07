import type { PathConfig } from '@/types/puzzle';
import { PATH_IDS } from '@/store/useQuestStore';

/**
 * Renaissance Path - General Knowledge & Discovery
 * Path ID: 2 (Deep Emerald & Gold)
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
    {
      id: 'ren-2',
      type: 'text-input',
      question: 'What is the smallest planet in our solar system?',
      correctAnswer: 'Mercury',
      acceptableAnswers: ['mercury'],
      placeholder: 'Type the planet name...',
      hint: 'It&apos;s also the closest planet to the Sun.',
      successMessage: 'Yes! Mercury is the smallest planet! 🪐',
      points: 10,
    },
    {
      id: 'ren-3',
      type: 'multiple-choice',
      question: 'Which famous scientist developed the theory of relativity?',
      options: ['Isaac Newton', 'Albert Einstein', 'Nikola Tesla', 'Stephen Hawking'],
      correctAnswer: 1,
      hint: 'E=mc² is his most famous equation.',
      successMessage: 'Brilliant! Albert Einstein revolutionized physics! 🧪',
      points: 10,
    },
    {
      id: 'ren-4',
      type: 'text-input',
      question: 'What is the largest ocean on Earth?',
      correctAnswer: 'Pacific Ocean',
      acceptableAnswers: ['pacific', 'the pacific ocean', 'pacific ocean'],
      placeholder: 'Type the ocean name...',
      hint: 'It covers more than 30% of Earth&apos;s surface.',
      successMessage: 'Correct! The Pacific Ocean is the largest! 🌊',
      points: 10,
    },
    {
      id: 'ren-5',
      type: 'multiple-choice',
      question: 'Who wrote the play "Romeo and Juliet"?',
      options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
      correctAnswer: 1,
      hint: 'This English playwright is known as the Bard.',
      successMessage: 'Perfect! William Shakespeare wrote this timeless tragedy! 📚',
      points: 10,
    },
  ],
};
