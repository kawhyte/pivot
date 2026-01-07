/**
 * Puzzle Type Definitions
 * Supports multiple puzzle formats for the Birthday Quest
 */

export type PuzzleType = 'multiple-choice' | 'text-input' | 'image-reveal';

/**
 * Base puzzle interface - shared properties
 */
interface BasePuzzle {
  id: string;
  type: PuzzleType;
  question: string;
  hint?: string;
  successMessage: string;
  points?: number;
}

/**
 * Multiple Choice Puzzle
 * User selects one answer from 2-4 options
 */
export interface MultipleChoicePuzzle extends BasePuzzle {
  type: 'multiple-choice';
  options: string[];
  correctAnswer: number; // Index of correct option (0-based)
}

/**
 * Text Input Puzzle
 * User types an answer (case-insensitive matching)
 */
export interface TextInputPuzzle extends BasePuzzle {
  type: 'text-input';
  correctAnswer: string;
  acceptableAnswers?: string[]; // Alternative correct answers
  placeholder?: string;
}

/**
 * Image Reveal Puzzle
 * Shows an image and asks a question
 */
export interface ImageRevealPuzzle extends BasePuzzle {
  type: 'image-reveal';
  imageUrl: string;
  imageAlt: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
}

/**
 * Union type of all puzzle types
 */
export type Puzzle = MultipleChoicePuzzle | TextInputPuzzle | ImageRevealPuzzle;

/**
 * Path configuration with all puzzles
 */
export interface PathConfig {
  pathId: number;
  name: string;
  puzzles: Puzzle[];
}

/**
 * Answer validation result
 */
export interface ValidationResult {
  isCorrect: boolean;
  message: string;
  showHint?: boolean;
}
