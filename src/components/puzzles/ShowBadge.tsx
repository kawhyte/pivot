'use client';

/**
 * Show-specific branding badges for Pop Culture path puzzles
 * Displays Friends or Gilmore Girls logo based on puzzle metadata
 */

interface ShowBadgeProps {
  show?: 'friends' | 'gilmore';
}

export const ShowBadge = ({ show }: ShowBadgeProps) => {
  if (!show) return null;

  if (show === 'friends') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 border border-purple-300 rounded-full">
        {/* F·R·I·E·N·D·S dot logo style */}
        <div className="flex items-center gap-0.5 text-purple-800 font-bold text-xs tracking-wider uppercase">
          <span>F</span>
          <span className="text-[6px] mb-1">●</span>
          <span>R</span>
          <span className="text-[6px] mb-1">●</span>
          <span>I</span>
          <span className="text-[6px] mb-1">●</span>
          <span>E</span>
          <span className="text-[6px] mb-1">●</span>
          <span>N</span>
          <span className="text-[6px] mb-1">●</span>
          <span>D</span>
          <span className="text-[6px] mb-1">●</span>
          <span>S</span>
        </div>
      </div>
    );
  }

  if (show === 'gilmore') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-full">
        {/* Coffee cup icon for Gilmore Girls */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 text-amber-800"
        >
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <line x1="6" x2="6" y1="2" y2="4" />
          <line x1="10" x2="10" y1="2" y2="4" />
          <line x1="14" x2="14" y1="2" y2="4" />
        </svg>
        <span className="text-amber-800 font-bold text-xs tracking-wider uppercase">
          Gilmore Girls
        </span>
      </div>
    );
  }

  return null;
};
