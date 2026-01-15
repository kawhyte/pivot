import { useState } from 'react';
import { Play, TestTube2 } from 'lucide-react';
import { scenarios, TESTER_THEME } from '@/lib/debug-utils';
import { useQuestStore } from '@/store/useQuestStore';

export const ScenarioRunner = () => {
  const { agentId, hydrateFromDatabase } = useQuestStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScenario = async (scenario: 'unlock' | 'vault' | 'threshold' | 'reset') => {
    if (!agentId) {
      alert('Not logged in!');
      return;
    }

    setIsProcessing(true);
    try {
      switch (scenario) {
        case 'unlock':
          await scenarios.testUnlockFlow(agentId);
          break;
        case 'vault':
          await scenarios.testVaultUnlock(agentId);
          break;
        case 'threshold':
          await scenarios.testThreshold(agentId);
          break;
        case 'reset':
          if (confirm('Are you sure? This will reset ALL progress!')) {
            await scenarios.resetAll(agentId);
          }
          break;
      }

      // Re-hydrate from database
      await hydrateFromDatabase(agentId);

      alert('Scenario complete! Check results.');
    } catch (error) {
      console.error('Scenario failed:', error);
      alert('Scenario failed. Check console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Play className="h-4 w-4" style={{ color: TESTER_THEME.primary }} />
        <h3 className="text-sm font-bold" style={{ color: TESTER_THEME.text }}>
          One-Click Scenarios
        </h3>
      </div>

      <div className="text-xs text-neutral-600 mb-3">
        Run pre-built test scenarios instantly.
      </div>

      <div className="space-y-2">
        <button
          onClick={() => handleScenario('unlock')}
          disabled={isProcessing}
          className="w-full px-3 py-2.5 text-left text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'white',
            borderColor: TESTER_THEME.border,
            color: TESTER_THEME.primary,
          }}
        >
          <div className="flex items-center gap-2">
            <TestTube2 className="h-3.5 w-3.5 flex-shrink-0" />
            <div>
              <div className="font-bold">Test Unlock Flow</div>
              <div className="text-xs text-neutral-600">Complete Pop → Check Renaissance countdown</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleScenario('vault')}
          disabled={isProcessing}
          className="w-full px-3 py-2.5 text-left text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'white',
            borderColor: TESTER_THEME.border,
            color: TESTER_THEME.primary,
          }}
        >
          <div className="flex items-center gap-2">
            <TestTube2 className="h-3.5 w-3.5 flex-shrink-0" />
            <div>
              <div className="font-bold">Test Vault Unlock</div>
              <div className="text-xs text-neutral-600">Complete all 3 paths → Open vault</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleScenario('threshold')}
          disabled={isProcessing}
          className="w-full px-3 py-2.5 text-left text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
          style={{
            backgroundColor: 'white',
            borderColor: TESTER_THEME.border,
            color: TESTER_THEME.primary,
          }}
        >
          <div className="flex items-center gap-2">
            <TestTube2 className="h-3.5 w-3.5 flex-shrink-0" />
            <div>
              <div className="font-bold">Test Threshold Modal</div>
              <div className="text-xs text-neutral-600">Complete at exactly 93%</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleScenario('reset')}
          disabled={isProcessing}
          className="w-full px-3 py-2.5 text-left text-xs font-semibold rounded-lg border-2 transition-all disabled:opacity-50"
          style={{
            backgroundColor: '#FEE2E2',
            borderColor: '#EF4444',
            color: '#DC2626',
          }}
        >
          <div className="flex items-center gap-2">
            <TestTube2 className="h-3.5 w-3.5 flex-shrink-0" />
            <div>
              <div className="font-bold">Reset All Progress</div>
              <div className="text-xs opacity-75">Nuclear option - clears everything</div>
            </div>
          </div>
        </button>
      </div>

      {isProcessing && (
        <div className="text-xs text-center" style={{ color: TESTER_THEME.primary }}>
          Running scenario...
        </div>
      )}
    </div>
  );
};
