'use client';

import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { Coupon } from '@/types/puzzle';
import type { PathId } from '@/store/useQuestStore';
import { PATH_METADATA } from '@/store/useQuestStore';

interface BonusCouponProps {
  coupon: Coupon;
  pathId: PathId;
}

export const BonusCoupon = ({ coupon, pathId }: BonusCouponProps) => {
  const [copied, setCopied] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const pathMeta = PATH_METADATA[pathId];

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
        <p className="text-sm font-semibold text-emerald-700">Perfect Run Bonus!</p>
        <p className="text-xs text-emerald-600 mt-1">You earned a special reward</p>
      </div>

      <motion.div
        onClick={() => setIsRevealed(!isRevealed)}
        className="group relative cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          className="rounded-2xl border-2 border-emerald-300 p-6 transition-all duration-500"
          style={{
            background: isRevealed
              ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))'
              : `linear-gradient(135deg, ${pathMeta.colors.primary}20, ${pathMeta.colors.secondary}20)`,
          }}
        >
          {!isRevealed && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isRevealed ? 0 : 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-2"
            >
              <p className="text-sm font-medium text-zinc-600">Tap to reveal your bonus</p>
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-2"
              >
                <div className="inline-block px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                  Click to Unwrap
                </div>
              </motion.div>
            </motion.div>
          )}

          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <p className="text-lg font-bold text-emerald-900">{coupon.title}</p>
              <p className="mt-3 text-sm text-emerald-700">{coupon.description}</p>

              <motion.button
                onClick={handleCopy}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Save Coupon
                  </>
                )}
              </motion.button>

              <p className="mt-3 text-xs text-emerald-600">Code: {coupon.id}</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
