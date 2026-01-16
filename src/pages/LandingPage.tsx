import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuestStore } from '@/store/useQuestStore';
import { QuestCountdown } from '@/components/QuestCountdown';
import { GiftBoxLogin } from '@/components/GiftBoxLogin';
import { MISSION_START_DATE } from '@/lib/mission';
import { cn } from '@/lib/utils';

const LandingPage = () => {
  const navigate = useNavigate();
  const { _hasHydrated, isAuthenticated } = useQuestStore();
  const [isMissionActive, setIsMissionActive] = useState(false);
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
    };

    checkMissionStatus();

    // Update every second
    const interval = setInterval(checkMissionStatus, 1000);

    return () => clearInterval(interval);
  }, [isClient]);

  // Redirect authenticated users to hub (only after hydration to prevent loops)
  useEffect(() => {
    if (isClient && _hasHydrated && isAuthenticated) {
      navigate('/hub');
    }
  }, [isClient, _hasHydrated, isAuthenticated, navigate]);

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
        }}
      />
    );
  }

  // Show gift box login for authentication when mission is active
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <GiftBoxLogin />
    </motion.div>
  );
};

export default LandingPage;
