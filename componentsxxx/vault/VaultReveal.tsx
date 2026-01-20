'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Gift, Sparkles, Heart, PartyPopper } from 'lucide-react';

interface VaultRevealProps {
  onComplete?: () => void;
}

export const VaultReveal = ({ onComplete }: VaultRevealProps) => {
  const [stage, setStage] = useState<'unlocking' | 'opening' | 'revealing' | 'complete'>('unlocking');

  // Multi-stage confetti celebration
  const fireConfettiSequence = () => {
    // Stage 1: Initial burst
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#fbbf24', '#065f46', '#d4af37', '#be123c', '#fb7185'],
    });

    // Stage 2: Left side burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.7 },
        colors: ['#6366f1', '#fbbf24', '#065f46', '#d4af37', '#be123c', '#fb7185'],
      });
    }, 300);

    // Stage 3: Right side burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.7 },
        colors: ['#6366f1', '#fbbf24', '#065f46', '#d4af37', '#be123c', '#fb7185'],
      });
    }, 600);

    // Stage 4: Continuous stars
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    setTimeout(() => frame(), 1000);
  };

  useEffect(() => {
    // Stage progression
    const timer1 = setTimeout(() => {
      setStage('opening');
      fireConfettiSequence();
    }, 1500);

    const timer2 = setTimeout(() => {
      setStage('revealing');
    }, 4000);

    const timer3 = setTimeout(() => {
      setStage('complete');
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 px-6">
      <AnimatePresence mode="wait">
        {/* Stage 1: Unlocking */}
        {stage === 'unlocking' && (
          <motion.div
            key="unlocking"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="mb-8 flex justify-center"
            >
              <div className="relative">
                <Gift className="h-32 w-32 text-amber-400" strokeWidth={1.5} />
                <motion.div
                  className="absolute inset-0 rounded-full bg-amber-400/20"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </div>
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Unlocking the Vault...
            </h1>
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-3 w-3 rounded-full bg-amber-400"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Stage 2: Opening */}
        {stage === 'opening' && (
          <motion.div
            key="opening"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="text-center"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="mb-8 flex justify-center"
            >
              <Sparkles className="h-32 w-32 text-yellow-400" strokeWidth={1.5} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500"
            >
              The Vault Opens!
            </motion.h1>
          </motion.div>
        )}

        {/* Stage 3: Revealing */}
        {stage === 'revealing' && (
          <motion.div
            key="revealing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center max-w-2xl"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="mb-8 flex justify-center"
            >
              <Heart className="h-32 w-32 text-pink-500" strokeWidth={1.5} fill="currentColor" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-white mb-6"
            >
              Your Birthday Surprise...
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-zinc-300"
            >
              Something special is waiting for you!
            </motion.p>
          </motion.div>
        )}

        {/* Stage 4: Complete - Ready for final reveal */}
        {stage === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-3xl"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="mb-8 flex justify-center"
            >
              <PartyPopper className="h-32 w-32 text-purple-500" strokeWidth={1.5} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-6"
            >
              Happy Birthday! 🎉
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20"
            >
              <p className="text-2xl text-white mb-4 leading-relaxed">
                You&apos;ve completed all three paths and collected every key!
              </p>
              <p className="text-xl text-zinc-300 mb-6">
                This journey through pop culture, knowledge, and our precious memories
                was designed to celebrate the incredible person you are.
              </p>
              <div className="flex justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎬</div>
                  <p className="text-sm text-zinc-400">Pop Culture</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🎨</div>
                  <p className="text-sm text-zinc-400">Renaissance</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">❤️</div>
                  <p className="text-sm text-zinc-400">Heart</p>
                </div>
              </div>
              <p className="text-lg text-white font-medium">
                🎁 Your real gift is waiting for you... ✨
              </p>
            </motion.div>

            {onComplete && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={onComplete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 px-12 py-4 text-xl font-bold text-white shadow-2xl"
              >
                Reveal My Gift
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
