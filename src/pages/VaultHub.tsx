import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { KeyRound, Sparkles, HelpCircle, Share2, Check, LogOut } from 'lucide-react';
import { useQuestStore, PATH_IDS } from '@/store/useQuestStore';
import { getUnlockedPaths } from '@/lib/daily-drop';
import { KeySlot } from '@/components/KeySlot';
import { HowToPlayDialog } from '@/components/HowToPlayDialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const VaultHub = () => {
  const navigate = useNavigate();
  const hasTriggeredConfetti = useRef(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const {
    _hasHydrated,
    keysCollected,
    isVaultUnlocked,
    userId,
    isAuthenticated,
    agentName,
    setActivePath,
    setUnlockedPaths,
    getPathStats,
    resetQuest,
  } = useQuestStore();

  // Redirect if not authenticated (only after hydration to prevent loops)
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      navigate('/');
    }
  }, [_hasHydrated, isAuthenticated, navigate]);

  // Update unlocked paths based on current date
  useEffect(() => {
    const unlocked = getUnlockedPaths();
    setUnlockedPaths(unlocked);
  }, [setUnlockedPaths]);

  // Fire confetti when vault is unlocked - STARBUCKS GREEN
  useEffect(() => {
    if (isVaultUnlocked && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;

      // Delay slightly to let UI update
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#006241', '#10B981', '#34D399'],
        });

        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#006241', '#F9A8D4', '#FBBF24'],
          });
        }, 250);

        setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#006241', '#F9A8D4', '#FBBF24'],
          });
        }, 500);
      }, 300);
    }
  }, [isVaultUnlocked]);

  const handlePathClick = (pathId: typeof PATH_IDS[keyof typeof PATH_IDS]) => {
    setActivePath(pathId);
    navigate(`/quest/${pathId}`);
  };

  const handleShareProgress = async () => {
    if (!userId) return;

    // Generate shareable URL with userId parameter
    const shareUrl = `${window.location.origin}?userId=${userId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);

      // Reset after 2 seconds
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback: show alert with URL
      alert(`Copy this link to continue on another device:\n\n${shareUrl}`);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout? Your progress will be saved.')) {
      resetQuest();
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-warm-cream relative">
      {/* Floating Help Button - Top Right */}
      <motion.button
        onClick={() => setShowHowToPlay(true)}
        className="fixed top-6 right-6 z-40 hand-drawn bg-starbucks-green text-white p-4 shadow-2xl "
        whileHover={{
          scale: 1.1,
          rotate: [0, -10, 10, -10, 0],
          transition: { duration: 0.5 }
        }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        aria-label="How to Play"
      >
        <HelpCircle className="h-6 w-6" strokeWidth={2.5} />
      </motion.button>

      {/* How to Play Dialog */}
      <HowToPlayDialog open={showHowToPlay} onOpenChange={setShowHowToPlay} />

      {/* Header */}
      <header className="border-b-3 border-starbucks-green/20 bg-soft-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-md px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-center"
          >
            <div className="mb-2 flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <KeyRound className="h-7 w-7 text-starbucks-green" strokeWidth={2.5} />
              </motion.div>
              <h1 className="text-3xl font-display text-starbucks-green">
                The Vault
              </h1>
            </div>
            <p className="text-base font-accent text-deep-brown/70 italic">
              Collect 3 keys to unlock your birthday surprise
            </p>
            {agentName && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 font-accent text-sm text-starbucks-green/70"
              >
                Agent: <strong>{agentName}</strong>
              </motion.p>
            )}
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
            transition={{
              delay: 0.2,
              type: 'spring',
              stiffness: 300,
              damping: 20
            }}
            className="mb-8"
          >
            <div className="hand-drawn-card bg-soft-white p-6 shadow-lg border-3 border-starbucks-green/30 relative overflow-hidden">
              {/* Decorative Corner Stars */}
              <Sparkles className="absolute top-2 right-2 h-5 w-5 text-celebration-gold/30" />
              <Sparkles className="absolute bottom-2 left-2 h-4 w-4 text-celebration-pink/30" />

              <div className="mb-3 flex items-center justify-between">
                <span className="text-base font-accent text-starbucks-green italic">
                  Your Progress
                </span>
                <motion.span
                  className="text-3xl font-display text-starbucks-green"
                  animate={{ scale: keysCollected.length > 0 ? [1, 1.1, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {keysCollected.length} / 3
                </motion.span>
              </div>
              <Progress
                value={(keysCollected.length / 3) * 100}
                className="h-4 hand-drawn bg-starbucks-green/10"
              />
            </div>
          </motion.div>

          {/* Key Slots */}
          <div className="space-y-4">
            <KeySlot
              pathId={PATH_IDS.POP_CULTURE}
              isCollected={keysCollected.includes(PATH_IDS.POP_CULTURE)}
              onClick={() => handlePathClick(PATH_IDS.POP_CULTURE)}
              stats={getPathStats(PATH_IDS.POP_CULTURE)}
            />
            <KeySlot
              pathId={PATH_IDS.RENAISSANCE}
              isCollected={keysCollected.includes(PATH_IDS.RENAISSANCE)}
              onClick={() => handlePathClick(PATH_IDS.RENAISSANCE)}
              stats={getPathStats(PATH_IDS.RENAISSANCE)}
            />
            <KeySlot
              pathId={PATH_IDS.HEART}
              isCollected={keysCollected.includes(PATH_IDS.HEART)}
              onClick={() => handlePathClick(PATH_IDS.HEART)}
              stats={getPathStats(PATH_IDS.HEART)}
            />
          </div>

          {/* Vault Unlock Status */}
          {isVaultUnlocked && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.4,
                type: 'spring',
                stiffness: 300,
                damping: 20
              }}
              className="mt-8"
            >
              <div className="relative overflow-hidden hand-drawn-border border-4 border-starbucks-green bg-gradient-to-br from-starbucks-green to-starbucks-green/90 p-8 text-center shadow-2xl">
                {/* Animated Background Sparkles */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute inset-0 opacity-10"
                >
                  <Sparkles className="absolute top-1/4 left-1/4 h-12 w-12 text-white" />
                  <Sparkles className="absolute top-1/3 right-1/4 h-16 w-16 text-celebration-pink" />
                  <Sparkles className="absolute bottom-1/4 left-1/3 h-10 w-10 text-celebration-gold" />
                </motion.div>

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
                  className="mb-4 flex justify-center relative z-10"
                >
                  <Sparkles className="h-14 w-14 text-celebration-gold" strokeWidth={2} fill="currentColor" />
                </motion.div>
                <h2 className="mb-2 text-3xl font-display text-white relative z-10">
                  Vault Unlocked!
                </h2>
                <p className="mb-6 text-base font-accent text-white/90 relative z-10 italic">
                  You've collected all 3 keys. Ready to see your surprise?
                </p>
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Button
                    onClick={() => navigate('/vault')}
                    className="hand-drawn bg-celebration-gold text-deep-brown px-8 py-6 font-display text-lg hover:bg-celebration-gold/90 shadow-xl border-3 border-celebration-gold/50 relative z-10"
                    size="lg"
                  >
                    Open Vault ✨
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-3 border-starbucks-green/20 bg-soft-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-md px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs font-accent text-deep-brown/60 italic">
              A birthday quest made with love ✨
            </p>
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Button
                  onClick={handleShareProgress}
                  disabled={!userId}
                  variant="outline"
                  size="sm"
                  className="gap-1 hand-drawn bg-celebration-pink/20 border-2 border-celebration-pink text-xs font-medium text-deep-brown hover:bg-celebration-pink/30"
                >
                  {linkCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      Share
                    </>
                  )}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Button
                  onClick={() => setShowHowToPlay(true)}
                  variant="outline"
                  size="sm"
                  className="gap-1 hand-drawn bg-celebration-gold/20 border-2 border-celebration-gold text-xs font-medium text-deep-brown hover:bg-celebration-gold/30"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  Help
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="gap-1 hand-drawn bg-red-100 border-2 border-red-300 text-xs font-medium text-red-700 hover:bg-red-200"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VaultHub;
