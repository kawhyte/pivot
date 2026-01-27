'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Gift } from 'lucide-react';
import { SparklesIcon } from '@/components/icons/SparklesIcon';
import { PATH_METADATA, PATH_IDS } from '@/lib/paths';

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentName?: string;
}

export const WelcomeModal = ({ open, onOpenChange, agentName }: WelcomeModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 bg-warm-cream overflow-hidden border-4 border-duolingo-green">
        {/* Header */}
        <div className="bg-duolingo-green p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="h-8 w-8 text-white" strokeWidth={2.5} />
            <h2 className="text-3xl font-black text-white">
              Your Birthday Quest
            </h2>
            <Gift className="h-8 w-8 text-white" strokeWidth={2.5} />
          </div>
          {agentName && (
            <p className="text-base text-white/90 font-semibold">
              Welcome, {agentName}!
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-center text-base text-neutral-700 font-medium">
            Complete 3 themed quests to unlock  your "not" birthday message!
          </p>

          {/* Path Journey */}
          <div className="space-y-3">
            {/* Day 1 - Pop Culture */}
            <div className="duo-card bg-white p-4 border-l-4" style={{ borderLeftColor: PATH_METADATA[PATH_IDS.POP_CULTURE].colors.primary }}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded-full border-2 border-neutral-300">
                    {/* <span className="text-xs font-bold text-neutral-600">DAY</span> */}
                    <span className="text-base font-black" style={{ color: PATH_METADATA[PATH_IDS.POP_CULTURE].colors.primary }}>
                      1
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-neutral-900 mb-0.5">
                    {PATH_METADATA[PATH_IDS.POP_CULTURE].name}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-1">
                    {PATH_METADATA[PATH_IDS.POP_CULTURE].subtitle}
                  </p>
                  {/* <div className="flex items-center gap-1.5 text-xs font-semibold text-duolingo-green">
                    <SparklesIcon className="h-3.5 w-3.5" />
                    <span>Available Now!</span>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Day 2 - Renaissance */}
            <div className="duo-card bg-white p-4 border-l-4" style={{ borderLeftColor: PATH_METADATA[PATH_IDS.RENAISSANCE].colors.primary }}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded-full border-2 border-neutral-300">
                    {/* <span className="text-xs font-bold text-neutral-600">DAY</span> */}
                    <span className="text-base font-black" style={{ color: PATH_METADATA[PATH_IDS.RENAISSANCE].colors.primary }}>
                      2
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-neutral-900 mb-0.5">
                    {PATH_METADATA[PATH_IDS.RENAISSANCE].name}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-1">
                    {PATH_METADATA[PATH_IDS.RENAISSANCE].subtitle}
                  </p>
                  {/* <p className="text-xs text-neutral-500 font-medium">
                    Unlocks at 8:00 AM after Day 1
                  </p> */}
                </div>
              </div>
            </div>

            {/* Day 3 - Heart */}
            <div className="duo-card bg-white p-4 border-l-4" style={{ borderLeftColor: PATH_METADATA[PATH_IDS.HEART].colors.primary }}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded-full border-2 border-neutral-300">
                    {/* <span className="text-xs font-bold text-neutral-600">DAY</span> */}
                    <span className="text-base font-black" style={{ color: PATH_METADATA[PATH_IDS.HEART].colors.primary }}>
                      3
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-neutral-900 mb-0.5">
                    {PATH_METADATA[PATH_IDS.HEART].name}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-1">
                    {PATH_METADATA[PATH_IDS.HEART].subtitle}
                  </p>
                  {/* <p className="text-xs text-neutral-500 font-medium">
                    Unlocks at 8:00 AM after Day 2
                  </p> */}
                </div>
              </div>
            </div>
          </div>

          {/* Final Message */}
          <div className="duo-card bg-duolingo-green/10 p-4 border-2 border-duolingo-green text-center">
            <p className="text-sm font-bold text-neutral-800">
              Collect all 3 keys to unlock a "not" birthday message!
            </p>
          </div>

          {/* Start Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="w-full duo-button bg-duolingo-green text-white px-8 py-4 text-xl font-black"
          >
            Let's Begin! →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
