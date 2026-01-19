import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { useDebugPanel } from '@/hooks/useDebugPanel';
import { TESTER_THEME } from '@/lib/debug-utils';
import { DateTimeControl } from './DebugSections/DateTimeControl';
import { PathSimulator } from './DebugSections/PathSimulator';
import { ScenarioRunner } from './DebugSections/ScenarioRunner';
import { StateInspector } from './DebugSections/StateInspector';
import { QuickActions } from './DebugSections/QuickActions';
import { QuestSimulatorLauncher } from './DebugSections/QuestSimulatorLauncher';

interface DebugPanelProps {
  isEnabled: boolean;
}

export const DebugPanel = ({ isEnabled }: DebugPanelProps) => {
  const { isOpen, setIsOpen } = useDebugPanel(isEnabled);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['state-inspector'])
  );

  if (!isEnabled) return null;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const sections = [
    { id: 'state-inspector', title: 'State Inspector', component: StateInspector },
    { id: 'quest-simulator', title: 'Quest Simulator', component: QuestSimulatorLauncher },
    { id: 'date-time', title: 'Time Travel', component: DateTimeControl },
    { id: 'path-simulator', title: 'Path Auto-Complete', component: PathSimulator },
    { id: 'scenarios', title: 'One-Click Scenarios', component: ScenarioRunner },
    { id: 'quick-actions', title: 'Quick Actions', component: QuickActions },
  ];

  return (
    <>
      {/* Floating Toggle Button (always visible when enabled) */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg border-2"
          style={{
            backgroundColor: TESTER_THEME.primary,
            borderColor: TESTER_THEME.primaryDark,
          }}
          title="Debug Panel (Ctrl+Shift+D)"
        >
          <Bug className="h-5 w-5 text-white" />
        </motion.button>
      )}

      {/* Debug Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-h-[80vh] overflow-hidden rounded-2xl shadow-2xl border-4"
            style={{
              backgroundColor: 'white',
              borderColor: TESTER_THEME.primary,
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 border-b-2"
              style={{
                backgroundColor: TESTER_THEME.primary,
                borderColor: TESTER_THEME.primaryDark,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bug className="h-5 w-5 text-white" />
                  <h2 className="text-2xl font-black text-white">
                    Debug Panel
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Close Debug Panel"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="mt-1 text-base text-white/80">
                Keyboard: Ctrl+Shift+D
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-4rem)] p-4">
              <div className="space-y-3">
                {sections.map((section) => {
                  const isExpanded = expandedSections.has(section.id);
                  const SectionComponent = section.component;

                  return (
                    <div
                      key={section.id}
                      className="border-2 rounded-xl overflow-hidden"
                      style={{ borderColor: TESTER_THEME.border }}
                    >
                      {/* Section Header */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full px-4 py-3 flex items-center justify-between transition-colors hover:bg-gray-50"
                      >
                        <span className="text-base font-bold" style={{ color: TESTER_THEME.text }}>
                          {section.title}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" style={{ color: TESTER_THEME.primary }} />
                        ) : (
                          <ChevronDown className="h-4 w-4" style={{ color: TESTER_THEME.primary }} />
                        )}
                      </button>

                      {/* Section Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t-2"
                            style={{ borderColor: TESTER_THEME.border }}
                          >
                            <div className="p-4">
                              <SectionComponent />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-4 py-2 border-t-2 text-center text-xs"
              style={{
                backgroundColor: TESTER_THEME.bg,
                borderColor: TESTER_THEME.border,
                color: TESTER_THEME.text,
              }}
            >
              Tester Mode Active
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
