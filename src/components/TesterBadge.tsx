import { motion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import { useQuestStore } from '@/store/useQuestStore';

/**
 * Global tester badge that appears on all pages when user is a tester
 * Shows in top-left corner with cyan ghost-mode styling
 */
export const TesterBadge = () => {
  const { isTester, agentName } = useQuestStore();

  if (!isTester) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-4 left-4 z-50 pointer-events-none"
    >
      <motion.div
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="hand-drawn bg-cyan-500 text-white px-3 py-2 shadow-xl border-3 border-cyan-400 flex items-center gap-2"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
        >
          <FlaskConical className="h-4 w-4" strokeWidth={2.5} />
        </motion.div>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-display font-bold">GOD MODE</span>
          <span className="text-[10px] font-accent opacity-90">{agentName}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};
