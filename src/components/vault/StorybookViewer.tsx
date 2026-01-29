import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { StoryContentRenderer } from './StoryContentRenderer';
import { PATH_METADATA } from '@/lib/paths';
import { useQuestStore } from '@/store/useQuestStore';
import type { StorybookPage } from '@/types/storybook';

interface StorybookViewerProps {
  pages: StorybookPage[];
  isVIP: boolean;
}

// Page transition variants (slide and fade)
const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.5,
};

export function StorybookViewer({ pages, isVIP }: StorybookViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(0);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);
  const { keysCollected } = useQuestStore();

  const totalPages = pages.length;
  const currentPageData = pages[currentPage - 1];

  // Navigation handlers
  const handleNext = () => {
    if (currentPage < totalPages) {
      setDirection(1);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 1) {
      setDirection(-1);
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Keyboard navigation (arrow keys)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentPage < totalPages) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentPage > 1) {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages]);

  // Confetti celebration on final page
  useEffect(() => {
    if (currentPage === totalPages && !hasShownConfetti) {
      fireGrandFinaleConfetti();
      setHasShownConfetti(true);
    }
  }, [currentPage, totalPages, hasShownConfetti]);

  // Grand finale confetti (3-stage burst with path colors)
  const fireGrandFinaleConfetti = () => {
    const collectedColors = keysCollected.map(
      (pathId) => PATH_METADATA[pathId].colors.primary
    );

    // Stage 1: Center burst
    confetti({
      particleCount: 150,
      spread: 120,
      origin: { y: 0.5 },
      colors: collectedColors,
    });

    // Stage 2: Left side burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.7 },
        colors: collectedColors,
      });
    }, 300);

    // Stage 3: Right side burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.7 },
        colors: collectedColors,
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#fffdf5] flex flex-col">
      {/* Header with VIP badge and progress counter */}
      <div className="sticky top-0 z-50 bg-[#fffdf5] border-b-4 border-black px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* VIP Badge (if applicable) */}
          {isVIP && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-white" strokeWidth={2.5} />
                <span className="text-sm font-bold text-white">VIP ACCESS</span>
              </div>
            </motion.div>
          )}

          {/* Spacer for non-VIP */}
          {!isVIP && <div />}

          {/* Progress Counter */}
          <div className="font-mono text-sm text-neutral-500 tracking-wider">
            PAGE {currentPage.toString().padStart(2, '0')} /{' '}
            {totalPages.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="w-full"
          >
            <StoryContentRenderer page={currentPageData} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="sticky bottom-0 z-50 bg-[#fffdf5] border-t-4 border-black px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-4">
          {/* Back Button */}
          <Button
            onClick={handleBack}
            disabled={currentPage === 1}
            variant="doodle"
            size="lg"
            className="flex-1 gap-2"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            <span>Back</span>
          </Button>

          {/* Next Button */}
          <Button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            variant="doodle"
            size="lg"
            className="flex-1 gap-2"
          >
            <span>Next</span>
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}
