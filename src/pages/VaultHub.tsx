import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { KeyRound, Sparkles, HelpCircle, Share2, Check, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useQuestStore } from '@/store/useQuestStore';
import { PATH_IDS } from '@/lib/paths';
import { KeySlot } from '@/components/KeySlot';
import { HowToPlayDialog } from '@/components/HowToPlayDialog';
import { WelcomeModal } from '@/components/WelcomeModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DebugPanel } from '@/components/debug/DebugPanel';
import { cn } from '@/lib/utils';

const VaultHub = () => {
  const navigate = useNavigate();
  const hasTriggeredConfetti = useRef(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(
    () => localStorage.getItem('birthday-quest-seen-welcome') === 'true'
  );
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
    // NEW: Completion-based unlock system
    completedPathsData,
  } = useQuestStore();

  // Redirect if not authenticated (only after hydration to prevent loops)
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      navigate('/');
    }
  }, [_hasHydrated, isAuthenticated, navigate]);

  // Unlocked paths are now calculated in useQuestStore based on completion
  // No need to update them here - they update automatically when keys are collected

  // Show welcome modal on first visit (only once per browser)
  useEffect(() => {
    if (!hasSeenWelcome && _hasHydrated && isAuthenticated) {
      setShowWelcomeModal(true);
    }
  }, [hasSeenWelcome, _hasHydrated, isAuthenticated]);

  const handleDismissWelcome = () => {
    localStorage.setItem('birthday-quest-seen-welcome', 'true');
    setHasSeenWelcome(true);
    setShowWelcomeModal(false);
  };

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
      toast.info('Copy this link to continue on another device', {
        description: url,
        duration: 10000,
      });
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
      <Button
        onClick={() => setShowHowToPlay(true)}
        className={cn(
          "fixed top-6 right-6 z-40 p-4 rounded-2xl",
          "bg-duolingo-green text-white hover:bg-duolingo-green/90",
          "shadow-lg transition-all duration-200"
        )}
        aria-label="How to Play"
      >
        <HelpCircle className="h-6 w-6" strokeWidth={2.5} />
      </Button>

      {/* How to Play Dialog */}
      <HowToPlayDialog open={showHowToPlay} onOpenChange={setShowHowToPlay} />

      {/* Welcome Modal (first-time onboarding) */}
      <WelcomeModal
        open={showWelcomeModal}
        onOpenChange={handleDismissWelcome}
        agentName={agentName}
      />

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Logout?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? Your progress will be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <header className="border-b-2 border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
  <div className="mx-auto max-w-md px-6 py-5">
    {/* Top Row: Mission Branding & Identity */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="bg-neutral-50 p-2 rounded-xl border border-neutral-100 shadow-sm">
          <img className="h-6 w-6" src='/images/lock.svg' alt="Vault" />
        </div>
        <div>
          <h1 className="font-doodle text-4xl text-black leading-none">
            The Vault
          </h1>
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
            Mission: Birthday
          </p>
        </div>
      </div>

      {/* Agent Profile Pill - Option 1 (The Profile Pill) */}
      {agentName && (
        <div className="doodle-sticker inline-flex items-center gap-2 pl-1 pr-3 py-1">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-duolingo-green font-black text-[10px] border border-duolingo-green/20">
            {agentName[0]?.toUpperCase()}
          </div>
          <span className="text-xs font-bold text-duolingo-green-dark truncate max-w-[80px]">
            {agentName}
          </span>
        </div>
      )}
    </div>

    {/* Bottom Row: Goal & Integrated Progress */}
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <p className="text-sm font-medium text-neutral-600 max-w-[200px] leading-tight">
          Collect <span className="text-duolingo-green font-bold">3 keys</span> to unlock your surprise
        </p>
        <div className="text-right leading-none">
          <span className="text-2xl font-black text-duolingo-green marker-highlight px-2 py-1 rounded">
            {keysCollected.length}
            <span className="text-neutral-200 mx-0.5">/</span>
            3
          </span>
        </div>
      </div>

      {/* Visual Key Tracker - Replaces the heavy Progress Bar */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => {
          const isCollected = keysCollected.length >= i;
          return (
            <div 
              key={i}
              className={cn(
                "h-2.5 flex-1 rounded-full transition-all duration-700",
                isCollected 
                  ? "bg-duolingo-green shadow-[0_0_12px_rgba(88,204,2,0.3)]" 
                  : "bg-neutral-100 border border-neutral-200"
              )}
            />
          );
        })}
      </div>
    </div>
  </div>
