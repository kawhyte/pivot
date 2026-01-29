import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VaultReveal as VaultRevealComponent } from '@/components/vault/VaultReveal';
import { useQuestStore } from '@/store/useQuestStore';
import { cn } from '@/lib/utils';

const VaultRevealPage = () => {
  const navigate = useNavigate();
  const { isVaultUnlocked } = useQuestStore();
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    // Redirect back to home if vault is not unlocked
    if (!isVaultUnlocked) {
      navigate('/hub');
      return;
    }

    // Small delay before starting reveal sequence
    const timer = setTimeout(() => {
      setShowReveal(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [isVaultUnlocked, navigate]);

  const handleRevealComplete = () => {
    // Navigate to memory storybook (grand finale)
    navigate('/vault/story');
  };

  if (!showReveal) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return <VaultRevealComponent onComplete={handleRevealComplete} />;
};

export default VaultRevealPage;
