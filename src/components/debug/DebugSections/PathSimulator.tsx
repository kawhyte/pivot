import { useState } from 'react';
import { Zap, Target, SkipForward, Trash2 } from 'lucide-react';
import { pathSimulator, TESTER_THEME } from '@/lib/debug-utils';
import { useQuestStore } from '@/store/useQuestStore';
import { PATH_IDS, PATH_METADATA } from '@/lib/paths';
import type { PathId } from '@/lib/paths';

export const PathSimulator = () => {
  const { agentId, hydrateFromDatabase } = useQuestStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPath, setSelectedPath] = useState<PathId>(PATH_IDS.POP_CULTURE);

  const handleComplete = async (scenario: 'perfect' | 'threshold' | 'skips') => {
    if (!agentId) {
      alert('Not logged in!');
      return;
    }

    setIsProcessing(true);
    try {
      switch (scenario) {
        case 'perfect':
          await pathSimulator.completePerfect(selectedPath, agentId);
          break;
        case 'threshold':
          await pathSimulator.completeThreshold(selectedPath, agentId);
          break;
        case 'skips':
          await pathSimulator.completeWithSkips(selectedPath, agentId);
          break;
      }

      // Re-hydrate from database
      await hydrateFromDatabase(agentId);

      alert(`Path completed with ${scenario} scenario!`);
    } catch (error) {
      console.error('Path completion failed:', error);
      alert('Completion failed. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    if (!agentId) {
      alert('Not logged in!');
      return;
    }

    setIsProcessing(true);
    try {
      await pathSimulator.reset(selectedPath, agentId);

      // Re-hydrate from database
      await hydrateFromDatabase(agentId);

      alert('Path reset!');
    } catch (error) {
      console.error('Path reset failed:', error);
      alert('Reset failed. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-4 w-4" style={{ color: TESTER_THEME.primary }} />
        <h3 className="text-sm font-bold" style={{ color: TESTER_THEME.text }}>
          Path Auto-Complete
        </h3>
      </div>

      <div className="text-xs text-neutral-600 mb-3">
        Instantly complete paths with different scenarios.
      </div>

      {/* Path Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-700">Select Path:</label>
        <select
          value={selectedPath}
          onChange={(e) => setSelectedPath(parseInt(e.target.value) as PathId)}
          className="w-full px-3 py-2 text-xs border-2 rounded-lg"
          style={{ borderColor: TESTER_THEME.border }}
        >
          <option value={PATH_IDS.POP_CULTURE}>{PATH_METADATA[PATH_IDS.POP_CULTURE].name}</option>
          <option value={PATH_IDS.RENAISSANCE}>{PATH_METADATA[PATH_IDS.RENAISSANCE].name}</option>
          <option value={PATH_IDS.HEART}>{PATH_METADATA[PATH_IDS.HEART].name}</option>
        </select>
      </div>

      {/* Completion Scenarios */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleComplete('perfect')}
          disabled={isProcessing}
          className="px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'white',
            borderColor: TESTER_THEME.border,
            color: TESTER_THEME.primary,
          }}
        >
          <Target className="h-3 w-3 mx-auto mb-1" />
          Perfect 100%
        </button>

        <button
          onClick={() => handleComplete('threshold')}
          disabled={isProcessing}
          className="px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'white',
            borderColor: TESTER_THEME.border,
            color: TESTER_THEME.primary,
          }}
        >
          <Target className="h-3 w-3 mx-auto mb-1" />
          Threshold 93%
        </button>

        <button
          onClick={() => handleComplete('skips')}
          disabled={isProcessing}
          className="px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'white',
            borderColor: TESTER_THEME.border,
            color: TESTER_THEME.primary,
          }}
        >
          <SkipForward className="h-3 w-3 mx-auto mb-1" />
          With Skips
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
          <Trash2 className="h-3 w-3 mx-auto mb-1" />
          Reset Path
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
