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
  stickerIcon?: string; // Lucide icon name (e.g., 'Heart', 'Star', 'Coffee', 'Plane')
}
