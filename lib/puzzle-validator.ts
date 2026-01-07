import type { Puzzle, ValidationResult } from '@/types/puzzle';

/**
 * Normalizes text for comparison (lowercase, trim, remove extra spaces)
 */
const normalizeText = (text: string): string => {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Validates a multiple choice answer
 */
const validateMultipleChoice = (
  puzzle: Extract<Puzzle, { type: 'multiple-choice' }>,
  userAnswer: number
): ValidationResult => {
  const isCorrect = userAnswer === puzzle.correctAnswer;

  return {
    isCorrect,
    message: isCorrect ? puzzle.successMessage : 'Not quite! Try again.',
    showHint: !isCorrect && !!puzzle.hint,
  };
};

/**
 * Validates a text input answer
 */
const validateTextInput = (
  puzzle: Extract<Puzzle, { type: 'text-input' | 'image-reveal' }>,
  userAnswer: string
): ValidationResult => {
  const normalizedUserAnswer = normalizeText(userAnswer);
  const normalizedCorrectAnswer = normalizeText(puzzle.correctAnswer);

  // Check main answer
  if (normalizedUserAnswer === normalizedCorrectAnswer) {
    return {
      isCorrect: true,
      message: puzzle.successMessage,
    };
  }

  // Check acceptable alternatives
  if (puzzle.acceptableAnswers) {
    const isAcceptable = puzzle.acceptableAnswers.some(
      (answer) => normalizeText(answer) === normalizedUserAnswer
    );

    if (isAcceptable) {
      return {
        isCorrect: true,
        message: puzzle.successMessage,
      };
    }
  }

  return {
    isCorrect: false,
    message: 'Not quite! Try again.',
    showHint: !!puzzle.hint,
  };
};

/**
 * Main validation function - routes to appropriate validator
 */
export const validateAnswer = (
  puzzle: Puzzle,
  userAnswer: string | number
): ValidationResult => {
  switch (puzzle.type) {
    case 'multiple-choice':
      return validateMultipleChoice(puzzle, userAnswer as number);

    case 'text-input':
    case 'image-reveal':
      return validateTextInput(puzzle, userAnswer as string);

    default:
      return {
        isCorrect: false,
        message: 'Unknown puzzle type',
      };
  }
};

/**
 * Checks if answer is empty/invalid before submission
 */
export const isValidSubmission = (userAnswer: string | number | null): boolean => {
  if (userAnswer === null || userAnswer === undefined) return false;
  if (typeof userAnswer === 'string' && userAnswer.trim() === '') return false;
  return true;
};
