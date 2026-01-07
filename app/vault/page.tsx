'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VaultReveal } from '@/components/vault/VaultReveal';
import { useQuestStore } from '@/store/useQuestStore';

const VaultPage = () => {
  const router = useRouter();
  const { isVaultUnlocked } = useQuestStore();
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    // Redirect back to home if vault is not unlocked
    if (!isVaultUnlocked) {
      router.push('/');
      return;
    }

    // Small delay before starting reveal sequence
    const timer = setTimeout(() => {
      setShowReveal(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [isVaultUnlocked, router]);

  const handleRevealComplete = () => {
    // TODO: Navigate to final gift page or show modal
    // For now, just go back to vault
    router.push('/');
  };

  if (!showReveal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return <VaultReveal onComplete={handleRevealComplete} />;
};

export default VaultPage;
