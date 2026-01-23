'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Star, Target } from 'lucide-react';
import { TrophyIcon } from '@/components/icons/TrophyIcon';
import { SparklesIcon } from '@/components/icons/SparklesIcon';

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
        className="flex min-h-screen items-center justify-center bg-warm-cream"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 1.5 }}
        >
          <Gift className="h-32 w-32 text-starbucks-green" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-warm-cream px-6 py-12 relative overflow-hidden">
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
        <SparklesIcon className="h-12 w-12 text-celebration-gold opacity-30" />
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
        <Gift className="h-16 w-16 text-celebration-pink opacity-20" />
      </motion.div>

      <div className="max-w-4xl w-full relative z-10">
        {/* PLACEHOLDER 1: Birthday Hero Photo - Polaroid Frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 3 }}
          transition={{
            duration: 0.6,
            type: 'spring',
            stiffness: 300,
            damping: 20
          }}
          className="mb-12 flex justify-center"
        >
          <div
            className="bg-white p-5 shadow-2xl hand-drawn-border border-starbucks-green relative"
            style={{ transform: 'rotate(3deg)' }}
          >
            <div className="w-72 h-72 bg-gray-200 flex items-center justify-center relative overflow-hidden">
              {/* Placeholder for Birthday Hero Photo */}
              <div className="absolute inset-0 bg-gradient-to-br from-celebration-pink/20 to-celebration-gold/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Star className="h-20 w-20 text-starbucks-green/30" strokeWidth={1} />
              </div>
              <p className="relative text-center font-accent text-deep-brown/50 text-base px-4 z-10">
                [Birthday Hero Photo]
              </p>
            </div>
            <p className="mt-4 text-center font-accent text-deep-brown/70 text-base leading-relaxed">
              The Adventure Begins...
            </p>
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-display leading-tight text-starbucks-green mb-3">
            Your Quest Begins Soon!
          </h1>
          <p className="font-accent text-xl text-deep-brown/70">
            A birthday adventure awaits
          </p>
        </motion.div>

        {/* Countdown Display */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8 mb-12 justify-items-center">
          <CountdownUnit
            label="Days"
            value={timeLeft.days}
            prevValue={prevTimeLeft?.days}
            color="starbucks-green"
          />
          <CountdownUnit
            label="Hours"
            value={timeLeft.hours}
            prevValue={prevTimeLeft?.hours}
            color="celebration-gold"
          />
          <CountdownUnit
            label="Minutes"
            value={timeLeft.minutes}
            prevValue={prevTimeLeft?.minutes}
            color="celebration-pink"
          />
          <CountdownUnit
            label="Seconds"
            value={timeLeft.seconds}
            prevValue={prevTimeLeft?.seconds}
            color="starbucks-green"
          />
        </div>

        {/* Mission Briefing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-soft-white p-8 shadow-xl hand-drawn-border border-starbucks-green relative"
        >
          {/* Decorative Corner Stars */}
          <Star className="absolute top-3 right-3 h-6 w-6 text-celebration-gold/40" fill="currentColor" />
          <Star className="absolute bottom-3 left-3 h-5 w-5 text-celebration-pink/40" fill="currentColor" />

          <h2 className="text-2xl font-display text-starbucks-green mb-4 text-center">
            🎯 Mission Briefing
          </h2>

          <div className="font-accent text-deep-brown/80 text-lg leading-relaxed space-y-4">
            <p>
              <strong className="text-starbucks-green">Your Mission:</strong> Complete 3 themed quest paths
              to unlock the Grand Vault and reveal your birthday surprise!
            </p>

            <div className="grid md:grid-cols-3 gap-4 my-6">
              <motion.div
                className="hand-drawn-card bg-white p-4 border-2 border-celebration-pink"
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="text-center">
                  <TrophyIcon className="h-24 w-24 mx-auto mb-2" />
                  <h3 className="font-display text-sm text-deep-brown mb-1">Pop Culture</h3>
                  <p className="text-xs text-deep-brown/60">TV, Movies & Fun</p>
                </div>
              </motion.div>

              <motion.div
                className="hand-drawn-card bg-white p-4 border-2 border-celebration-gold"
                whileHover={{ scale: 1.05, rotate: -2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-celebration-gold" fill="currentColor" />
                  <h3 className="font-display text-sm text-deep-brown mb-1">Renaissance</h3>
                  <p className="text-xs text-deep-brown/60">Knowledge & Facts</p>
                </div>
              </motion.div>

              <motion.div
                className="hand-drawn-card bg-white p-4 border-2 border-starbucks-green"
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="text-center">
                  <Gift className="h-8 w-8 mx-auto mb-2 text-starbucks-green" />
                  <h3 className="font-display text-sm text-deep-brown mb-1">Heart</h3>
                  <p className="text-xs text-deep-brown/60">Personal Memories</p>
                </div>
              </motion.div>
            </div>

            <div className="bg-celebration-gold/10 p-4 rounded-lg hand-drawn border-2 border-celebration-gold/30">
              <p className="mb-2">
                <Target className="inline h-5 w-5 mr-2 text-starbucks-green" />
                <strong className="text-starbucks-green">Point System:</strong>
              </p>
              <ul className="ml-8 space-y-1 text-base">
                <li>🟢 Easy Questions = <strong>1 point</strong></li>
                <li>🟡 Medium Questions = <strong>2 points</strong></li>
                <li>🔴 Hard Questions = <strong>3 points</strong></li>
              </ul>
            </div>

            <div className="bg-celebration-pink/10 p-4 rounded-lg hand-drawn border-2 border-celebration-pink/30">
              <p className="mb-2">
                <SparklesIcon className="inline h-5 w-5 mr-2 text-celebration-pink" />
                <strong className="text-starbucks-green">Perfect Run Bonus:</strong>
              </p>
              <p className="ml-8 text-base">
                Answer <strong>every question correctly</strong> on your first try to unlock
                a <strong className="text-celebration-pink">special bonus surprise!</strong> 🎁
              </p>
            </div>

            <p className="text-center text-base pt-2">
              Earn enough points on each path to collect your key and unlock the vault! ✨
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="font-accent text-deep-brown/60 text-lg">
            Get ready for something special ✨
          </p>
        </motion.div>
      </div>
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
    'starbucks-green': 'bg-starbucks-green',
    'celebration-gold': 'bg-celebration-gold',
    'celebration-pink': 'bg-celebration-pink',
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
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-6 bg-deep-brown/30 rounded-full" />

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
                    stiffness: 300,
                    damping: 20,
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
      <p className="mt-4 font-accent text-sm text-deep-brown/70">
        {label}
      </p>
    </div>
  );
};
