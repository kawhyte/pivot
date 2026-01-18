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
  difficulty: 'easy' | 'medium' | 'hard';
  isReserved?: boolean; // Reserved for perfect run final streak (91%+ threshold)
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
  status: 'correct' | 'close' | 'incorrect';
  message: string;
  showHint?: boolean;
  distance?: number; // Edit distance for analytics/debugging
}

/**
 * Per-puzzle attempt data for granular stats tracking
 */
export interface PuzzleAttemptData {
  attempts: number;               // Total attempts on this puzzle
  totalTimeSpent: number;         // Milliseconds spent on this puzzle
  isFirstTry: boolean;            // Solved on first attempt?
  isCompleted: boolean;           // Successfully answered
  lastAttemptTime: number | null; // Timestamp of last attempt
}

/**
 * Path Progress - Non-linear navigation tracking
 * Replaces the linear "currentLevel" model
 */
export interface PathProgress {
  // Core progress tracking
  completedIds: string[];      // Puzzle IDs answered correctly
  skippedIds: string[];         // Puzzle IDs skipped (can return later)
  mistakes: number;             // Running mistake count (0.5 for close, 1.0 for wrong)
  startTime: number | null;     // Session start timestamp
  bestTime?: number;            // Personal best completion time

  // Per-puzzle tracking (NEW)
  puzzleAttempts: Record<string, PuzzleAttemptData>;

  // Perfect run state (NEW)
  isPerfectRunActive: boolean;
  perfectRunStartScore: number;
  perfectRunStartTime: number | null;
  perfectRunStreak: number;
  hasSeenThresholdModal: boolean;  // Prevent modal re-showing

  // Time tracking (NEW)
  totalTimeSpent: number;          // Milliseconds (paused time excluded)
  isPaused: boolean;
  lastResumeTime: number | null;
}

/**
 * Themed Bonus Coupon for perfect runs
 */
export interface Coupon {
  id: string;
  title: string;
  description: string;
  theme: string;                // e.g., "friends", "gilmore", "travel", "personal"
}