</header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col px-6 py-8">
        <div className="mx-auto w-full max-w-md">
          {/* Progress Indicator */}
          {/* <div className="mb-8">
            <Card className="bg-white border-2 rounded-2xl shadow-sm">
              <CardContent className="p-6">
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
              </CardContent>
            </Card>
          </div> */}

          {/* Key Slots */}
          <div className="space-y-4">
            <div className="rotate-1">
              <KeySlot
                pathId={PATH_IDS.POP_CULTURE}
                pathNumber={1}
                isCollected={keysCollected.includes(PATH_IDS.POP_CULTURE)}
                onClick={() => handlePathClick(PATH_IDS.POP_CULTURE)}
                stats={getPathStats(PATH_IDS.POP_CULTURE)}
                isTester={isTester}
                currentScore={getPathScore(PATH_IDS.POP_CULTURE)}
                completedCount={pathProgress[PATH_IDS.POP_CULTURE]?.completedIds?.length || 0}
                completedPathsData={completedPathsData || []}
              />
            </div>
            <div className="-rotate-1">
              <KeySlot
                pathId={PATH_IDS.RENAISSANCE}
                pathNumber={2}
                isCollected={keysCollected.includes(PATH_IDS.RENAISSANCE)}
                onClick={() => handlePathClick(PATH_IDS.RENAISSANCE)}
                stats={getPathStats(PATH_IDS.RENAISSANCE)}
                isTester={isTester}
                currentScore={getPathScore(PATH_IDS.RENAISSANCE)}
                completedCount={pathProgress[PATH_IDS.RENAISSANCE]?.completedIds?.length || 0}
                completedPathsData={completedPathsData || []}
              />
            </div>
            <div className="rotate-1">
              <KeySlot
                pathId={PATH_IDS.HEART}
                pathNumber={3}
                isCollected={keysCollected.includes(PATH_IDS.HEART)}
                onClick={() => handlePathClick(PATH_IDS.HEART)}
                stats={getPathStats(PATH_IDS.HEART)}
                isTester={isTester}
                currentScore={getPathScore(PATH_IDS.HEART)}
                completedCount={pathProgress[PATH_IDS.HEART]?.completedIds?.length || 0}
                completedPathsData={completedPathsData || []}
              />
            </div>
          </div>

          {/* Vault Unlock Status */}
          {isVaultUnlocked && (
            <div className="mt-8">
              <Card className={cn(
                "bg-duolingo-green border-[3px] border-duolingo-green-dark",
                "rounded-2xl shadow-lg"
              )}>
                <CardContent className="p-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <Sparkles className="h-14 w-14 text-white" strokeWidth={2} fill="currentColor" />
                  </div>
                  <h2 className="mb-2 text-3xl font-black text-white font-doodle">
                    Vault Unlocked!
                  </h2>
                  <p className="mb-6 text-base text-white/90">
                    You've collected all 3 keys. Ready to see your surprise?
                  </p>
                  <Button
                    onClick={() => navigate('/vault')}
                    className={cn(
                      "bg-white text-duolingo-green px-8 py-4 text-xl font-black",
                      "hover:bg-neutral-100 rounded-2xl shadow-md"
                    )}
                  >
                    Open Vault
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-white/50 backdrop-blur-sm mt-auto">
  <div className="mx-auto max-w-md px-6 py-8">
    <div className="flex flex-col items-center gap-6">
      
      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 w-full">
        <Button
          onClick={handleShareProgress}
          disabled={!userId}
          variant="doodle"
          size="sm"
          className="flex-1 gap-2"
        >
          {linkCopied ? (
            <>
              <Check className="h-4 w-4 text-duolingo-green" strokeWidth={3} />
              <span className="text-duolingo-green">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4" strokeWidth={2.5} />
              <span>Share Link</span>
            </>
          )}
        </Button>

        <Button
          onClick={handleLogout}
          variant="doodle"
          size="sm"
          className="flex-1 gap-2"
        >
          <LogOut className="h-4 w-4" strokeWidth={2.5} />
          <span>Logout</span>
        </Button>
      </div>

      {/* Subtle "Made with Love" Branding */}
      <div className="flex items-center gap-2 py-2 px-4 rounded-full bg-neutral-50/50 border border-neutral-100">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
          Birthday Quest
        </span>
        <div className="w-1 h-1 rounded-full bg-neutral-300" />
        <p className="text-[13px] font-bold text-neutral-400 flex items-center gap-1.5">
          Made with <span className="text-error-red animate-pulse">❤️</span>
        </p>
      </div>

    </div>
  </div>
</footer>

      {/* Debug Panel (Tester Only) */}
      <DebugPanel isEnabled={isTester} />
    </div>
  );
};

export default VaultHub;
