'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

interface CountdownProps {
  targetDate: Date;
  onComplete: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const QuestCountdown = ({ targetDate, onComplete }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [prevTimeLeft, setPrevTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft | null => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference <= 0) {
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    // Initial calculation
    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    setPrevTimeLeft(initial);

    if (initial === null) {
      onComplete();
      return;
    }

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();

      if (newTimeLeft === null) {
        clearInterval(timer);
        onComplete();
        return;
      }

      setPrevTimeLeft(timeLeft);
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete, timeLeft]);

  if (!timeLeft) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-12 font-['JetBrains_Mono']">
      {/* Scanline overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <motion.div
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mb-4 flex justify-center"
        >
          <Lock className="h-16 w-16 text-amber-500" strokeWidth={1.5} />
        </motion.div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-amber-500">
          Secure Dataset: Locked
        </h1>
        <p className="mt-2 text-sm font-mono text-zinc-500 uppercase tracking-widest">
          Awaiting Mission Authorization
        </p>
      </motion.div>

      {/* Countdown Display */}
      <div className="grid grid-cols-4 gap-4 sm:gap-6">
        <CountdownUnit
          label="Days"
          value={timeLeft.days}
          prevValue={prevTimeLeft?.days}
        />
        <CountdownUnit
          label="Hours"
          value={timeLeft.hours}
          prevValue={prevTimeLeft?.hours}
        />
        <CountdownUnit
          label="Minutes"
          value={timeLeft.minutes}
          prevValue={prevTimeLeft?.minutes}
        />
        <CountdownUnit
          label="Seconds"
          value={timeLeft.seconds}
          prevValue={prevTimeLeft?.seconds}
        />
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="font-mono text-xs text-zinc-600 uppercase tracking-widest">
          Terminal Access: Restricted
        </p>
      </motion.div>
    </div>
  );
};

interface CountdownUnitProps {
  label: string;
  value: number;
  prevValue?: number;
}

const CountdownUnit = ({ label, value, prevValue }: CountdownUnitProps) => {
  const displayValue = value.toString().padStart(2, '0');
  const prevDisplayValue = prevValue?.toString().padStart(2, '0');
  const hasChanged = displayValue !== prevDisplayValue;

  return (
    <div className="flex flex-col items-center">
      {/* Value Container */}
      <div className="relative h-20 w-16 overflow-hidden rounded-lg border border-amber-500/30 bg-zinc-900 shadow-lg sm:h-24 sm:w-20">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent" />

        {/* Animated Digits */}
        <div className="relative flex h-full items-center justify-center">
          <AnimatePresence mode="popLayout">
            {displayValue.split('').map((digit, index) => (
              <motion.span
                key={`${digit}-${value}-${index}`}
                initial={hasChanged ? { y: -30, opacity: 0 } : false}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                className="text-3xl font-bold text-amber-500 sm:text-4xl"
                style={{
                  textShadow: '0 0 10px rgba(251, 191, 36, 0.3)',
                }}
              >
                {digit}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Label */}
      <p className="mt-2 font-mono text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </p>
    </div>
  );
};
