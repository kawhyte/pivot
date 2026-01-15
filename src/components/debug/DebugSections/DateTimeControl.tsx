import { useState } from 'react';
import { Clock, FastForward, RotateCcw } from 'lucide-react';
import { timeTravel, TESTER_THEME } from '@/lib/debug-utils';
import { useQuestStore } from '@/store/useQuestStore';

export const DateTimeControl = () => {
  const { agentId, completedPathsData, hydrateFromDatabase } = useQuestStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFastForward = async (days: number) => {
    if (!agentId || completedPathsData.length === 0) {
      alert('No completed paths to fast-forward!');
      return;
    }

    setIsProcessing(true);
    try {
      await timeTravel.addDays(days, completedPathsData, agentId);

      // Re-hydrate from database
      await hydrateFromDatabase(agentId);

      alert(`Fast-forwarded ${days} day(s)! Check unlock times.`);
    } catch (error) {
      console.error('Fast-forward failed:', error);
      alert('Fast-forward failed. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    if (!agentId || completedPathsData.length === 0) {
      alert('No completed paths to reset!');
      return;
    }

    setIsProcessing(true);
    try {
      await timeTravel.reset(completedPathsData, agentId);

      // Re-hydrate from database
      await hydrateFromDatabase(agentId);

      alert('Unlock times reset to original values!');
    } catch (error) {
      console.error('Reset failed:', error);
      alert('Reset failed. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4" style={{ color: TESTER_THEME.primary }} />
        <h3 className="text-sm font-bold" style={{ color: TESTER_THEME.text }}>
          Time Travel Controls
        </h3>
      </div>

      <div className="text-xs text-neutral-600 mb-3">
        Simulate days passing to test unlock schedules. Subtracts time from unlock dates.
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleFastForward(1)}
          disabled={isProcessing}
          className="px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'white',
            borderColor: TESTER_THEME.border,
            color: TESTER_THEME.primary,
          }}
        >
          <FastForward className="h-3 w-3 mx-auto mb-1" />
          +1 Day
        </button>

        <button
          onClick={() => handleFastForward(7)}
          disabled={isProcessing}
          className="px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'white',
            borderColor: TESTER_THEME.border,
            color: TESTER_THEME.primary,
          }}
        >
          <FastForward className="h-3 w-3 mx-auto mb-1" />
          +7 Days
        </button>

        <button
          onClick={handleReset}
          disabled={isProcessing}
          className="px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'white',
            borderColor: TESTER_THEME.border,
            color: TESTER_THEME.primary,
          }}
        >
          <RotateCcw className="h-3 w-3 mx-auto mb-1" />
          Reset
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
