# Memory Storybook Assets

This directory contains all media assets for the Memory Storybook feature.

## Directory Structure

```
storybook/
├── base/           # Assets for base tier (all users)
│   ├── memory-1.jpg
│   ├── memory-2.jpg
│   ├── memory-3.jpg
│   ├── memory-4.jpg
│   └── memory-5.jpg
│
└── vip/            # Assets for VIP tier (Sudden Death completers)
    ├── vip-memory-1.jpg
    ├── vip-memory-2.jpg
    └── vip-message.mp4
```

## Image Specifications

### Photos
- **Format**: WebP (preferred) or JPEG
- **Max Width**: 1200px
- **Quality**: 85%
- **Aspect Ratio**: 4:3 (recommended for consistency)
- **File Size**: Under 500KB per image

### Videos
- **Format**: MP4 (H.264)
- **Max Resolution**: 720p
- **File Size**: Under 10MB
- **Duration**: Keep under 2 minutes for best UX

## Optimization Tips

1. **Compress images** before adding them:
   - Use tools like TinyPNG, Squoosh, or ImageOptim
   - Convert to WebP for ~30% smaller file sizes

2. **Compress videos** before adding them:
   - Use HandBrake or FFmpeg
   - Target bitrate: 1-2 Mbps for 720p

3. **Test on mobile**:
   - Images should load within 2 seconds on 4G
   - Videos should stream smoothly

## Adding New Content

To add new memory pages, edit `/src/data/storybook.ts` and reference the new image URLs:

```typescript
{
  id: 'new-photo',
  tier: 'base',
  type: 'photo',
  imageUrl: '/storybook/base/new-memory.jpg',
  caption: 'A new memory caption',
  pathOrigin: PATH_IDS.HEART,
  stickerIcon: 'Heart',
}
```

## Current Placeholder Images

The current data file references these images (placeholders):
- `/storybook/memory-1.jpg` → `/storybook/base/memory-1.jpg`
- `/storybook/memory-2.jpg` → `/storybook/base/memory-2.jpg`
- `/storybook/memory-3.jpg` → `/storybook/base/memory-3.jpg`
- `/storybook/memory-4.jpg` → `/storybook/base/memory-4.jpg`
- `/storybook/memory-5.jpg` → `/storybook/base/memory-5.jpg`
- `/storybook/vip-memory-1.jpg` → `/storybook/vip/vip-memory-1.jpg`
- `/storybook/vip-memory-2.jpg` → `/storybook/vip/vip-memory-2.jpg`
- `/storybook/vip-message.mp4` → `/storybook/vip/vip-message.mp4`

**TODO**: Replace placeholder paths in `/src/data/storybook.ts` with actual file paths once you add your photos/videos.
