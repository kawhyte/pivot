import { Eye, Lock, Unlock, Database } from 'lucide-react';
import { KeyIcon } from '@/components/icons/KeyIcon';
import { inspector, TESTER_THEME } from '@/lib/debug-utils';
import { useQuestStore } from '@/store/useQuestStore';
import { PATH_METADATA } from '@/lib/paths';

export const StateInspector = () => {
  const state = useQuestStore();
  const { keysCollected, unlockedPaths, isVaultUnlocked, completedPathsData, pathProgress } = state;

  const handleLogState = () => {
    inspector.logState(state);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Eye className="h-4 w-4" style={{ color: TESTER_THEME.primary }} />
        <h3 className="text-base font-bold" style={{ color: TESTER_THEME.text }}>
          State Inspector
        </h3>
      </div>

      <div className="text-base text-neutral-600 mb-3">
        Real-time view of quest state and progress.
      </div>

      {/* Keys Collected */}
      <div className="p-3 rounded-lg border-2" style={{ borderColor: TESTER_THEME.border, backgroundColor: TESTER_THEME.bg }}>
        <div className="flex items-center gap-2 mb-2">
          <KeyIcon className="h-3.5 w-3.5" color={TESTER_THEME.primary} />
          <span className="text-base font-bold" style={{ color: TESTER_THEME.text }}>
            Keys Collected: {keysCollected.length} / 3
          </span>
        </div>
        <div className="text-base text-neutral-700">
          {keysCollected.length === 0 ? (
            'No keys yet'
          ) : (
            keysCollected.map((pathId) => PATH_METADATA[pathId]?.name).join(', ')
          )}
        </div>
      </div>

      {/* Unlocked Paths */}
      <div className="p-3 rounded-lg border-2" style={{ borderColor: TESTER_THEME.border, backgroundColor: TESTER_THEME.bg }}>
        <div className="flex items-center gap-2 mb-2">
          <Unlock className="h-3.5 w-3.5" style={{ color: TESTER_THEME.primary }} />
          <span className="text-base font-bold" style={{ color: TESTER_THEME.text }}>
            Unlocked Paths: {unlockedPaths.length} / 3
          </span>
        </div>
        <div className="text-base text-neutral-700">
          {unlockedPaths.length === 0 ? (
            'No paths unlocked'
          ) : (
            unlockedPaths.map((pathId) => PATH_METADATA[pathId]?.name).join(', ')
          )}
        </div>
      </div>

      {/* Vault Status */}
      <div className="p-3 rounded-lg border-2" style={{ borderColor: TESTER_THEME.border, backgroundColor: TESTER_THEME.bg }}>
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-3.5 w-3.5" style={{ color: TESTER_THEME.primary }} />
          <span className="text-base font-bold" style={{ color: TESTER_THEME.text }}>
            Vault Status
          </span>
        </div>
        <div className="text-base text-neutral-700">
          {isVaultUnlocked ? '🎉 Unlocked!' : '🔒 Locked'}
        </div>
      </div>

      {/* Completed Paths Data */}
      {completedPathsData.length > 0 && (
        <div className="p-3 rounded-lg border-2" style={{ borderColor: TESTER_THEME.border, backgroundColor: TESTER_THEME.bg }}>
          <div className="flex items-center gap-2 mb-2">
            <Database className="h-3.5 w-3.5" style={{ color: TESTER_THEME.primary }} />
            <span className="text-basefont-bold" style={{ color: TESTER_THEME.text }}>
              Next Unlock Times
            </span>
          </div>
          <div className="space-y-1">
            {completedPathsData.map((path) => (
              <div key={path.pathId} className="text-base text-neutral-700">
                <strong>{PATH_METADATA[path.pathId]?.name}:</strong>{' '}
                {path.nextPathUnlockAt ? (
                  <>
                    {inspector.formatUnlockTime(path.nextPathUnlockAt)}{' '}
                    <span className="text-neutral-500">
                      ({inspector.getHoursUntilUnlock(path.nextPathUnlockAt)}h remaining)
                    </span>
                  </>
                ) : (
                  'N/A'
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Path Progress Summary */}
      <div className="p-3 rounded-lg border-2" style={{ borderColor: TESTER_THEME.border, backgroundColor: TESTER_THEME.bg }}>
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-3.5 w-3.5" style={{ color: TESTER_THEME.primary }} />
          <span className="text-base font-bold" style={{ color: TESTER_THEME.text }}>
            Path Progress
          </span>
        </div>
        <div className="space-y-1">
          {Object.entries(pathProgress).map(([pathId, progress]) => (
            <div key={pathId} className="text-base text-neutral-700">
              <strong>{PATH_METADATA[Number(pathId)]?.name}:</strong>{' '}
              {progress.completedIds.length} completed, {progress.skippedIds.length} skipped
            </div>
          ))}
        </div>
      </div>

      {/* Console Log Button */}
      <button
        onClick={handleLogState}
        className="w-full px-3 py-2 text-base font-semibold rounded-lg border-2 transition-all"
        style={{
          backgroundColor: 'white',
          borderColor: TESTER_THEME.border,
          color: TESTER_THEME.primary,
        }}
      >
        Log Full State to Console
      </button>
    </div>
  );
};
