import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, Layers, Sparkles, Film } from 'lucide-react';

interface StoryChapter {
  index: string;
  chapterTitle: string;
  headline: string;
  accentPhrase: string;
  description: string;
  metricPrimary: string;
  metricPrimaryLabel: string;
  metricSecondary: string;
  metricSecondaryLabel: string;
  mechanismSteps: string[];
  codePreview: string;
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    index: 'Chapter 1',
    chapterTitle: 'Automated Panel Detection',
    headline: 'Slice 18,000px Webtoon Strips into',
    accentPhrase: 'Clean Cinematic Frames.',
    description:
      'Long-scroll webtoon chapters contain irregular gutter spacing, floating sound effects, and overlapping dialogue balloons. ScrollBard’s computer-vision detector isolates each dramatic panel border in milliseconds and inpaints speech bubbles cleanly.',
    metricPrimary: '99.4%',
    metricPrimaryLabel: 'Panel Boundary Precision across 1,200+ Manhwa Series',
    metricSecondary: '1.8 sec',
    metricSecondaryLabel: 'Average Processing Time per 70-Panel Chapter',
    mechanismSteps: [
      'Ingests raw vertical .webp, .png, or stitched chapter folders up to 32,000px tall',
      'Detects tilted action borders and split-panel reveals without clipping character art',
      'Optional text-layer extraction separates dialogue balloons from background illustration',
    ],
    codePreview: `detector.scanChapter("citadel_ch14.webp", {
  minConfidence: 0.96,
  inpaintSpeechBubbles: true,
  aspectTarget: "16:9_safe_crop"
}); // -> 48 clean slices exported in 1.42s`,
  },
  {
    index: 'Chapter 2',
    chapterTitle: 'Contextual Script & Voice Sync',
    headline: 'Turn Visual Beats into',
    accentPhrase: 'Paced Narrative Recaps.',
    description:
      'Instead of writing disconnected descriptions, the scene analyzer tracks character continuity across the entire chapter arc—generating natural recap narration and locking every panel duration to the exact spoken syllable cadence.',
    metricPrimary: '0.02s',
    metricPrimaryLabel: 'Audio-to-Cut Alignment Drift across 20-Minute Recaps',
    metricSecondary: '24 Voices',
    metricSecondaryLabel: 'Studio-Grade Neural Narrators with Emotion Control',
    mechanismSteps: [
      'Cross-references character names and lore glossary across multi-chapter projects',
      'Synthesizes 48kHz WAV voiceovers with automatic breath-pause trimming',
      'Dynamically stretches or splits long vertical panels to match narration phrasing',
    ],
    codePreview: `narrator.synthesizeTimeline(slices, {
  voiceProfile: "Seong-Jin_Baritone",
  pacingMode: "syllable_locked",
  breathTrimDb: -42
}); // -> 100% frame-locked WAV + SRT captions`,
  },
  {
    index: 'Chapter 3',
    chapterTitle: 'Non-Destructive NLE Timeline Export',
    headline: 'Skip Manual Keyframing.',
    accentPhrase: 'Open Ready in CapCut & Resolve.',
    description:
      'Exporting a flat MP4 locks you out of creative tweaks. ScrollBard compiles native CapCut Desktop JSON drafts, DaVinci Resolve FCPXML, and Premiere Pro XML timelines with editable Ken Burns pan/zoom curves and separate audio stems.',
    metricPrimary: '8.9x',
    metricPrimaryLabel: 'Faster End-to-End Episode Production for Recap Channels',
    metricSecondary: '60 FPS',
    metricSecondaryLabel: 'Sub-Pixel Bezier Pan & Zoom Keyframe Curves',
    mechanismSteps: [
      'Generates native CapCut draft_content.json with pre-linked local asset paths',
      'Embeds smooth cubic-bezier scale and vertical pan keyframes on every clip',
      'Separates narration stems, SFX markers, and caption tracks for instant polish',
    ],
    codePreview: `exporter.writeProject("citadel_ch14", {
  target: "CapCut_Desktop_v4",
  fps: 60,
  keyframes: "bezier_smooth_pan"
}); // -> Ready to open in CapCut with 0 render wait`,
  },
];

