'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { AlertTriangle } from 'lucide-react';
import { PATH_METADATA, type PathId } from '@/lib/paths';
import { TrophyIcon } from '@/components/icons/TrophyIcon';
import { SparklesIcon } from '@/components/icons/SparklesIcon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ThresholdDecisionModalProps {
  pathId: PathId;
  currentScore: number;
  targetScore: number;
  remainingPuzzles: number;
  onDecision: (decision: 'claim' | 'perfect-run') => void;
  isTester?: boolean;
  open?: boolean;
}

export const ThresholdDecisionModal = ({
  pathId,
  currentScore,
  targetScore,
  remainingPuzzles,
  onDecision,
  isTester = false,
  open = true,
}: ThresholdDecisionModalProps) => {
  const pathMeta = PATH_METADATA[pathId];

  // Fire confetti on mount
  useEffect(() => {
    const colors = [pathMeta.colors.primary, pathMeta.colors.secondary];

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });
  }, [pathMeta.colors]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className={`max-w-md border-4 shadow-2xl p-8  ${isTester ? 'bg-zinc-900 border-cyan-600' : 'bg-white'}`}>
        <DialogHeader className="space-y-4 flex flex-col items-center text-center">
          {/* Celebration Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="flex justify-center pt-5"
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
             
            >
              <TrophyIcon className="h-24 w-24" />
            </div>
          </motion.div>

          {/* Title */}
          <DialogTitle className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-4xl mb-3 text-center font-bold ${
                isTester ? 'text-cyan-400' : 'text-neutral-900'
              }`}
            >
              Congratulations!
            </motion.h2>
          </DialogTitle>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-center pb-5 text-base ${
              isTester ? 'text-zinc-600' : 'text-neutral-700'
            }`}
          >
            You've reached <span className="font-bold">100% mastery</span> on the{' '}
            <span className="font-semibold">{pathMeta.name}</span> path!
          </motion.p>
        </DialogHeader>

        {/* Score Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className={`mb-6 mx-8 rounded-xl px-4 py-3 text-center ${
            isTester ? 'bg-zinc-100' : 'bg-neutral-100'
          }`}
        >
          <p className={`text-lg font-bold ${isTester ? 'text-neutral-900' : 'text-neutral-900'}`}>
         Now, you have a very important decision to make.   
          </p>
          {/* <p className={`text-base ${isTester ? 'text-zinc-400' : 'text-neutral-600'}`}>
            {remainingPuzzles} question{remainingPuzzles !== 1 ? 's' : ''} remaining
          </p> */}
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`mb-4 text-center text-base font-semibold ${
            isTester ? 'text-zinc-400' : 'text-neutral-500'
          }`}
        >
          Choose your path:
        </motion.div>

        {/* Button Container with improved spacing */}
        <div className="space-y-6 px-10">
  {/* Option 1: Claim Key & Stop (Safe Path) */}
  <motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    onClick={() => onDecision('claim')}
    className={`duo-button w-full py-6 flex flex-col items-center justify-center shadow-xl active:scale-[0.98] transition-all ${
      isTester
        ? 'bg-cyan-600 hover:bg-cyan-500'
        : 'bg-duolingo-green hover:bg-duolingo-green-dark text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      <TrophyIcon className="h-7 w-7 text-white" />
      <span className="text-xl font-black uppercase tracking-wide">Secure My Key & Quit</span>
    </div>
    <p className="mt-1 text-xs font-bold text-white/90 uppercase tracking-widest">
      Finish Quest & Keep Progress
    </p>
  </motion.button>

  {/* Option 2: Go for 100% (Risk Path) */}
  <motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.7 }}
    onClick={() => onDecision('perfect-run')}
    className={`duo-button w-full py-6 flex flex-col items-center justify-center border-2 shadow-lg active:scale-[0.98] transition-all ${
      isTester 
        ? 'border-cyan-600 bg-zinc-800 text-cyan-400' 
        : 'border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50'
    }`}
  >
    <div className="flex items-center gap-3">
      <SparklesIcon className="h-7 w-7" />
      <span className="text-xl font-black uppercase tracking-wide">Risk for the Bonus Upgraded Gift</span>
    </div>
    <p className="mt-1 text-xs font-bold opacity-70 uppercase tracking-widest">
      Sudden Death: {remainingPuzzles} Perfect Correct in a Row
    </p>
  </motion.button>
</div>

        {/* Warning Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-4 flex items-start gap-2 rounded-lg bg-warning-orange/10 px-3 py-2"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning-orange" />
          <p className={`text-base ${isTester ? 'text-zinc-800' : 'text-neutral-700'}`}>
            <span className="font-bold">Perfect Run rule:</span> ONE wrong answer ends the
            attempt
          </p>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
