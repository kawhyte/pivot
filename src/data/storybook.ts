import { PATH_IDS } from '@/lib/paths';
import type { StorybookPage } from '@/types/storybook';

/**
 * Memory Storybook Content
 *
 * Tier Logic:
 * - Base tier (pages 1-8): Shown to all users who unlock the vault
 * - VIP tier (pages 9-12): Shown only to users who complete Sudden Death mode
 * - Developer messages: Tier-specific final messages
 *
 * Content Types:
 * - photo: Image with caption and optional sticker
 * - text: Body text only (for stories/narratives)
 * - video: Embedded video player
 * - message: Developer's final message
 */
export const STORYBOOK_PAGES: StorybookPage[] = [
  // === BASE TIER PAGES (1-8) ===

  {
    id: 'intro-text',
    tier: 'base',
    type: 'text',
    text: `Welcome to our journey together.\n\nEvery adventure has a beginning, and ours started with a simple conversation that turned into something extraordinary.\n\nThis is your story. Our story.`,
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: 'Heart',
  },

  {
    id: 'photo-1',
    tier: 'base',
    type: 'photo',
    imageUrl: '/storybook/memory-1.jpg',
    caption: 'The moment everything changed - our first adventure together',
    pathOrigin: PATH_IDS.RENAISSANCE,
    stickerIcon: 'Plane',
  },

  {
    id: 'photo-2',
    tier: 'base',
    type: 'photo',
    imageUrl: '/storybook/memory-2.jpg',
    caption: 'Coffee dates and endless conversations about our favorite shows',
    pathOrigin: PATH_IDS.POP_CULTURE,
    stickerIcon: 'Coffee',
  },

  {
    id: 'text-story-1',
    tier: 'base',
    type: 'text',
    text: `Remember that time we stayed up until 3 AM debating whether Ross and Rachel were really "on a break"?\n\nOr when we binge-watched all seven seasons of Gilmore Girls in two weeks?\n\nThose weren't just TV shows. They were our language, our inside jokes, our shared world.`,
    pathOrigin: PATH_IDS.POP_CULTURE,
    stickerIcon: 'Star',
  },

  {
    id: 'photo-3',
    tier: 'base',
    type: 'photo',
    imageUrl: '/storybook/memory-3.jpg',
    caption: 'Jetsetter life - exploring new places, creating new memories',
    pathOrigin: PATH_IDS.RENAISSANCE,
    stickerIcon: 'Sparkles',
  },

  {
    id: 'photo-4',
    tier: 'base',
    type: 'photo',
    imageUrl: '/storybook/memory-4.jpg',
    caption: 'The little moments that mean everything',
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: 'Camera',
  },

  {
    id: 'text-story-2',
    tier: 'base',
    type: 'text',
    text: `You are extraordinary.\n\nNot because of grand gestures or epic moments (though we've had plenty of those).\n\nBut because of the way you laugh at my terrible jokes, the way you remember every detail of our favorite episodes, the way you make every day an adventure.`,
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: 'Heart',
  },

  {
    id: 'photo-5',
    tier: 'base',
    type: 'photo',
    imageUrl: '/storybook/memory-5.jpg',
    caption: 'Building our story, one memory at a time',
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: 'Heart',
  },

  // === VIP TIER EXCLUSIVE PAGES (9-12) ===

  {
    id: 'vip-exclusive-1',
    tier: 'vip',
    type: 'text',
    text: `You didn't just complete the game.\n\nYou conquered EVERY challenge.\n\nYou risked it all in Sudden Death mode.\n\nYou proved once again that you're absolutely fearless.\n\nThis next chapter is just for you...`,
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: 'Trophy',
  },

  {
    id: 'vip-photo-1',
    tier: 'vip',
    type: 'photo',
    imageUrl: '/storybook/vip-memory-1.jpg',
    caption: 'This one is just for you - a moment only we understand',
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: 'Sparkles',
  },

  {
    id: 'vip-photo-2',
    tier: 'vip',
    type: 'photo',
    imageUrl: '/storybook/vip-memory-2.jpg',
    caption: 'Behind the scenes: crafting this adventure for you',
    pathOrigin: PATH_IDS.POP_CULTURE,
    stickerIcon: 'Star',
  },

  {
    id: 'vip-video-1',
    tier: 'vip',
    type: 'video',
    videoUrl: '/storybook/vip-message.mp4',
    caption: 'A special message for the VIP champion',
    pathOrigin: PATH_IDS.RENAISSANCE,
    stickerIcon: 'Trophy',
  },

  // === DEVELOPER MESSAGES (Final Pages) ===

  {
    id: 'message-base',
    tier: 'base',
    type: 'message',
    text: `Happy Birthday!

You just completed an adventure crafted with love. Every question, every photo, every memory was chosen because you are extraordinary.

This isn't just a gift—it's a love letter disguised as a game.

Thank you for being you. Thank you for every laugh, every adventure, every moment that made this worth creating.

With all my heart,
Kenny`,
  },

  {
    id: 'message-vip',
    tier: 'vip',
    type: 'message',
    text: `You absolute legend!

You didn't just complete the game—you conquered EVERY challenge, risked Sudden Death, and earned the VIP experience.

This final reward is yours because you're fearless, brilliant, and unstoppable.

Your birthday present awaits below...

With awe and admiration,
Kenny`,
  },
];

/**
 * Filter storybook pages by tier
 * @param hasVIPAccess - Whether user completed Sudden Death mode
 * @returns Filtered array of pages user can see
 */
export function getStorybookPages(hasVIPAccess: boolean): StorybookPage[] {
  if (hasVIPAccess) {
    // VIP users see all base pages + VIP exclusives
    return STORYBOOK_PAGES.filter(
      (page) => page.tier === 'base' || page.tier === 'vip'
    );
  } else {
    // Base users only see base tier pages
    return STORYBOOK_PAGES.filter((page) => page.tier === 'base');
  }
}
