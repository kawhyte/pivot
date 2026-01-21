import type { PathId } from './paths';

export const FIRST_STRIKE_MESSAGES: Record<PathId, string[]> = {
  1: [
    "Oh no! Even Gunther wouldn't get that one wrong. Try again!",
    "Oy with the poodles already! Not quite right.",
    "Could that answer *be* any more incorrect? One more go!",
    "More coffee required! Try that again, Lorelai.",
    "Pivot! Your last answer didn't quite make it up the stairs.",
    "Wrong answer! No yellow umbrella for you this time."
  ],
  2: [
    "Alas! That answer belongs in the Dark Ages. One more go!",
    "A noble effort, but the stars are not yet aligned. Try again!",
    "Your quest continues! That wasn't the hidden truth we seek.",
    "Even Da Vinci had a few rough drafts. Give it another look!",
    "The parchment remains blank. Your wisdom is needed elsewhere."
  ],
  3: [
    "Close! But my heart remembers it a little differently...",
    "Almost! I think your memory is playing hide and seek.",
    "Nice try, Agent! Check your heart and try again.",
    "Nearly there! Give it one more thoughtful guess.",
    "Not quite, but I love where your head is at! Try again."
  ]
};

/**
 * Helper to get a random message based on the current path
 */
export const getRandomFeedback = (pathId: PathId): string => {
  const messages = FIRST_STRIKE_MESSAGES[pathId];
  return messages[Math.floor(Math.random() * messages.length)];
};