export const ScrollytellingSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const manualLockUntilRef = useRef<number>(0);
  const sectionRef = useRef<HTMLElement | null>(null);

  const selectChapterManually = (idx: number) => {
    manualLockUntilRef.current = Date.now() + 2500;
    setActiveIndex(idx);
  };

  // Sync horizontal storyboard progress with vertical window scroll when inside the section
  useEffect(() => {
    const handleScroll = () => {
      if (Date.now() < manualLockUntilRef.current) return;
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewportHeight) return;
      const centerOffset = viewportHeight * 0.5 - rect.top;
      const ratio = Math.max(0, Math.min(1, centerOffset / Math.max(1, rect.height)));
      if (ratio < 0.34) {
        setActiveIndex(0);
      } else if (ratio < 0.68) {
        setActiveIndex(1);
      } else {
        setActiveIndex(2);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      id="story"
      ref={sectionRef}
      className="relative py-24 border-y border-white/[0.08] bg-[#0D0D11]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Section Header & Interactive Chapter Timeline Selector */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-mono text-amber-400 mb-2">
              Interactive Pipeline Storyboard · 3-Stage Architecture
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display tracking-tight">
              From Raw Vertical Webtoon to Finished Timeline
            </h2>
          </div>

          {/* Interactive Chapter Step Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {STORY_CHAPTERS.map((chap, idx) => (
              <button
                key={chap.index}
                type="button"
                onClick={() => selectChapterManually(idx)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeIndex === idx
                    ? 'bg-amber-500 text-neutral-950 font-semibold'
                    : 'bg-[#15151C] text-neutral-400 border border-white/[0.08] hover:text-white'
                }`}
              >
                0{idx + 1}. {chap.chapterTitle}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Glide Track Container */}
        <div className="overflow-hidden rounded-2xl bg-[#121217] border border-white/[0.08]">
          <div
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            {STORY_CHAPTERS.map((chapter, idx) => (
              <div
                key={chapter.index}
                aria-hidden={activeIndex !== idx}
                className="w-full shrink-0 overflow-hidden p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"
              >
                {/* Left 7 Columns: Narrative & Quantified Metrics */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                    <span className="text-amber-400 font-semibold">{chapter.index}</span>
                    <span aria-hidden="true">·</span>
                    <span>{chapter.chapterTitle}</span>
                  </div>

                  <h3 className="text-2xl md:text-4xl font-bold text-white font-display leading-tight">
                    {chapter.headline}{' '}
                    <span className="text-amber-400">{chapter.accentPhrase}</span>
                  </h3>

                  <p className="text-neutral-300 text-base leading-relaxed max-w-2xl">
                    {chapter.description}
                  </p>

                  {/* Quantified Proof Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-[#0A0A0C] border border-white/[0.06]">
                      <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">
                        {chapter.metricPrimary}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {chapter.metricPrimaryLabel}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-[#0A0A0C] border border-white/[0.06]">
                      <div className="text-2xl font-bold text-white font-mono tabular-nums">
                        {chapter.metricSecondary}
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {chapter.metricSecondaryLabel}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: Technical Mechanism & Live Spec Card */}
                <div className="lg:col-span-5 rounded-xl bg-[#0A0A0C] border border-white/[0.08] p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <span className="text-xs font-semibold text-white flex items-center gap-2">
                      {idx === 0 && <Layers className="w-4 h-4 text-amber-400" />}
                      {idx === 1 && <Sparkles className="w-4 h-4 text-amber-400" />}
                      {idx === 2 && <Film className="w-4 h-4 text-amber-400" />}
                      Pipeline Stage 0{idx + 1} Specification
                    </span>
                    <span className="text-xs font-mono text-neutral-400 tabular-nums">
                      0{idx + 1} / 03
                    </span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-neutral-300 leading-relaxed">
                    {chapter.mechanismSteps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2.5">
                        <span className="font-mono text-amber-400 font-semibold">0{sIdx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="p-3.5 rounded-lg bg-[#121217] border border-white/[0.06] font-mono text-[11px] text-neutral-300 overflow-x-auto">
                    <pre>{chapter.codePreview}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Storyboard Progress Bar & Next/Prev Navigation */}
          <div className="px-8 py-4 bg-[#0A0A0C] border-t border-white/[0.08] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-400 tabular-nums">
                Stage 0{activeIndex + 1} of 0{STORY_CHAPTERS.length}
              </span>
              <div className="w-36 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  style={{ width: `${((activeIndex + 1) / STORY_CHAPTERS.length) * 100}%` }}
                  className="h-full bg-amber-500 transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => selectChapterManually(activeIndex > 0 ? activeIndex - 1 : STORY_CHAPTERS.length - 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-neutral-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Stage
              </button>
              <button
                type="button"
                onClick={() => selectChapterManually(activeIndex < STORY_CHAPTERS.length - 1 ? activeIndex + 1 : 0)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-neutral-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Next Stage
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
