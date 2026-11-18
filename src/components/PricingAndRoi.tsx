import React, { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { calculateCreatorRoi } from '../utils/studioEngine';

interface PricingAndRoiProps {
  onSelectTier: (tierName: string, monthlyChapters: number) => void;
}

export const PricingAndRoi: React.FC<PricingAndRoiProps> = ({ onSelectTier }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [monthlyChapters, setMonthlyChapters] = useState<number>(24);

  const roi = useMemo(() => calculateCreatorRoi(monthlyChapters, 35), [monthlyChapters]);

  const tiers = [
    {
      id: 'creator' as const,
      name: 'Consumer Workspace',
      audience: 'For solo recap creators launching weekly videos',
      monthlyPrice: 29,
      annualPrice: 24,
      specs: [
        'Up to 15 Webtoon/Manhwa chapters sliced per month',
        'YOLO v9 automated panel cutter & 16:9 safe crop',
        '6 neural narrator voices (48kHz WAV output)',
        'CapCut Desktop (.json) & SRT subtitle export',
      ],
    },
    {
      id: 'studio' as const,
      name: 'Full Studio Suite',
      audience: 'For high-output channels & multi-series editors',
      monthlyPrice: 69,
      annualPrice: 54,
      specs: [
        'Up to 60 chapters per month with batch folder queue',
        'Automated speech-bubble OCR & artwork inpainting',
        'All 24 neural narrator voices + custom RVC voice cloning',
        'CapCut JSON, DaVinci Resolve FCPXML & Premiere XML',
      ],
    },
    {
      id: 'enterprise' as const,
      name: 'Production Network',
      audience: 'For multi-channel MCNs & localization teams',
      monthlyPrice: 179,
      annualPrice: 144,
      specs: [
        'Unlimited chapter slicing + local GPU acceleration',
        'Multi-seat workspace with shared character glossary',
        'Automated KR/JP/ZH to EN translation & script rewrite',
        'Dedicated custom NLE template & render pipeline API',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 border-t border-white/[0.08] bg-[#0D0D11]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header & Billing Cadence Switcher */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-mono text-amber-400 mb-2">
              Transparent Studio Licensing · Windows & macOS Desktop Builds
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white font-display tracking-tight">
              Scale Your Recap Output Without Adding Editors
            </h2>
          </div>

          {/* Interactive Billing Toggle */}
          <div className="flex items-center gap-1 p-1 bg-[#14141A] rounded-lg border border-white/[0.08] self-start">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-amber-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-amber-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Annual Billing (Save 20%)
            </button>
          </div>
        </div>

        {/* Interactive Creator Time-Saved & ROI Calculator Bar */}
        <div className="mb-12 p-6 md:p-8 rounded-2xl bg-[#121216] border border-white/[0.08] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="chapters-volume-slider" className="font-semibold text-white">
                Monthly Chapters Produced by Your Channel
              </label>
              <span className="font-mono text-amber-400 font-bold text-sm tabular-nums">
                {monthlyChapters} Chapters / month
              </span>
            </div>
            <input
              id="chapters-volume-slider"
              type="range"
              min={4}
              max={100}
              step={2}
              value={monthlyChapters}
              onChange={(e) => setMonthlyChapters(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-xs text-neutral-400">
              Compares manual Photoshop slicing + manual NLE keyframing (3.2 hrs/chapter) against ScrollBard Studio (21 mins/chapter).
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#0A0A0C] border border-white/[0.06]">
              <div className="text-xs text-neutral-400">Manual Editing</div>
              <div className="text-xl md:text-2xl font-bold text-neutral-300 font-mono tabular-nums mt-1">
                {roi.manualHoursTotal} hrs
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#0A0A0C] border border-white/[0.06]">
              <div className="text-xs text-neutral-400">ScrollBard Time</div>
              <div className="text-xl md:text-2xl font-bold text-white font-mono tabular-nums mt-1">
                {roi.studioHoursTotal} hrs
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="text-xs text-amber-300">Monthly Saved</div>
              <div className="text-xl md:text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">
                {roi.hoursSaved} hrs
              </div>
            </div>
          </div>
        </div>

        {/* 3-Column Pricing Tier Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const isRecommended = roi.recommendedTierId === tier.id;
            const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-8 flex flex-col justify-between border transition-colors ${
                  isRecommended
                    ? 'bg-[#15151C] border-amber-500/60'
                    : 'bg-[#121216] border-white/[0.08]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white font-display">{tier.name}</h3>
                    {isRecommended && (
                      <span className="text-xs font-mono text-amber-400 font-medium">
                        Recommended for {monthlyChapters} ch/mo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mb-6">{tier.audience}</p>

                  <div className="flex items-baseline gap-1.5 pb-6 border-b border-white/[0.08]">
                    <span className="text-4xl font-bold text-white font-mono tabular-nums">
                      ${price}
                    </span>
                    <span className="text-xs text-neutral-400">
                      / month {billingCycle === 'annual' ? 'billed annually' : 'billed monthly'}
                    </span>
                  </div>

                  <ul className="space-y-3 my-6 text-xs text-neutral-300">
                    {tier.specs.map((spec, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTier(tier.name, monthlyChapters)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isRecommended
                      ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                      : 'bg-white/[0.08] hover:bg-white/[0.14] text-white'
                  }`}
                >
                  Select {tier.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
