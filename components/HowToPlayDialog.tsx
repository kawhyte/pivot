'use client';

import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, Heart, Trophy, Target, Zap, Sparkles, Gift } from 'lucide-react';

interface HowToPlayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HowToPlayDialog = ({ open, onOpenChange }: HowToPlayDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-soft-white hand-drawn-border border-4 border-starbucks-green p-0">
        {/* Hand-Drawn Header with Doodles */}
        <div className="relative bg-gradient-to-br from-celebration-pink/20 to-celebration-gold/20 p-8 border-b-4 border-starbucks-green/20">
          {/* Decorative Doodles */}
          <Star className="absolute top-3 right-3 h-8 w-8 text-celebration-gold/40 animate-pulse" fill="currentColor" />
          <Star className="absolute top-8 left-4 h-6 w-6 text-celebration-pink/40" fill="currentColor" />
          <Heart className="absolute bottom-4 right-8 h-7 w-7 text-celebration-pink/40 animate-bounce" fill="currentColor" />
          <Sparkles className="absolute bottom-3 left-3 h-6 w-6 text-celebration-gold/40" />

          <DialogHeader>
            <DialogTitle className="text-center">
              <motion.h2
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="text-4xl font-display text-starbucks-green mb-2"
              >
                🎯 How to Play
              </motion.h2>
              <p className="font-accent text-base text-deep-brown/70 italic">
                Your Guide to Birthday Quest Success!
              </p>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 font-accent text-deep-brown/80">
          {/* Mission Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 hand-drawn-card border-2 border-starbucks-green/30"
          >
            <div className="flex items-start gap-3">
              <Trophy className="h-8 w-8 text-starbucks-green flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-display text-starbucks-green mb-2">
                  Your Mission
                </h3>
                <p className="text-base leading-relaxed">
                  Complete <strong>3 themed quest paths</strong> to collect keys and unlock
                  the Grand Vault containing your birthday surprise!
                </p>
              </div>
            </div>
          </motion.div>

          {/* The 3 Paths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-display text-starbucks-green mb-3 flex items-center gap-2">
              <Gift className="h-6 w-6" />
              The 3 Quest Paths
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="hand-drawn-card bg-celebration-pink/10 p-4 border-2 border-celebration-pink/50">
                <Trophy className="h-7 w-7 mx-auto mb-2 text-celebration-pink" />
                <h4 className="font-display text-sm text-center mb-1">Pop Culture</h4>
                <p className="text-xs text-center text-deep-brown/60">TV shows, movies & entertainment trivia</p>
              </div>
              <div className="hand-drawn-card bg-celebration-gold/10 p-4 border-2 border-celebration-gold/50">
                <Star className="h-7 w-7 mx-auto mb-2 text-celebration-gold" fill="currentColor" />
                <h4 className="font-display text-sm text-center mb-1">Renaissance</h4>
                <p className="text-xs text-center text-deep-brown/60">General knowledge & fascinating facts</p>
              </div>
              <div className="hand-drawn-card bg-starbucks-green/10 p-4 border-2 border-starbucks-green/50">
                <Heart className="h-7 w-7 mx-auto mb-2 text-starbucks-green" fill="currentColor" />
                <h4 className="font-display text-sm text-center mb-1">Heart</h4>
                <p className="text-xs text-center text-deep-brown/60">Personal memories & special moments</p>
              </div>
            </div>
          </motion.div>

          {/* Point System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-5 hand-drawn-card border-2 border-celebration-gold/30"
          >
            <div className="flex items-start gap-3">
              <Target className="h-8 w-8 text-celebration-gold flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-xl font-display text-starbucks-green mb-3">
                  Point System
                </h3>
                <div className="space-y-2 text-base">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      1
                    </div>
                    <p><strong>Easy</strong> questions = 1 point each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      2
                    </div>
                    <p><strong>Medium</strong> questions = 2 points each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      3
                    </div>
                    <p><strong>Hard</strong> questions = 3 points each</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-celebration-gold/10 rounded-lg border-2 border-celebration-gold/30">
                  <p className="text-sm">
                    <Zap className="inline h-4 w-4 mr-1 text-celebration-gold" />
                    Reach the <strong>target score</strong> on each path to earn your key!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Perfect Run Bonus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-celebration-pink/20 to-celebration-gold/20 p-5 hand-drawn-card border-2 border-celebration-pink/50"
          >
            <div className="flex items-start gap-3">
              <Sparkles className="h-8 w-8 text-celebration-pink flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-display text-starbucks-green mb-2">
                  Perfect Run Bonus 🎁
                </h3>
                <p className="text-base leading-relaxed">
                  Answer <strong>every question correctly</strong> on your <strong>first try</strong> to
                  unlock a <span className="text-celebration-pink font-bold">special bonus surprise!</span> Challenge
                  yourself to achieve perfection!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-starbucks-green/5 p-5 rounded-lg border-2 border-starbucks-green/20"
          >
            <h3 className="text-lg font-display text-starbucks-green mb-3">
              💡 Pro Tips
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-starbucks-green font-bold">•</span>
                <span>Take your time! There's no time limit on questions.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-starbucks-green font-bold">•</span>
                <span>Use hints if you get stuck—they won't affect your score!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-starbucks-green font-bold">•</span>
                <span>Complete paths in any order you prefer.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-starbucks-green font-bold">•</span>
                <span>Your progress is automatically saved!</span>
              </li>
            </ul>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
            className="text-center pt-4"
          >
            <p className="text-lg font-accent text-deep-brown/70 italic">
              Ready to begin your birthday adventure? ✨
            </p>
            <button
              onClick={() => onOpenChange(false)}
              className="mt-4 hand-drawn bg-starbucks-green text-white px-8 py-3 font-display text-lg hover:bg-starbucks-green/90 transition-colors shadow-lg"
            >
              Let's Go! 🚀
            </button>
          </motion.div>
        </div>

        {/* Decorative Footer Doodles */}
        <div className="h-16 bg-gradient-to-br from-celebration-gold/10 to-celebration-pink/10 border-t-4 border-starbucks-green/20 relative">
          <Star className="absolute top-3 left-1/4 h-5 w-5 text-celebration-gold/30" fill="currentColor" />
          <Heart className="absolute top-3 right-1/4 h-5 w-5 text-celebration-pink/30" fill="currentColor" />
          <Gift className="absolute top-3 left-1/2 -translate-x-1/2 h-6 w-6 text-starbucks-green/30" />
        </div>
      </DialogContent>
    </Dialog>
  );
};
