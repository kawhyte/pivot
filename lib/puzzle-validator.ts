import type { Puzzle, ValidationResult } from '@/types/puzzle';

/**
 * Normalizes text for comparison (lowercase, trim, remove extra spaces)
 */
const normalizeText = (text: string): string => {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Calculates Levenshtein distance between two strings
 * Returns the minimum number of single-character edits needed
 */
const calculateLevenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];

  // Initialize first column and row
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Determines if two strings are similar based on edit distance thresholds
 */
const getAnswerSimilarity = (
  userAnswer: string,
  correctAnswer: string
): { status: 'correct' | 'close' | 'incorrect'; distance: number } => {
  const normalizedUser = normalizeText(userAnswer);
  const normalizedCorrect = normalizeText(correctAnswer);

  const distance = calculateLevenshteinDistance(normalizedUser, normalizedCorrect);

  // Exact match
  if (distance === 0) {
    return { status: 'correct', distance };
  }

  // Scaled threshold based on answer length
  const answerLength = normalizedCorrect.length;
  let threshold = 0;

  if (answerLength <= 3) {
    threshold = 1;
  } else if (answerLength <= 8) {
    threshold = 2;
  } else {
    threshold = 3;
  }

  // Close match
  if (distance <= threshold) {
    return { status: 'close', distance };
  }

  // Not close enough
  return { status: 'incorrect', distance };
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
    status: isCorrect ? 'correct' : 'incorrect',
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
  // Build list of all acceptable answers
  const allAcceptableAnswers = [
    puzzle.correctAnswer,
    ...(puzzle.acceptableAnswers || []),
  ];

  // Track best match across all acceptable answers
  let bestMatch: { status: 'correct' | 'close' | 'incorrect'; distance: number } = {
    status: 'incorrect',
    distance: Infinity,
  };

  for (const acceptableAnswer of allAcceptableAnswers) {
    const similarity = getAnswerSimilarity(userAnswer, acceptableAnswer);

    // If we find an exact match, return immediately
    if (similarity.status === 'correct') {
      return {
        isCorrect: true,
        status: 'correct',
        message: puzzle.successMessage,
        distance: 0,
      };
    }

    // Track the closest match
    if (similarity.distance < bestMatch.distance) {
      bestMatch = similarity;
    }
  }

  // Return result based on best match
  if (bestMatch.status === 'close') {
    return {
      isCorrect: false,
      status: 'close',
      message: 'Almost there! Check your spelling',
      showHint: false,
      distance: bestMatch.distance,
    };
  }

  return {
    isCorrect: false,
    status: 'incorrect',
    message: 'Not quite! Try again.',
    showHint: !!puzzle.hint,
    distance: bestMatch.distance,
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
