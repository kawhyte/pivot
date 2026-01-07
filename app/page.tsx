'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { KeyRound, Sparkles, HelpCircle } from 'lucide-react';
import { useQuestStore, PATH_IDS, PATH_METADATA } from '@/store/useQuestStore';
import { getUnlockedPaths } from '@/lib/daily-drop';
import { KeySlot } from '@/components/KeySlot';
import { WelcomeScreen } from '@/components/WelcomeScreen';

const VaultHub = () => {
  const router = useRouter();
  const hasTriggeredConfetti = useRef(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const {
    keysCollected,
    isVaultUnlocked,
    hasSeenIntro,
    setActivePath,
    setUnlockedPaths,
  } = useQuestStore();

  // Update unlocked paths based on current date
  useEffect(() => {
    const unlocked = getUnlockedPaths();
    setUnlockedPaths(unlocked);
  }, [setUnlockedPaths]);

  // Fire confetti when vault is unlocked
  useEffect(() => {
    if (isVaultUnlocked && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;

      // Delay slightly to let UI update
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7'],
        });

        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#10b981', '#34d399', '#6ee7b7'],
          });
        }, 250);

        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#10b981', '#34d399', '#6ee7b7'],
          });
        }, 500);
      }, 300);
    }
  }, [isVaultUnlocked]);

  const handlePathClick = (pathId: typeof PATH_IDS[keyof typeof PATH_IDS]) => {
    setActivePath(pathId);
    router.push(`/quest/${pathId}`);
  };

  // Show welcome screen if user hasn't seen intro yet OR if they clicked instructions
  if (!hasSeenIntro) {
    return <WelcomeScreen />;
  }

  if (showInstructions) {
    return <WelcomeScreen isRevisit onComplete={() => setShowInstructions(false)} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-zinc-50 to-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-md px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-2 flex items-center justify-center gap-2">
              <KeyRound className="h-6 w-6 text-zinc-900" strokeWidth={2} />
              <h1 className="text-2xl font-bold text-zinc-900">
                The Vault
              </h1>
            </div>
            <p className="text-sm text-zinc-600">
              Collect 3 keys to unlock your birthday surprise
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col px-6 py-8">
        <div className="mx-auto w-full max-w-md">
          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700">
                  Progress
                </span>
                <span className="text-2xl font-bold text-zinc-900">
                  {keysCollected.length} / 3
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-zinc-100">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(keysCollected.length / 3) * 100}%`,
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Key Slots */}
          <div className="space-y-4">
            <KeySlot
              pathId={PATH_IDS.POP_CULTURE}
              isCollected={keysCollected.includes(PATH_IDS.POP_CULTURE)}
              onClick={() => handlePathClick(PATH_IDS.POP_CULTURE)}
            />
            <KeySlot
              pathId={PATH_IDS.RENAISSANCE}
              isCollected={keysCollected.includes(PATH_IDS.RENAISSANCE)}
              onClick={() => handlePathClick(PATH_IDS.RENAISSANCE)}
            />
            <KeySlot
              pathId={PATH_IDS.HEART}
              isCollected={keysCollected.includes(PATH_IDS.HEART)}
              onClick={() => handlePathClick(PATH_IDS.HEART)}
            />
          </div>

          {/* Vault Unlock Status */}
          {isVaultUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-center shadow-lg">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="mb-4 flex justify-center"
                >
                  <Sparkles className="h-12 w-12 text-white" strokeWidth={2} />
                </motion.div>
                <h2 className="mb-2 text-2xl font-bold text-white">
                  Vault Unlocked!
                </h2>
                <p className="mb-6 text-sm text-emerald-50">
                  You've collected all 3 keys. Ready to see your surprise?
                </p>
                <button
                  onClick={() => router.push('/vault')}
                  className="rounded-full bg-white px-8 py-3 font-semibold text-emerald-600 transition-transform hover:scale-105 active:scale-95"
                >
                  Open Vault
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-md px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              A birthday quest made with love
            </p>
            <button
              onClick={() => setShowInstructions(true)}
              className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-200 active:bg-zinc-300"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              How to Play
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VaultHub;
