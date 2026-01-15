import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { KeyRound, Sparkles, HelpCircle, Share2, Check, LogOut } from 'lucide-react';
import { useQuestStore } from '@/store/useQuestStore';
import { PATH_IDS } from '@/lib/paths';
import { getUnlockedPaths } from '@/lib/daily-drop';
import { KeySlot } from '@/components/KeySlot';
import { HowToPlayDialog } from '@/components/HowToPlayDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const VaultHub = () => {
  const navigate = useNavigate();
  const hasTriggeredConfetti = useRef(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const {
    _hasHydrated,
    keysCollected,
    isVaultUnlocked,
    userId,
    isAuthenticated,
    agentName,
    isTester,
    setActivePath,
    setUnlockedPaths,
    getPathStats,
    resetQuest,
    // NEW: Get path progress data
    pathProgress,
    getPathScore,
  } = useQuestStore();

  // Redirect if not authenticated (only after hydration to prevent loops)
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      navigate('/');
    }
  }, [_hasHydrated, isAuthenticated, navigate]);

  // Update unlocked paths based on current date (GOD MODE: testers bypass restrictions)
  useEffect(() => {
    const unlocked = getUnlockedPaths(isTester);
    setUnlockedPaths(unlocked);
  }, [setUnlockedPaths, isTester]);

  // Fire confetti when vault is unlocked (reduced particles)
  useEffect(() => {
    if (isVaultUnlocked && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;

      // Single confetti burst
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#58CC02', '#88D843', '#FFC800'],
        });
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
    const url = `${window.location.origin}?userId=${userId}`;

    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);

      // Reset after 2 seconds
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      // Fallback: show toast with URL
      setShareUrl(url);
      setShowShareToast(true);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    resetQuest();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-warm-cream relative">
      {/* Floating Help Button - Top Right */}
      <button
        onClick={() => setShowHowToPlay(true)}
        className="fixed top-6 right-6 z-40 duo-button bg-duolingo-green text-white p-4"
        aria-label="How to Play"
      >
        <HelpCircle className="h-6 w-6" strokeWidth={2.5} />
      </button>

      {/* How to Play Dialog */}
      <HowToPlayDialog open={showHowToPlay} onOpenChange={setShowHowToPlay} />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Logout?"
        description="Are you sure you want to logout? Your progress will be saved."
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        variant="default"
      />

      {/* Share URL Toast (fallback if clipboard fails) */}
      <Toast
        open={showShareToast}
        onOpenChange={setShowShareToast}
        title="Copy this link to continue on another device"
        description={shareUrl}
        variant="info"
        duration={10000}
      />

      {/* Header */}
      <header className="border-b-2 border-neutral-200 bg-white">
        <div className="mx-auto max-w-md px-6 py-6">
          <div className="text-center">
            <div className="mb-2 flex items-center justify-center gap-2">
              <KeyRound className="h-7 w-7 text-duolingo-green" strokeWidth={2.5} />
              <h1 className="text-3xl font-bold text-duolingo-green">
                The Vault
              </h1>
            </div>
            <p className="text-base text-neutral-700">
              Collect 3 keys to unlock your birthday surprise
            </p>
            {agentName && (
              <div className="mt-4">
                <div className="duo-card bg-success-bg border-duolingo-green px-4 py-2.5 inline-block">
                  <p className="text-sm text-neutral-700">
                    Logged in as
                  </p>
                  <p className="text-lg text-duolingo-green font-bold">
                    {agentName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col px-6 py-8">
        <div className="mx-auto w-full max-w-md">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="duo-card bg-white p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-base font-semibold text-duolingo-green">
                  Your Progress
                </span>
                <span className="text-3xl font-black text-duolingo-green">
                  {keysCollected.length} / 3
                </span>
              </div>
              <Progress
                value={(keysCollected.length / 3) * 100}
                className="h-4 bg-neutral-200"
              />
            </div>
          </div>

          {/* Key Slots */}
          <div className="space-y-4">
            <KeySlot
              pathId={PATH_IDS.POP_CULTURE}
              isCollected={keysCollected.includes(PATH_IDS.POP_CULTURE)}
              onClick={() => handlePathClick(PATH_IDS.POP_CULTURE)}
              stats={getPathStats(PATH_IDS.POP_CULTURE)}
              isTester={isTester}
              currentScore={getPathScore(PATH_IDS.POP_CULTURE)}
              completedCount={pathProgress[PATH_IDS.POP_CULTURE]?.completedIds?.length || 0}
            />
            <KeySlot
              pathId={PATH_IDS.RENAISSANCE}
              isCollected={keysCollected.includes(PATH_IDS.RENAISSANCE)}
              onClick={() => handlePathClick(PATH_IDS.RENAISSANCE)}
              stats={getPathStats(PATH_IDS.RENAISSANCE)}
              isTester={isTester}
              currentScore={getPathScore(PATH_IDS.RENAISSANCE)}
              completedCount={pathProgress[PATH_IDS.RENAISSANCE]?.completedIds?.length || 0}
            />
            <KeySlot
              pathId={PATH_IDS.HEART}
              isCollected={keysCollected.includes(PATH_IDS.HEART)}
              onClick={() => handlePathClick(PATH_IDS.HEART)}
              stats={getPathStats(PATH_IDS.HEART)}
              isTester={isTester}
              currentScore={getPathScore(PATH_IDS.HEART)}
              completedCount={pathProgress[PATH_IDS.HEART]?.completedIds?.length || 0}
            />
          </div>

          {/* Vault Unlock Status */}
          {isVaultUnlocked && (
            <div className="mt-8">
              <div className="duo-card bg-duolingo-green p-8 text-center border-[3px] border-duolingo-green-dark">
                <div className="mb-4 flex justify-center">
                  <Sparkles className="h-14 w-14 text-white" strokeWidth={2} fill="currentColor" />
                </div>
                <h2 className="mb-2 text-3xl font-black text-white">
                  Vault Unlocked!
                </h2>
                <p className="mb-6 text-base text-white/90">
                  You've collected all 3 keys. Ready to see your surprise?
                </p>
                <button
                  onClick={() => navigate('/vault')}
                  className="duo-button bg-white text-duolingo-green px-8 py-4 text-xl font-black hover:bg-neutral-100"
                >
                  Open Vault
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-neutral-200 bg-white">
        <div className="mx-auto max-w-md px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-neutral-600">
              A birthday quest made with love
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleShareProgress}
                disabled={!userId}
                variant="outline"
                size="sm"
                className="gap-1 duo-button bg-neutral-100 border-neutral-300 text-xs font-medium text-neutral-900 hover:bg-neutral-200 px-3 py-2"
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
              <Button
                onClick={() => setShowHowToPlay(true)}
                variant="outline"
                size="sm"
                className="gap-1 duo-button bg-neutral-100 border-neutral-300 text-xs font-medium text-neutral-900 hover:bg-neutral-200 px-3 py-2"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Help
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="gap-1 duo-button bg-red-50 border-error-red text-xs font-medium text-error-red hover:bg-red-100 px-3 py-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VaultHub;
