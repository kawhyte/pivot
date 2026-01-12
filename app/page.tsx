'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useQuestStore } from '@/store/useQuestStore';
import { QuestCountdown } from '@/components/QuestCountdown';
import { GiftBoxLogin } from '@/components/GiftBoxLogin';
import { MISSION_START_DATE } from '@/lib/mission';

const LandingPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useQuestStore();
  const [isMissionActive, setIsMissionActive] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if mission is active
  useEffect(() => {
    if (!isClient) return;

    const checkMissionStatus = () => {
      const isActive = Date.now() >= MISSION_START_DATE.getTime();
      setIsMissionActive(isActive);

      // If mission is active, show terminal
      if (isActive && !isAuthenticated) {
        setShowTerminal(true);
      }
    };

    checkMissionStatus();

    // Update every second
    const interval = setInterval(checkMissionStatus, 1000);

    return () => clearInterval(interval);
  }, [isClient, isAuthenticated]);

  // Redirect authenticated users to hub
  useEffect(() => {
    if (isClient && isAuthenticated) {
      router.push('/hub');
    }
  }, [isClient, isAuthenticated, router]);

  // Don't render anything until client-side hydration
  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto" />
          <p className="font-['JetBrains_Mono'] text-sm text-zinc-500 uppercase tracking-widest">
            Accessing Hub...
          </p>
        </motion.div>
      </div>
    );
  }

  // Show countdown if mission hasn't started
  if (!isMissionActive) {
    return (
      <QuestCountdown
        targetDate={MISSION_START_DATE}
        onComplete={() => {
          setIsMissionActive(true);
          // Smooth transition to terminal
          setTimeout(() => setShowTerminal(true), 500);
        }}
      />
    );
  }

  // Show gift box login for authentication
  if (showTerminal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <GiftBoxLogin />
      </motion.div>
    );
  }

  // Loading state while transitioning
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
    </div>
  );
};

export default LandingPage;
