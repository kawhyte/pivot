import type { PathConfig } from '@/types/puzzle';
import { PATH_IDS } from '@/store/useQuestStore';

/**
 * Pop Culture Path - Friends & Gilmore Girls Themed Puzzles
 * Path ID: 1 (Central Perk Purple & Stars Hollow Yellow)
 */
export const popCulturePath: PathConfig = {
  pathId: PATH_IDS.POP_CULTURE,
  name: 'Pop Culture',
  puzzles: [
    {
      id: 'pop-1',
      type: 'multiple-choice',
      question: 'In Friends, what is the name of Ross&apos;s pet monkey?',
      options: ['Marcel', 'Maurice', 'Murphy', 'Max'],
      correctAnswer: 0,
      hint: 'It starts with "M" and is a French name.',
      successMessage: 'Correct! Marcel was Ross&apos;s mischievous monkey! 🐵',
      points: 10,
    },
    {
      id: 'pop-2',
      type: 'text-input',
      question: 'What coffee shop is the main hangout spot in Friends?',
      correctAnswer: 'Central Perk',
      acceptableAnswers: ['central perk', 'the central perk'],
      placeholder: 'Type the coffee shop name...',
      hint: 'It\'s where they sit on the famous orange couch.',
      successMessage: 'Yes! Central Perk - the heart of the show! ☕',
      points: 10,
    },
    {
      id: 'pop-3',
      type: 'multiple-choice',
      question: 'In Gilmore Girls, what is the name of Lorelai and Rory\'s favorite inn?',
      options: ['The Independence Inn', 'The Dragonfly Inn', 'Stars Hollow Inn', 'The Hartford Hotel'],
      correctAnswer: 0,
      hint: 'Lorelai worked there before starting her own inn.',
      successMessage: 'Perfect! The Independence Inn was where it all started! 🏨',
      points: 10,
    },
    {
      id: 'pop-4',
      type: 'text-input',
      question: 'What is the name of the quirky town where Gilmore Girls takes place?',
      correctAnswer: 'Stars Hollow',
      acceptableAnswers: ['stars hollow', 'Stars Hallow'],
      placeholder: 'Type the town name...',
      hint: 'It\'s full of colorful characters and town meetings.',
      successMessage: 'Correct! Stars Hollow - the most charming town in Connecticut! ⭐',
      points: 10,
    },
    {
      id: 'pop-5',
      type: 'multiple-choice',
      question: 'What was the name of Monica and Chandler\'s twins?',
      options: ['Emma and Ben', 'Jack and Erica', 'Ross and Rachel', 'Phoebe and Mike'],
      correctAnswer: 1,
      hint: 'They adopted them in the series finale.',
      successMessage: 'That\'s right! Jack and Erica Bing! 👶👶',
      points: 10,
    },
  ],
};
