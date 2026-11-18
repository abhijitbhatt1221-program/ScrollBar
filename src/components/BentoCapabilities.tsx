import React, { useState } from 'react';
import {
  PanelSlice,
  filterPanelsByConfidence,
  calculateNarrationDuration,
} from '../utils/studioEngine';

interface BentoCapabilitiesProps {
  panels: PanelSlice[];
}

export const BentoCapabilities: React.FC<BentoCapabilitiesProps> = ({ panels }) => {
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.985);
  const [sampleWpm, setSampleWpm] = useState<number>(155);
  const [selectedNleTarget, setSelectedNleTarget] = useState<'capcut' | 'resolve' | 'premiere'>('capcut');

  const matchedPanels = filterPanelsByConfidence(panels, confidenceThreshold);
  const sampleScript =
    'When the third seal fractured across the Northern Citadel, every sovereign clan recognized the blade’s aura.';
  const computedSampleDuration = calculateNarrationDuration(sampleScript, sampleWpm);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  const nleSpecs = {
    capcut: {
      name: 'CapCut Desktop (.json)',
      detail: 'Generates native draft_content.json with pre-sliced local panels, compound keyframes, and synced TTS tracks.',
      saveMetric: 'Saves 2.4 hrs/episode',
    },
    resolve: {
      name: 'DaVinci Resolve 19 (.fcpxml)',
      detail: 'Builds multi-spine FCPXML v1.10 timelines with dynamic zoom transforms and dialogue role assignments.',
      saveMetric: 'Saves 2.8 hrs/episode',
    },
    premiere: {
      name: 'Adobe Premiere Pro (.xml)',
      detail: 'Outputs Final Cut XML v5 sequence manifests compatible with Premiere Pro Motion & Transform bins.',
      saveMetric: 'Saves 2.6 hrs/episode',
    },
  };

  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-6">
      {/* Section Header */}
      <div className="max-w-2xl mb-14">
        <div className="text-xs font-mono text-amber-400 mb-2">
          WTN & ScrollBard Modular Architecture
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white font-display tracking-tight mb-4">
          Engineered for High-Volume Manhwa Recap Studios
        </h2>
        <p className="text-neutral-400 text-base leading-relaxed">
          Every module replaces hours of repetitive cropping, bubble erasing, voiceover slicing, and keyframe placement with deterministic studio tools.
        </p>
      </div>

      {/* Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: 2-Column Span — YOLO Panel Detection & Confidence Tuner */}
        <div
          onMouseMove={handleCardMouseMove}
          className="spotlight-card md:col-span-2 rounded-2xl p-8 flex flex-col justify-between"
        >
          <div className="relative z-10">
            <div className="text-xs font-mono text-amber-400 mb-2">
              01. Computer Vision Slicer
            </div>
            <h3 className="text-2xl font-bold text-white font-display mb-2">
              YOLO v9 Webtoon Panel & Gutter Isolation
            </h3>
            <p className="text-neutral-400 text-sm max-w-xl leading-relaxed">
              Automatically detects angled combat frames, full-bleed vertical scrolls, and inset reaction boxes while ignoring stray sound-effect typography. Test the live confidence filter against the current chapter below:
            </p>
          </div>

          {/* Interactive Confidence Threshold Filter */}
          <div className="relative z-10 mt-8 p-5 rounded-xl bg-[#0A0A0C] border border-white/[0.08] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="yolo-confidence-slider" className="text-xs font-medium text-neutral-300">
                Minimum YOLO Detection Confidence Threshold
              </label>
              <span className="text-xs font-mono text-amber-400 tabular-nums">
                {(confidenceThreshold * 100).toFixed(1)}% Threshold · {matchedPanels.length} of {panels.length} Panels Qualifying
              </span>
            </div>
            <input
              id="yolo-confidence-slider"
              type="range"
              min={0.98}
              max={0.995}
              step={0.001}
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {panels.map((p) => {
                const passes = p.cropBox.confidence >= confidenceThreshold;
                return (
                  <div
                    key={p.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono border tabular-nums transition-colors ${
                      passes
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-white/[0.02] border-white/[0.06] text-neutral-500 line-through'
                    }`}
                  >
                    P0{p.index}: {(p.cropBox.confidence * 100).toFixed(1)}%
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 2: 1-Column Span — Neural Voice Cadence & Breath Aligner */}
        <div
          onMouseMove={handleCardMouseMove}
          className="spotlight-card rounded-2xl p-8 flex flex-col justify-between"
        >
          <div className="relative z-10">
            <div className="text-xs font-mono text-amber-400 mb-2">
              02. Acoustic Pacing Engine
            </div>
            <h3 className="text-2xl font-bold text-white font-display mb-2">
              Syllable-Locked Voice Timing
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Adjust narrator speaking velocity (WPM) and watch how ScrollBard recalculates exact panel hold duration with natural breath padding.
            </p>
          </div>

          <div className="relative z-10 mt-6 p-4 rounded-xl bg-[#0A0A0C] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="wpm-slider" className="text-neutral-300 font-medium">
                Speaking Rate
              </label>
              <span className="font-mono text-amber-400 tabular-nums">{sampleWpm} WPM</span>
            </div>
            <input
              id="wpm-slider"
              type="range"
              min={110}
              max={210}
              step={5}
              value={sampleWpm}
              onChange={(e) => setSampleWpm(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-400">Computed Cut Hold:</span>
              <span className="text-white font-bold tabular-nums">
                {computedSampleDuration.toFixed(1)}s ({Math.round(computedSampleDuration * 60)} frames)
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: 1-Column Span — Speech Bubble Restoration */}
        <div
          onMouseMove={handleCardMouseMove}
          className="spotlight-card rounded-2xl p-8 flex flex-col justify-between"
        >
          <div className="relative z-10">
            <div className="text-xs font-mono text-amber-400 mb-2">
              03. Clean Artwork Recovery
            </div>
            <h3 className="text-xl font-bold text-white font-display mb-2">
              OCR Extraction & Bubble Inpainting
            </h3>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Extracts Korean, Japanese, or English dialogue boxes via optical character recognition while reconstructing underlying linework so your 16:9 camera pans never pass over distracting raw text bubbles.
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-neutral-300">
            <span>OCR Language Packs</span>
            <span className="text-amber-400">KR · JP · EN · ZH</span>
          </div>
        </div>

        {/* Card 4: 2-Column Span — Native NLE Project Compiler */}
        <div
          onMouseMove={handleCardMouseMove}
          className="spotlight-card md:col-span-2 rounded-2xl p-8 flex flex-col justify-between"
        >
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
              <span className="text-xs font-mono text-amber-400">
                04. Direct Timeline Compilation
              </span>
              <span className="text-xs font-mono text-emerald-400 tabular-nums">
                {nleSpecs[selectedNleTarget].saveMetric}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white font-display mb-2">
              Native CapCut, DaVinci Resolve & Premiere Project Interchange
            </h3>
            <p className="text-neutral-400 text-sm max-w-xl leading-relaxed">
              Select your editing suite below to inspect how ScrollBard packages multi-track timelines without intermediate video re-encoding:
            </p>
          </div>

          <div className="relative z-10 mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {(['capcut', 'resolve', 'premiere'] as const).map((target) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => setSelectedNleTarget(target)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedNleTarget === target
                      ? 'bg-amber-500 text-neutral-950 font-semibold'
                      : 'bg-[#0A0A0C] text-neutral-300 border border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  {nleSpecs[target].name}
                </button>
              ))}
            </div>
            <div className="p-4 rounded-xl bg-[#0A0A0C] border border-white/[0.08] text-xs text-neutral-300 leading-relaxed">
              {nleSpecs[selectedNleTarget].detail}
            </div>
          </div>
        </div>
      </div>

      {/* Adjacent Proof of Impact / Creator Case Studies (Claim-to-Proof Adjacency) */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-[#121216] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mb-1">
              +310% Monthly Episode Output
            </div>
            <div className="text-xs text-neutral-400 mb-4">
              Measured over 90 days · 18-chapter fantasy manhwa series
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              “Cutting 80-panel chapters in Photoshop and keyframing in CapCut took our editors 14 hours per video. With ScrollBard’s YOLO slicer and CapCut JSON export, we finish a 25-minute narrated recap in 95 minutes.”
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-white/[0.06] text-xs text-neutral-400">
            <span className="text-white font-semibold">Min-Jae Park</span> · Lead Producer, AsuraRecap Studio (640K Subscribers)
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#121216] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums mb-1">
              19.4 hrs Saved Weekly
            </div>
            <div className="text-xs text-neutral-400 mb-4">
              Solo Creator Workflow · DaVinci Resolve 19 Pipeline
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              “The syllable-locked voice timing eliminated dead air between cuts. Every FCPXML timeline opens in DaVinci Resolve with my camera zooms and narration stems already aligned to the frame.”
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-white/[0.06] text-xs text-neutral-400">
            <span className="text-white font-semibold">Elena Vance</span> · Creator, Nocturne Manhwa Archives (290K Subscribers)
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#121216] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mb-1">
              99.2% Bubble Clean Rate
            </div>
            <div className="text-xs text-neutral-400 mb-4">
              Across 4,500+ Action & Murim Panels Processed
            </div>
            <p className="text-sm text-neutral-300 leading-relaxed">
              “Before WTN & ScrollBard, speech bubbles ruined close-up Ken Burns pans. The automated OCR extraction and background linework restoration makes every frame look like an official anime storyboard.”
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-white/[0.06] text-xs text-neutral-400">
            <span className="text-white font-semibold">Kenji Takahashi</span> · Technical Director, Sekai Recap Network
          </div>
        </div>
      </div>
    </section>
  );
};
