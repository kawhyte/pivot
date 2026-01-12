'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';

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
  const [isUnwrapping, setIsUnwrapping] = useState(false);

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
      // Trigger unwrap animation
      setIsUnwrapping(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
      return;
    }

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();

      if (newTimeLeft === null) {
        clearInterval(timer);
        setIsUnwrapping(true);
        setTimeout(() => {
          onComplete();
        }, 1500);
        return;
      }

      // Use functional setState to avoid dependency on timeLeft
      setTimeLeft((currentTimeLeft) => {
        setPrevTimeLeft(currentTimeLeft);
        return newTimeLeft;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  if (!timeLeft || isUnwrapping) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0, scale: 1.2 }}
        transition={{ duration: 1.5 }}
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-festive-cream via-festive-peach/30 to-festive-cream"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 1.5 }}
        >
          <Gift className="h-32 w-32 text-festive-coral" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-festive-cream via-festive-peach/30 to-festive-cream px-6 py-12 relative overflow-hidden">
      {/* Floating Decorations */}
      <motion.div
        className="absolute top-10 left-10"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Sparkles className="h-12 w-12 text-festive-gold opacity-30" />
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-16"
        animate={{
          y: [0, -15, 0],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      >
        <Gift className="h-16 w-16 text-festive-coral opacity-20" />
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center relative z-10"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-6 flex justify-center"
        >
          <Gift className="h-20 w-20 text-festive-coral" strokeWidth={2} />
        </motion.div>
        <h1 className="text-4xl font-display text-festive-brown mb-3">
          Your Quest Begins Soon!
        </h1>
        <p className="font-accent text-lg text-festive-brown/70">
          A birthday adventure awaits
        </p>
      </motion.div>

      {/* Countdown Display - Festive Ornaments */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8 relative z-10">
        <CountdownUnit
          label="Days"
          value={timeLeft.days}
          prevValue={prevTimeLeft?.days}
          color="festive-coral"
        />
        <CountdownUnit
          label="Hours"
          value={timeLeft.hours}
          prevValue={prevTimeLeft?.hours}
          color="festive-gold"
        />
        <CountdownUnit
          label="Minutes"
          value={timeLeft.minutes}
          prevValue={prevTimeLeft?.minutes}
          color="festive-green"
        />
        <CountdownUnit
          label="Seconds"
          value={timeLeft.seconds}
          prevValue={prevTimeLeft?.seconds}
          color="festive-coral"
        />
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center relative z-10"
      >
        <p className="font-accent text-festive-brown/60">
          Get ready for something special
        </p>
      </motion.div>
    </div>
  );
};

interface CountdownUnitProps {
  label: string;
  value: number;
  prevValue?: number;
  color: string;
}

const CountdownUnit = ({ label, value, prevValue, color }: CountdownUnitProps) => {
  const displayValue = value.toString().padStart(2, '0');
  const prevDisplayValue = prevValue?.toString().padStart(2, '0');
  const hasChanged = displayValue !== prevDisplayValue;

  // Color mapping
  const colorClasses = {
    'festive-coral': 'bg-festive-coral',
    'festive-gold': 'bg-festive-gold',
    'festive-green': 'bg-festive-green',
  };

  return (
    <div className="flex flex-col items-center">
      {/* Ornament Container */}
      <motion.div
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 2 + Math.random(),
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative"
      >
        {/* Ornament String */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-6 bg-festive-brown/30 rounded-full" />

        {/* Ornament Ball */}
        <div
          className={`hand-drawn-card ${colorClasses[color as keyof typeof colorClasses]} relative h-24 w-24 overflow-hidden shadow-xl flex items-center justify-center sm:h-28 sm:w-28 border-4 border-white/30`}
        >
          {/* Darker overlay for better contrast */}
          <div className="absolute inset-0 bg-black/10" />

          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10" />

          {/* Hand-written Digits */}
          <div className="relative flex items-center justify-center z-10">
            <AnimatePresence mode="popLayout">
              {displayValue.split('').map((digit, index) => (
                <motion.span
                  key={`${digit}-${value}-${index}`}
                  initial={hasChanged ? { y: -40, opacity: 0, rotate: -20 } : false}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 40, opacity: 0, rotate: 20 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 25,
                  }}
                  className="text-4xl font-display text-white sm:text-5xl font-bold"
                  style={{
                    textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3), -1px -1px 2px rgba(0, 0, 0, 0.2)',
                    WebkitTextStroke: '1px rgba(0, 0, 0, 0.3)',
                    transform: `rotate(${Math.random() * 6 - 3}deg)`,
                  }}
                >
                  {digit}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Decorative Dots */}
          <div className="absolute top-2 right-2 w-2 h-2 bg-white/80 rounded-full shadow-md" />
          <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-white/70 rounded-full shadow-sm" />
        </div>
      </motion.div>

      {/* Label */}
      <p className="mt-4 font-accent text-sm text-festive-brown/70">
        {label}
      </p>
    </div>
  );
};
