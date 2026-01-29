import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuestStore } from '@/store/useQuestStore';
import { getStorybookPages } from '@/data/storybook';
import { StorybookViewer } from '@/components/vault/StorybookViewer';
import { Button } from '@/components/ui/button';

/**
 * Memory Storybook Page
 *
 * The grand finale of the birthday experience - a personalized storybook
 * of memories that is revealed after all 3 keys are collected.
 *
 * Flow:
 * 1. Auth guard: Redirects to /hub if vault not unlocked
 * 2. Tier detection: Checks if user completed Sudden Death (VIP)
 * 3. Data filtering: Shows base or base+VIP pages
 * 4. Renders StorybookViewer with navigation
 */
export default function MemoryStorybook() {
  const navigate = useNavigate();
  const { isVaultUnlocked, isTester, pathUnlockStatus, _hasHydrated } =
    useQuestStore();

  // Auth guard: Redirect if vault not unlocked (with tester bypass)
  useEffect(() => {
    if (_hasHydrated && !isVaultUnlocked && !isTester) {
      navigate('/hub');
    }
  }, [isVaultUnlocked, isTester, _hasHydrated, navigate]);

  // Show loading state during hydration
  if (!_hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffdf5]">
        <div className="animate-spin h-12 w-12 border-4 border-duolingo-green border-t-transparent rounded-full" />
      </div>
    );
  }

  // Detect VIP tier: Check if any path has bonus unlocked
  const hasAnyBonus = Object.values(pathUnlockStatus).some(
    (status) => status?.isBonusUnlocked === true
  );

  // Get tier-appropriate pages
  const pages = getStorybookPages(hasAnyBonus);

  // Empty content fallback (should never happen with seeded data)
  if (pages.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 bg-[#fffdf5]">
        <div className="text-center space-y-6">
          <p className="text-2xl text-neutral-600">
            No memories to show yet...
          </p>
          <Button onClick={() => navigate('/hub')} variant="doodle">
            Return to Vault
          </Button>
        </div>
      </div>
    );
  }

  // Render storybook viewer
  return <StorybookViewer pages={pages} isVIP={hasAnyBonus} />;
}
