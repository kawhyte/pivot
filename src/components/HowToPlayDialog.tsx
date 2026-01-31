'use client';

import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// import { Target } from 'lucide-react';
import { TrophyIcon } from '@/components/icons/TrophyIcon';
import { SparklesIcon } from '@/components/icons/SparklesIcon';

interface HowToPlayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HowToPlayDialog = ({ open, onOpenChange }: HowToPlayDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto bg-white border-4 border-duolingo-green p-0">
        {/* Header */}
        <div className="bg-duolingo-green p-6">
          <DialogHeader>
            <DialogTitle className="text-center">
              <motion.h2
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-3xl font-black text-white"
              >
                How to Play
              </motion.h2>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-neutral-800">
          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="duo-card bg-duolingo-green/10 p-4 border-2 border-duolingo-green"
          >
            <div className="flex items-start gap-3">
              <TrophyIcon className="h-24 w-24 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                 Your Birthday VIP Pass
                </h3>
                <p className="text-lg leading-relaxed text-neutral-700">
                  Choose any path to begin your adventure! Complete all three to unlock your Message.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Scoring */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="duo-card bg-white p-4 border-2 border-neutral-200"
          > */}
            {/* <div className="flex items-start gap-3">
              <Target className="h-6 w-6 text-duolingo-green flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                 Earning Your Wings
                </h3>
                <div className="space-y-1.5 text-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">
                      1
                    </div>
                    <span>Easy = 10 point</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xs">
                      2
                    </div>
                    <span>Medium = 20 points</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">
                      3
                    </div>
                    <span>Hard = 30 points</span>
                  </div>
                </div>
                <p className="text-base text-neutral-600 mt-3">
                  Reach the target score to unlock each key!
                </p>
              </div>
            </div> */}
          {/* </motion.div> */}

          {/* Perfect Run */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="duo-card bg-amber-50 p-4 border-2 border-amber-300"
          >
            <div className="flex items-start gap-3">
              <SparklesIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-1">
                  Perfect Run Bonus
                </h3>
                <p className="text-lg leading-relaxed text-neutral-700">
                  The Lorelai Special: Get every question right on the first try for a legendary bonus!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-neutral-600 space-y-1.5"
          >
            <p className="font-bold text-neutral-800">Quick Tips:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>No time limit - take your time!</li>
              {/* <li>Hints won't affect your score</li> */}
              <li>Progress auto-saves</li>
            </ul>
          </motion.div>

          {/* Close Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={() => onOpenChange(false)}
              className="w-full duo-button bg-duolingo-green text-white px-6 py-3 text-xl font-black"
            >
              Got It!
            </button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
