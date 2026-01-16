import { useNavigate } from 'react-router-dom';
import { Rocket, AlertCircle } from 'lucide-react';
import { TESTER_THEME } from '@/lib/debug-utils';
import { useQuestStore, PATH_METADATA } from '@/store/useQuestStore';

export const QuestSimulatorLauncher = () => {
  const navigate = useNavigate();
  const { unlockedPaths, keysCollected } = useQuestStore();

  const availablePaths = unlockedPaths.filter(pathId => !keysCollected.includes(pathId));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Rocket className="h-4 w-4" style={{ color: TESTER_THEME.primary }} />
        <h3 className="text-sm font-bold" style={{ color: TESTER_THEME.text }}>
          Quest Simulator
        </h3>
      </div>

      <div className="text-xs text-neutral-600 mb-3">
        Navigate to a quest page to see the in-quest simulation toolbar with auto-play scenarios and manual controls.
      </div>

      {availablePaths.length === 0 && (
        <div
          className="p-3 rounded-lg border-2 flex items-start gap-2"
          style={{ borderColor: TESTER_THEME.border, backgroundColor: TESTER_THEME.bg }}
        >
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: TESTER_THEME.primary }} />
          <div className="text-xs" style={{ color: TESTER_THEME.text }}>
            No active paths available. All paths are either locked or already completed.
          </div>
        </div>
      )}

      {availablePaths.length > 0 && (
        <div className="space-y-2">
          {availablePaths.map((pathId) => {
            const pathMeta = PATH_METADATA[pathId];

            return (
              <button
                key={pathId}
                onClick={() => navigate(`/quest/${pathId}`)}
                className="w-full px-3 py-2.5 text-left text-xs font-semibold rounded-lg border-2 transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'white',
                  borderColor: TESTER_THEME.border,
                  color: TESTER_THEME.primary,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-3.5 w-3.5 flex-shrink-0" />
                    <div>
                      <div className="font-bold">Open {pathMeta.name} Simulator</div>
                      <div className="text-xs text-neutral-600">{pathMeta.subtitle}</div>
                    </div>
                  </div>
                  <span className="text-neutral-400">→</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div
        className="p-3 rounded-lg border-2 mt-4"
        style={{ borderColor: TESTER_THEME.border, backgroundColor: TESTER_THEME.bg }}
      >
        <div className="text-xs" style={{ color: TESTER_THEME.text }}>
          <strong>Simulator Features:</strong>
          <ul className="mt-1 ml-4 list-disc space-y-1">
            <li>Manual controls (submit correct/wrong)</li>
            <li>Auto-play scenarios (91%, 100%, threshold)</li>
            <li>Event-driven auto-submission (instant)</li>
            <li>Stop control for running scenarios</li>
            <li>Live progress stats</li>
            <li>Keyboard shortcut: Ctrl+Shift+S</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
