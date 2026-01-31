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
    id: 'intro-2025',
    tier: 'base',
    type: 'text',
    text: `2025: A Journey of Strength and Heart.\n\nThis past year wasn't just about the days passing by; it was about the way you filled every single one of them with purpose, laughter, and adventure.\n\nThis is your story—the year you conquered everything.`,
    pathOrigin: PATH_IDS.HEART,
     stickerIcon: '/storybook/stickers/heart.svg',
  },

  {
    id: 'career-growth',
    tier: 'base',
    type: 'photo',
    imageUrl: '/storybook/work.jpg',
    caption: 'January: Kicking off the year by crushing it in your new job!',
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: '/storybook/stickers/sparkles.svg',
  },

  {
    id: 'the-planner',
    tier: 'base',
    type: 'text',
    text: `You are the master of the "Master Plan."\n\nWhether it was coordinating travel to NBA and WNBA arenas or finding the perfect hotels for every stop, your logistics game is unmatched.\n\nYou turn every idea into an incredible reality.`,
    pathOrigin: PATH_IDS.RENAISSANCE,
    stickerIcon: '/storybook/stickers/trophy.svg',
  },

  {
    id: 'arena-tour-photo',
    tier: 'base',
    type: 'photo',
    imageUrl: '/storybook/arena.jpg',
    caption: 'Court-side memories: Checking off arenas on our epic tour.',
    pathOrigin: PATH_IDS.POP_CULTURE,
    stickerIcon: '/storybook/stickers/star.svg',
  },

  {
    id: 'cruise-start',
    tier: 'base',
    type: 'photo',
    imageUrl: '/storybook/pore.jpg',
    caption: 'Setting sail from Singapore: The start of 15 nights on the Millennium.',
    pathOrigin: PATH_IDS.RENAISSANCE,
    stickerIcon: '/storybook/stickers/plane.svg',
  },

  {
    id: 'asia-adventures',
    tier: 'base',
    type: 'text',
    text: `From the bustling streets of Hong Kong and the beauty of Vietnam to the magic of Japan, you navigated us through it all.\n\nYou aren't just a traveler; you're a true explorer with a gift for finding the soul of every city.`,
    pathOrigin: PATH_IDS.RENAISSANCE,
    stickerIcon: '/storybook/stickers/plane.svg',
  },

  {
    id: 'asia-highlights-photo',
    tier: 'base',
    type: 'photo',
    imageUrl: '/storybook/kong.jpg',
    caption: 'Unforgettable views and even better company in Asia.',
    pathOrigin: PATH_IDS.RENAISSANCE,
    stickerIcon: '/storybook/stickers/sparkles.svg',
  },

  {
    id: 'weightlifting-power',
    tier: 'base',
    type: 'photo',
    imageUrl: '/storybook/lift.png',
    caption: 'Powerhouse: Reaching new heights in your weightlifting journey.',
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: '/storybook/stickers/trophy.svg',
  },

  {
    id: 'fitness-inspiration',
    tier: 'base',
    type: 'text',
    text: `It's not just the personal records you set.\n\nIt's the way you push me to be better every time we hit the gym. Whether it's perfecting your form or running that 5k, your discipline is a constant inspiration.`,
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: '/storybook/stickers/heart.svg',
  },

  {
    id: 'community-heart-photo',
    tier: 'base',
    type: 'photo',
    imageUrl: '/storybook/pull.png',
    caption: 'Pulling for Little Heroes: Showing your strength for a great cause.',
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: '/storybook/stickers/heart.svg',
  },

  {
    id: 'volunteering-story',
    tier: 'base',
    type: 'text',
    text: `Your heart is as big as your lift.\n\nVolunteering for the kids with cancer fundraiser showed everyone what I already knew: you lead with kindness and use your strength to lift others up.`,
    pathOrigin: PATH_IDS.HEART,
        stickerIcon: '/storybook/stickers/sparkles.svg',
  },

  {
    id: 'yardie-ev-photo',
    tier: 'base',
    type: 'photo',
    imageUrl: '/storybook/ev.jpg',
    caption: 'Meet "Yardie"! Your brand new EV and our favorite ride.',
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: '/storybook/stickers/heart.svg',
  },

  // === VIP TIER EXCLUSIVE PAGES (13-18) ===

  {
    id: 'vip-exclusive-intro',
    tier: 'vip',
    type: 'text',
    text: `You didn't just play the game; you dominated it.\n\nYou faced Sudden Death and came out a champion—just like you did every single day of 2025.\n\nThese final pages are for the VIP only...`,
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: '/storybook/stickers/trophy.svg',
  },

  {
    id: 'jamaica-trip-photo',
    tier: 'vip',
    type: 'photo',
    imageUrl: '/storybook/jam.jpg',
    caption: 'Jamaica: The most meaningful birthday trip to see family.',
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: '/storybook/stickers/heart.svg',
  },

  {
    id: 'special-memory-photo',
    tier: 'vip',
    type: 'photo',
    imageUrl: '/storybook/duo.png',
    caption: 'A moment just for us—the quiet magic of 2025.',
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: '/storybook/stickers/heart.svg',
  },

  {
    id: 'bts-crafting-app',
    tier: 'vip',
    type: 'photo',
    imageUrl: '/storybook/bts.png', // Keep the BTS aspect
    caption: 'Behind the scenes: Secretly building this for my favorite person. You had no idea this was going on, did you?',
    pathOrigin: PATH_IDS.POP_CULTURE,
    stickerIcon: '/storybook/stickers/camera.svg',
  },

  {
    id: 'vip-video-message',
    tier: 'vip',
    type: 'video',
    videoUrl: '/storybook/vip-message.mp4',
    caption: 'A special birthday message for the legend herself.',
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: '/storybook/stickers/heart.svg',
  },

  {
    id: 'final-vip-text',
    tier: 'vip',
    type: 'text',
    text: `You are unstoppable, brilliant, and beautiful.\n\n2025 was incredible because of you. I can't wait to see what we conquer in 2026.\n\nHappy Birthday, my love!`,
    pathOrigin: PATH_IDS.HEART,
    stickerIcon: '/storybook/stickers/heart.svg',
  },

  // === DEVELOPER MESSAGES ===

  {
    id: 'message-base',
    tier: 'base',
    type: 'message',
    text: `Happy Birthday!

Every page of this adventure was crafted to celebrate the amazing woman you are. From your new job to your heart for the community, you've made 2025 a year for the history books.

Thank you for every adventure.

With all my heart,
Allalu`,
  },

//   {
//     id: 'message-vip',
//     tier: 'vip',
//     type: 'message',
//     text: `You Absolute Legend!

// You conquered the puzzles, survived Sudden Death, and proved once again that you're in a league of your own.

// Your birthday present awaits below...

// With awe and admiration,
// Kenny`,
//   },
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
