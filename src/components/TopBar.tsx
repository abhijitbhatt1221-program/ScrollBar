import React from 'react';

interface TopBarProps {
  onFocusStudio: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onFocusStudio }) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#0A0A0C]/90 border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="text-lg font-bold tracking-tight text-white font-display whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-amber-500 rounded"
        >
          ScrollBard Studio
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
          <a
            href="#studio"
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Studio
          </a>
          <a
            href="#story"
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Storyline
          </a>
          <a
            href="#features"
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Capabilities
          </a>
          <a
            href="#pricing"
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Pricing
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onFocusStudio}
            className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          >
            Open Studio
          </button>
        </div>
      </div>
    </header>
  );
};
