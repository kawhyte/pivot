'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, Lock, AlertCircle } from 'lucide-react';
import { verifyPasscode, type AgentProfile } from '@/app/actions/auth';
import { useQuestStore } from '@/store/useQuestStore';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export const GiftBoxLogin = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  const { setAuthentication } = useQuestStore();

  // Focus input when gift opens
  useEffect(() => {
    if (isGiftOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isGiftOpen]);

  const handleGiftTap = () => {
    if (!isGiftOpen) {
      setIsGiftOpen(true);
      // Celebration confetti when opening
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6B6B', '#FFE5D9'],
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isProcessing) return;

    const code = inputValue.trim();
    setInputValue('');
    setIsProcessing(true);
    setShowError(false);

    // Simulate "processing" animation
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Verify the passcode
    const profile: AgentProfile | null = await verifyPasscode(code);

    if (profile) {
      // SUCCESS
      setAgentProfile(profile);
      setShowSuccess(true);

      // Big celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF6B6B', '#2E7D32'],
      });

      // Save authentication to store
      setAuthentication(true, profile.name, profile.role, profile.id);

      // Redirect to hub after celebration
      setTimeout(() => {
        router.push('/hub');
      }, 2000);
    } else {
      // FAILURE
      setShowError(true);
      setShakeTrigger(true);
      setTimeout(() => setShakeTrigger(false), 500);

      // Reset after 2 seconds
      setTimeout(() => {
        setShowError(false);
        setIsProcessing(false);
      }, 2000);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-gradient-to-br from-festive-cream via-festive-peach/30 to-festive-cream">
      {/* Floating Decorative Elements */}
      <motion.div
        className="absolute top-20 left-10"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Sparkles className="h-8 w-8 text-festive-gold opacity-40" />
      </motion.div>

      <motion.div
        className="absolute bottom-32 right-16"
        animate={{
          y: [0, -20, 0],
          rotate: [0, -8, 8, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      >
        <Gift className="h-10 w-10 text-festive-coral opacity-30" />
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="gift-box"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: shakeTrigger ? [0, -10, 10, -10, 10, 0] : 0,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md text-center relative z-10"
          >
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-4xl font-display text-festive-brown"
            >
              Birthday Quest
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12 font-accent text-lg text-festive-brown/70"
            >
              A Special Surprise Awaits
            </motion.p>

            {/* Gift Box */}
            {!isGiftOpen ? (
              <motion.button
                onClick={handleGiftTap}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative mx-auto mb-8"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative"
                >
                  {/* Gift Box */}
                  <div className="hand-drawn-card bg-festive-coral w-40 h-40 flex items-center justify-center shadow-lg">
                    <Gift className="h-20 w-20 text-white" strokeWidth={2} />
                  </div>

                  {/* Ribbon */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-festive-gold/80 hand-drawn-soft" />
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-8 bg-festive-gold/80 hand-drawn-soft" />

                  {/* Bow */}
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-festive-gold hand-drawn rounded-full flex items-center justify-center shadow-md"
                  >
                    <Sparkles className="h-8 w-8 text-white" />
                  </motion.div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 font-accent text-lg text-festive-brown"
                >
                  Tap to Open
                </motion.p>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="space-y-6"
              >
                {/* Opened Gift - Passcode Input */}
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="hand-drawn-card bg-white p-8 shadow-xl relative overflow-hidden"
                >
                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-festive-gold/10 hand-drawn-soft" />

                  <Lock className="mx-auto mb-4 h-12 w-12 text-festive-coral" />

                  <h2 className="mb-2 text-2xl font-display text-festive-brown">
                    Agent Access
                  </h2>
                  <p className="mb-6 font-accent text-festive-brown/70">
                    Enter Your Secret Code
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      disabled={isProcessing}
                      placeholder="ENTER CODE HERE"
                      className="hand-drawn w-full px-6 py-4 text-center text-lg font-semibold text-festive-brown placeholder:text-festive-brown/30 bg-festive-cream border-3 border-festive-brown/20 focus:border-festive-coral focus:ring-4 focus:ring-festive-coral/20 transition-all disabled:opacity-50"
                      autoComplete="off"
                      spellCheck="false"
                    />

                    <motion.button
                      type="submit"
                      disabled={inputValue.trim() === '' || isProcessing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="hand-drawn w-full py-4 text-lg font-semibold text-white bg-festive-coral hover:bg-festive-coral/90 disabled:bg-festive-brown/30 disabled:cursor-not-allowed transition-colors shadow-md"
                    >
                      {isProcessing ? (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          Verifying...
                        </motion.span>
                      ) : (
                        'Unlock Quest'
                      )}
                    </motion.button>
                  </form>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                  {showError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="hand-drawn-card flex items-center gap-3 bg-red-50 border-2 border-red-300 px-4 py-3"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                      <p className="text-sm font-medium text-red-700">
                        Access Denied. Check your code and try again.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Success Sticker Reveal */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            className="w-full max-w-md text-center relative z-10"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="hand-drawn-card bg-white p-12 shadow-2xl border-4 border-festive-gold relative overflow-hidden"
            >
              {/* Sticker Effect Border */}
              <div className="absolute inset-0 bg-gradient-to-br from-festive-gold/20 via-transparent to-festive-coral/20 pointer-events-none" />

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <Sparkles className="mx-auto mb-4 h-20 w-20 text-festive-gold" />
              </motion.div>

              <h2 className="mb-2 text-3xl font-display text-festive-brown">
                Welcome Back!
              </h2>
              <p className="text-xl font-accent text-festive-coral mb-4">
                {agentProfile?.name}
              </p>
              <p className="text-sm font-medium text-festive-brown/60 uppercase tracking-widest">
                {agentProfile?.role}
              </p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-sm font-accent text-festive-brown/70"
              >
                Loading your quest...
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center relative z-10"
      >
        <p className="font-accent text-sm text-festive-brown/50">
          A handcrafted adventure just for you
        </p>
      </motion.div>
    </div>
  );
};
