import { useState } from 'react';
import { RefreshCw, Trash2, Database } from 'lucide-react';
import { TESTER_THEME } from '@/lib/debug-utils';
import { useQuestStore } from '@/store/useQuestStore';

export const QuickActions = () => {
  const { agentId, hydrateFromDatabase, resetQuest } = useQuestStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClearLocalStorage = () => {
    if (!confirm('Clear all localStorage data? (Auth will persist via database)')) {
      return;
    }

    localStorage.removeItem('birthday-quest-seen-welcome');
    localStorage.removeItem('quest-store');
    alert('localStorage cleared! Refresh page to see changes.');
  };

  const handleForceHydration = async () => {
    if (!agentId) {
      alert('Not logged in!');
      return;
    }

    setIsProcessing(true);
    try {
      await hydrateFromDatabase(agentId);
      alert('Force hydration complete! State reloaded from database.');
    } catch (error) {
      console.error('Hydration failed:', error);
      alert('Hydration failed. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFullReset = () => {
    if (!confirm('Full reset? This will logout and clear all client data!')) {
      return;
    }

    resetQuest();
    window.location.href = '/';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <RefreshCw className="h-4 w-4" style={{ color: TESTER_THEME.primary }} />
        <h3 className="text-sm font-bold" style={{ color: TESTER_THEME.text }}>
          Quick Actions
        </h3>
      </div>

      <div className="text-xs text-neutral-600 mb-3">
        Utility actions for debugging and testing.
      </div>

      <div className="space-y-2">
        <button
          onClick={handleClearLocalStorage}
          disabled={isProcessing}
          className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'white',
            borderColor: TESTER_THEME.border,
            color: TESTER_THEME.primary,
          }}
        >
          <div className="flex items-center gap-2">
            <Trash2 className="h-3.5 w-3.5 flex-shrink-0" />
            <div>
              <div className="font-bold">Clear localStorage</div>
              <div className="text-xs text-neutral-600">Reset welcome modal flag</div>
            </div>
          </div>
        </button>

        <button
          onClick={handleForceHydration}
          disabled={isProcessing}
          className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'white',
            borderColor: TESTER_THEME.border,
            color: TESTER_THEME.primary,
          }}
        >
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 flex-shrink-0" />
            <div>
              <div className="font-bold">Force Database Hydration</div>
              <div className="text-xs text-neutral-600">Reload state from Supabase</div>
            </div>
          </div>
        </button>

        <button
          onClick={handleFullReset}
          disabled={isProcessing}
          className="w-full px-3 py-2 text-left text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
          style={{
            backgroundColor: '#FEE2E2',
            borderColor: '#EF4444',
            color: '#DC2626',
          }}
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 flex-shrink-0" />
            <div>
              <div className="font-bold">Full Reset (Logout)</div>
              <div className="text-xs opacity-75">Clear all client data and logout</div>
            </div>
          </div>
        </button>
      </div>

      {isProcessing && (
        <div className="text-xs text-center" style={{ color: TESTER_THEME.primary }}>
          Processing...
        </div>
      )}
    </div>
  );
};
