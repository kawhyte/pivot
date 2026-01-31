import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PATH_METADATA } from '@/lib/paths';
import type { StorybookPage } from '@/types/storybook';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { useQuestStore } from '@/store/useQuestStore';

// Sticker animation variants (spring bounce)
const stickerVariants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 15,
      delay: 0.4, // Delay after page content loads
    },
  },
};

interface StoryContentRendererProps {
  page: StorybookPage;
}

export function StoryContentRenderer({ page }: StoryContentRendererProps) {
  // Get path color for theming
  const getPathColor = () => {
    if (!page.pathOrigin) return '#000000';
    return PATH_METADATA[page.pathOrigin].colors.primary;
  };

  // Render based on content type
  switch (page.type) {
    case 'photo':
      return <PhotoContent page={page} pathColor={getPathColor()} />;
    case 'text':
      return <TextContent page={page} pathColor={getPathColor()} />;
    case 'video':
      return <VideoContent page={page} pathColor={getPathColor()} />;
    case 'message':
      return <MessageContent page={page} />;
    default:
      return null;
  }
}

// Photo content with skeleton loading
function PhotoContent({
  page,
  pathColor,
}: {
  page: StorybookPage;
  pathColor: string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Photo container with skeleton */}
      <div className="relative">
        <div
          className="relative aspect-[4/3] rounded-2xl overflow-hidden border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          style={{ borderColor: pathColor }}
        >
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-neutral-200 animate-pulse" />
          )}

          {/* Image */}
          <img
            src={page.imageUrl}
            alt={page.caption || 'Memory photo'}
            onLoad={() => setImageLoaded(true)}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-500',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            loading="lazy"
          />
        </div>

        {/* Sticker icon (animated) */}
        {page.stickerIcon && (
          <motion.div
            variants={stickerVariants}
            initial="hidden"
            animate="visible"
            className="absolute -top-4 -right-4 bg-white rounded-full p-3 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            style={{ backgroundColor: pathColor }}
          >
            <img
              src={page.stickerIcon}
              alt="sticker"
              className="h-8 w-8 brightness-0 invert"
            />
          </motion.div>
        )}
      </div>

      {/* Caption */}
      {page.caption && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-lg sm:text-xl text-neutral-700 font-medium px-4"
        >
          {page.caption}
        </motion.p>
      )}
    </div>
  );
}

// Text content (story/narrative)
function TextContent({
  page,
  pathColor,
}: {
  page: StorybookPage;
  pathColor: string;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="relative rounded-2xl border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 sm:p-12 bg-white"
        style={{ borderColor: pathColor }}
      >
        {/* Sticker icon */}
        {page.stickerIcon && (
          <motion.div
            variants={stickerVariants}
            initial="hidden"
            animate="visible"
            className="absolute -top-4 -right-4 bg-white rounded-full p-3 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            style={{ backgroundColor: pathColor }}
          >
            <img
              src={page.stickerIcon}
              alt="sticker"
              className="h-8 w-8 brightness-0 invert"
            />
          </motion.div>
        )}

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {page.text?.split('\n\n').map((paragraph, index) => (
            <p
              key={index}
              className="text-lg sm:text-xl text-neutral-800 leading-relaxed whitespace-pre-line"
            >
              {paragraph}
            </p>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Video content
function VideoContent({
  page,
  pathColor,
}: {
  page: StorybookPage;
  pathColor: string;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Video container */}
      <div className="relative">
        <div
          className="relative aspect-video rounded-2xl overflow-hidden border-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-black"
          style={{ borderColor: pathColor }}
        >
          <video
            src={page.videoUrl}
            controls
            className="w-full h-full"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Sticker icon */}
        {page.stickerIcon && (
          <motion.div
            variants={stickerVariants}
            initial="hidden"
            animate="visible"
            className="absolute -top-4 -right-4 bg-white rounded-full p-3 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            style={{ backgroundColor: pathColor }}
          >
            <img
              src={page.stickerIcon}
              alt="sticker"
              className="h-8 w-8 brightness-0 invert"
            />
          </motion.div>
        )}
      </div>

      {/* Caption */}
      {page.caption && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-lg sm:text-xl text-neutral-700 font-medium px-4"
        >
          {page.caption}
        </motion.p>
      )}
    </div>
  );
}

// Developer message (final page)
function MessageContent({ page }: { page: StorybookPage }) {
  const navigate = useNavigate();
  const { agentName } = useQuestStore();

  // Personalize message by replacing placeholders
  const personalizedText = page.text?.replace(/\[Name\]/g, agentName || 'You');

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 sm:p-12 bg-gradient-to-br from-white via-neutral-50 to-neutral-100"
      >
        {/* Message text with gradient */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 mb-8"
        >
          {personalizedText?.split('\n\n').map((paragraph, index) => (
            <p
              key={index}
              className={cn(
                'text-xl sm:text-2xl leading-relaxed whitespace-pre-line',
                index === 0
                  ? 'font-bold text-3xl sm:text-4xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent'
                  : 'text-neutral-800'
              )}
            >
              {paragraph}
            </p>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={() => navigate('/hub')}
            variant="doodle"
            size="lg"
            className="w-full gap-2 text-lg"
          >
            <Heart className="h-5 w-5" strokeWidth={2.5} />
            <span>Return to Vault</span>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
