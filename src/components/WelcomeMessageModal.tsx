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
                <div className="mb-8 flex justify-center">
                  <div className="w-full max-w-md aspect-video rounded-2xl bg-gradient-to-br from-path-pop-purple/20 via-path-renaissance-blue/20 to-path-heart-pink/20 flex items-center justify-center border-4 border-neutral-100 shadow-lg overflow-hidden">
                    {/* Replace this img tag with your actual photo */}
                    <img
                      src="/images/placeholder-photo.jpg"
                      alt="Birthday celebration"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image doesn't exist yet
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {/* Fallback text (hidden when image loads) */}
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-400 font-semibold text-lg">
                      [Your Photo Here]
                    </div>
                  </div>
                </div>

                {/* Main Title */}
                <motion.h1
                  id="modal-title"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl sm:text-5xl font-black text-neutral-900 mb-6 text-center leading-tight"
                >
                  Welcome to your very own birthday... extravaganza!
                </motion.h1>

                {/* Message Content */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6 text-neutral-700"
                >
                  <p className="text-lg leading-relaxed">
                    First, I want to say <span className="font-bold text-neutral-900">Happy Birthday from Husband 1-5</span>. We've all decided to create this personalized (and hopefully fun) experience for you to play.
                  </p>

                  <p className="text-lg leading-relaxed">
                    This year, I made you a pick-your-own <span className="italic font-semibold text-path-heart-pink">"not a gift"</span>.
                  </p>

                  {/* How It Works Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 border-2 border-neutral-100">
                    <h2 className="text-2xl font-black text-neutral-900 mb-4">Here's how it works:</h2>
                    <p className="text-lg leading-relaxed mb-4">
                      In <span className="font-bold text-duolingo-green">3 days</span>, I'll send you a unique code that will give you access to the birthday adventure.
                    </p>
                    <p className="text-lg leading-relaxed">
                      I know you'll want to see instructions for the game, so I made one just for you. You can find it at the <span className="font-semibold">top right of the page</span> when you enter the game hub (it will be a <span className="font-semibold text-duolingo-green">green button</span>).
                    </p>
                  </div>

                  {/* Closing */}
                  <p className="text-2xl font-black text-center text-neutral-900 pt-4">
                    Have fun!
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
