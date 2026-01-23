'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { SparklesIcon } from '@/components/icons/SparklesIcon';
import { useState } from 'react';
import type { Coupon } from '@/types/puzzle';
import type { PathId } from '@/lib/paths';
import { PATH_METADATA } from '@/lib/paths';
import confetti from 'canvas-confetti';

interface BonusCouponProps {
  coupon: Coupon;
  pathId: PathId;
}

export const BonusCoupon = ({ coupon, pathId }: BonusCouponProps) => {
  const [copied, setCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const pathMeta = PATH_METADATA[pathId];

  const handleScratch = () => {
    if (isRevealed) return;

    const newProgress = Math.min(scratchProgress + 33, 100);
    setScratchProgress(newProgress);

    if (newProgress >= 100) {
      setIsRevealed(true);
      // Celebration confetti
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#10B981', '#FF6B6B'],
      });
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.6 }}
      className="my-8"
    >
      <div className="text-center mb-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        >
          <SparklesIcon className="mx-auto h-8 w-8 text-festive-gold mb-2" />
        </motion.div>
        <p className="text-lg font-display text-festive-brown">Perfect Run Bonus!</p>
        <p className="font-accent text-sm text-festive-brown/70 mt-1">You earned a special reward</p>
      </div>

      <motion.div
        onClick={handleScratch}
        className="group relative cursor-pointer"
        whileHover={{ scale: 1.02, rotate: 1 }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          className="hand-drawn-card border-4 border-festive-gold p-8 transition-all duration-500 relative overflow-hidden"
          style={{
            background: isRevealed
              ? 'linear-gradient(135deg, #FFE5D9, #FFF8F0)'
              : `linear-gradient(135deg, ${pathMeta.colors.primary}40, ${pathMeta.colors.secondary}40)`,
          }}
        >
          {/* Scratch-Off Overlay */}
          <AnimatePresence>
            {!isRevealed && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-festive-gold/90 via-festive-coral/80 to-festive-gold/90 backdrop-blur-sm"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 3, -3, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-center"
                >
                  <p className="text-2xl font-display text-white mb-3">Scratch to Reveal</p>
                  <p className="text-sm font-accent text-white/90">Tap 3 times</p>

                  {/* Scratch Progress Indicator */}
                  {scratchProgress > 0 && scratchProgress < 100 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-4 w-32 mx-auto"
                    >
                      <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-white"
                          initial={{ width: 0 }}
                          animate={{ width: `${scratchProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Scratch Marks Visual */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="scratch" patternUnits="userSpaceOnUse" width="60" height="60">
                      <path d="M 10,10 L 50,50 M 50,10 L 10,50" stroke="white" strokeWidth="8" strokeLinecap="round" opacity="0.3" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#scratch)" />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Revealed Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isRevealed ? 1 : 0 }}
            transition={{ delay: isRevealed ? 0.3 : 0 }}
            className="text-center relative z-10"
          >
            <motion.p
              initial={{ y: 20 }}
              animate={{ y: isRevealed ? 0 : 20 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-display text-festive-brown"
            >
              {coupon.title}
            </motion.p>
            <motion.p
              initial={{ y: 20 }}
              animate={{ y: isRevealed ? 0 : 20 }}
              transition={{ delay: 0.5 }}
              className="mt-4 font-accent text-lg text-festive-brown/80"
            >
              {coupon.description}
            </motion.p>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: isRevealed ? 0 : 20, opacity: isRevealed ? 1 : 0 }}
              transition={{ delay: 0.6 }}
              onClick={handleCopy}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hand-drawn mt-6 inline-flex items-center gap-2 bg-festive-coral px-6 py-3 font-semibold text-white hover:bg-festive-coral/90 transition-colors shadow-md"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Save Coupon
                </>
              )}
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: isRevealed ? 1 : 0 }}
              transition={{ delay: 0.7 }}
              className="mt-4 text-xs font-accent text-festive-brown/60"
            >
              Code: {coupon.id}
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
