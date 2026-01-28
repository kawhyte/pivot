'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull } from 'lucide-react';

interface SuddenDeathTransitionProps {
  show: boolean;
  onComplete: () => void;
}

export const SuddenDeathTransition = ({ show, onComplete }: SuddenDeathTransitionProps) => {
  useEffect(() => {
    if (show) {
      // Auto-complete transition after 2 seconds
      const timer = setTimeout(() => {
        onComplete();
      }, 4200);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
        >
          {/* Red Flash Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0, 1, 0] }}
            transition={{ duration: 0.5, times: [0, 0.2, 0.4, 0.6, 1] }}
            className="absolute inset-0 bg-red-600"
          />

          {/* CRT Glitch Filter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: [
                'contrast(100%) brightness(100%)',
                'contrast(150%) brightness(120%)',
                'contrast(100%) brightness(100%)',
              ],
            }}
            transition={{ duration: 0.8, times: [0, 0.5, 1] }}
            className="relative z-10 text-center"
            style={{
              textShadow: '0 0 20px rgba(220, 38, 38, 0.8), 0 0 40px rgba(220, 38, 38, 0.5)',
            }}
          >
            {/* Skull Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
              className="mb-6 flex justify-center"
            >
              <Skull className="h-24 w-24 text-red-500" strokeWidth={2} />
            </motion.div>

            {/* Text Reveal */}
            <motion.h1
              initial={{ opacity: 0, letterSpacing: '0.1em', scale: 0.8 }}
              animate={{
                opacity: 1,
                letterSpacing: '0.5em',
                scale: 1,
              }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-5xl sm:text-6xl font-black uppercase"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              SUDDEN DEATH
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mt-4 text-lg sm:text-xl font-bold text-red-300 uppercase tracking-wider"
            >
              Zero mistakes allowed for Legendary Status
            </motion.p>

            {/* Warning Lines */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="mx-auto mt-6 h-1 w-64 bg-gradient-to-r from-transparent via-red-500 to-transparent"
            />
          </motion.div>

          {/* Scan Lines Effect */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
