import React, { useState } from 'react';
import { INITIAL_PANELS, PanelSlice } from './utils/studioEngine';
import { TopBar } from './components/TopBar';
import { InteractiveStudio } from './components/InteractiveStudio';
import { ScrollytellingSection } from './components/ScrollytellingSection';
import { BentoCapabilities } from './components/BentoCapabilities';
import { PricingAndRoi } from './components/PricingAndRoi';
import { LicenseRequestSection } from './components/LicenseRequestSection';
import { ArrowDownRight } from 'lucide-react';

export default function App() {
  const [panels, setPanels] = useState<PanelSlice[]>(INITIAL_PANELS);
  const [selectedTierName, setSelectedTierName] = useState<string>('Full Studio Suite');
  const [selectedMonthlyVolume, setSelectedMonthlyVolume] = useState<number>(24);

  const scrollToStudio = () => {
    const el = document.getElementById('studio');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectTier = (tierName: string, monthlyChapters: number) => {
    setSelectedTierName(tierName);
    setSelectedMonthlyVolume(monthlyChapters);
    const contactEl = document.getElementById('contact');
    if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F4F4F6] surface-grid flex flex-col">
      {/* Strict 3-Zone Top Navigation Bar */}
      <TopBar onFocusStudio={scrollToStudio} />

      <main className="flex-1">
        {/* Hero Proposition Section */}
        <section className="relative pt-16 pb-8 px-6 max-w-7xl mx-auto">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400 mb-5">
              <span className="text-amber-400 font-medium">ScrollBard & WTN Production Engine</span>
              <span aria-hidden="true">·</span>
              <span>Automated Panel Slicing</span>
              <span aria-hidden="true">·</span>
              <span>Syllable-Locked Voice Timing</span>
              <span aria-hidden="true">·</span>
              <span>Native CapCut & Resolve Timelines</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white font-display leading-[1.08] mb-6">
              Transform Vertical Webtoons into{' '}
              <span className="text-amber-400">Frame-Accurate Recap Timelines.</span>
            </h1>

            <p className="text-neutral-300 text-base md:text-lg leading-relaxed max-w-2xl mb-8">
              Stop cropping 18,000-pixel manhwa strips by hand. Slice panels with computer vision, synchronize narration scripts to exact syllable durations, and export multi-track CapCut Desktop or DaVinci Resolve timelines in seconds.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={scrollToStudio}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Launch Interactive Studio
                <ArrowDownRight className="w-4 h-4" />
              </button>
              <a
                href="#story"
                className="inline-flex items-center px-6 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white font-medium text-sm transition-colors whitespace-nowrap shrink-0"
              >
                Inspect 3-Stage Pipeline
              </a>
            </div>
          </div>
        </section>

        {/* 1. Interactive Live Studio Workspace */}
        <InteractiveStudio panels={panels} onUpdatePanels={setPanels} />

        {/* 2. Scroll-Linked & Interactive Horizontal Storyboard Section */}
        <ScrollytellingSection />

        {/* 3. Asymmetric Bento Capabilities + Adjacent Proof Case Studies */}
        <BentoCapabilities panels={panels} />

        {/* 4. Interactive Creator ROI Calculator & Pricing Matrix */}
        <PricingAndRoi onSelectTier={handleSelectTier} />

        {/* 5. Validated Desktop License & Installer Request Form */}
        <LicenseRequestSection
          selectedTierName={selectedTierName}
          selectedMonthlyVolume={selectedMonthlyVolume}
        />
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-white/[0.08] py-12 px-6 bg-[#08080A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs text-neutral-500">
          <div>
            <span className="text-white font-semibold font-display">ScrollBard Studio</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Manhwa & Webtoon Recap Production Suite</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a href="#studio" className="hover:text-neutral-300 transition-colors">
              Interactive Workspace
            </a>
            <a href="#story" className="hover:text-neutral-300 transition-colors">
              Pipeline Architecture
            </a>
            <a href="#features" className="hover:text-neutral-300 transition-colors">
              Bento Capabilities
            </a>
            <a href="#pricing" className="hover:text-neutral-300 transition-colors">
              Studio Licensing
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
