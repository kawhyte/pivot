'use client';

import { resetUserProgress } from '@/app/actions/quest';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';

interface ResetProgressButtonProps {
  userId: number;
}

const ResetProgressButton = ({ userId }: ResetProgressButtonProps) => {
  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    const confirmed = window.confirm(
      `⚠️ Are you sure you want to reset all progress for User #${userId}? This cannot be undone.`
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await resetUserProgress(userId);

      if (!result.success) {
        alert(result.error || 'Failed to reset progress. Please try again.');
      }
    });
  };

  return (
    <button
      onClick={handleReset}
      disabled={isPending}
      className={`
        flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium
        transition-colors
        ${
          isPending
            ? 'cursor-not-allowed bg-red-600/50 text-white'
            : 'bg-red-600 text-white hover:bg-red-700'
        }
      `}
    >
      {isPending ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Resetting...
        </>
      ) : (
        'Reset'
      )}
    </button>
  );
};

export default ResetProgressButton;
