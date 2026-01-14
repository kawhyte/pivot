'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface SuccessOverlayProps {
  show: boolean;
  message?: string;
}

export const SuccessOverlay = ({ show, message = 'AWESOME!' }: SuccessOverlayProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="duo-success-overlay"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
