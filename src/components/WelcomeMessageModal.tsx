import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface WelcomeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeMessageModal = ({ isOpen, onClose }: WelcomeMessageModalProps) => {
  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors group"
                aria-label="Close welcome message"
              >
                <X className="h-5 w-5 text-neutral-600 group-hover:text-neutral-900" strokeWidth={2.5} />
              </button>

              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[90vh] p-8 sm:p-12">
                {/* Photo Placeholder */}
         

                {/* Main Title */}
                <motion.h1
                  id="modal-title"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl sm:text-5xl font-black text-neutral-900 mb-6 text-center leading-tight"
                >
                  Welcome to your very own Birthday... Extravaganza!
                </motion.h1>

                {/* Message Content */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6 text-neutral-700"
                >
                  <p className="text-2xl leading-relaxed">
We (Husband 1 through 5) know you said "no gifts," so we’ve collectively decided to ignore that—but in a fun way! We’ve built you a completely personalized digital adventure to celebrate you.                  </p>

                  <p className="text-2xl leading-relaxed">
                    This year, you are the star of your very own  This year, You will have your  very own  <span className="italic font-semibold text-path-heart-pink">"Birthday Quiz Quest."</span>.
                  
                  </p>

                  {/* How It Works Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border-2 border-neutral-100">
                    <h2 className="text-3xl font-black text-neutral-900 mb-4">Here’s the flight plan:</h2>
                    <p className="text-xl leading-relaxed mb-4">
                      <span className="font-bold text-duolingo-green text-2xl ">The Transmission: </span> In 2–3 days, I’ll send you a secret access code to unlock the game hub.
                    </p>
                    <p className="text-xl leading-relaxed mb-4">
                      <span className="font-bold text-duolingo-green text-2xl">The Objectives: </span> You'll face challenges ranging from TV trivia to deep dives into travel.
                    </p>
                    <p className="text-xl leading-relaxed mb-4">
                      <span className="font-bold text-duolingo-green text-2xl">The Guide: </span> Once you're in, look for the green button at the top right of the page for your full instructions.
                    </p>
                  
                    <p className="text-xl leading-relaxed">
That’s all for now. Grab a coffee (Lorelai-sized, obviously) and get ready. See you at the starting line!                    </p>
                  
                  </div>

     
                
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
