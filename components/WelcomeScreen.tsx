'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useQuestStore } from '@/store/useQuestStore';

interface WelcomeScreenProps {
  onComplete?: () => void;
  isRevisit?: boolean;
}

export const WelcomeScreen = ({ onComplete, isRevisit = false }: WelcomeScreenProps) => {
  const setHasSeenIntro = useQuestStore((state) => state.setHasSeenIntro);

  const handleBegin = () => {
    if (isRevisit && onComplete) {
      onComplete();
    } else {
      setHasSeenIntro(true);
    }
  };

  // Container animation variants for staggering children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  // Child animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 via-purple-50/20 to-zinc-100 px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        {/* Glassmorphism Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/80 p-8 shadow-xl backdrop-blur-sm"
        >
          {/* Animated Icon */}
          <motion.div
            variants={itemVariants}
            className="mb-6 flex justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
              className="relative"
            >
              <Sparkles className="h-16 w-16 text-purple-500" strokeWidth={1.5} />
              <motion.div
                className="absolute inset-0 rounded-full bg-purple-400/20"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={itemVariants}
            className="mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent"
          >
            The Master Key Quest
          </motion.h1>

          {/* Body Text */}
          <motion.p
            variants={itemVariants}
            className="mb-8 text-center text-base leading-relaxed text-zinc-700"
          >
            Welcome to your Birthday Adventure! I&apos;ve locked your surprise in a digital vault. To open it, you must find three hidden keys.
            <br />
            <br />
            One new path will reveal itself each morning over the next three days. Solve the puzzles, collect the keys, and claim your prize!
          </motion.p>

          {/* CTA Button */}
          <motion.button
            variants={itemVariants}
            onClick={handleBegin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-shadow hover:shadow-xl"
          >
            {isRevisit ? 'Back to Vault' : 'Begin the Adventure'}
          </motion.button>
        </motion.div>

        {/* Subtle footer note */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-center text-xs text-zinc-500"
        >
          Made with love 💝
        </motion.p>
      </motion.div>
    </div>
  );
};
