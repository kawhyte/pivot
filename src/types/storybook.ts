import type { PathId } from '@/lib/paths';

export type StorybookTier = 'base' | 'vip';

export type StorybookContentType = 'photo' | 'text' | 'video' | 'message';

export interface StorybookPage {
  id: string;
  tier: StorybookTier;
  type: StorybookContentType;

  // Content fields (nullable based on type)
  imageUrl?: string;
  caption?: string;
  text?: string;
  videoUrl?: string;

  // Theming
  pathOrigin?: PathId; // For path-specific border colors
  stickerIcon?: string; // SVG file path from /public/storybook/stickers/ (e.g., '/storybook/stickers/heart.svg')
}
