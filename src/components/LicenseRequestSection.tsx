import React, { useState, useEffect } from 'react';
import { validateLicenseInquiry } from '../utils/studioEngine';
import { CheckCircle2 } from 'lucide-react';

interface LicenseRequestSectionProps {
  selectedTierName: string;
  selectedMonthlyVolume: number;
}

interface SubmittedRequest {
  id: string;
  fullName: string;
  email: string;
  channelUrl: string;
  tierName: string;
  monthlyVolume: string;
  osPlatform: 'Windows 11 (CUDA GPU)' | 'macOS (Apple Silicon M-Series)';
  createdAt: string;
}

export const LicenseRequestSection: React.FC<LicenseRequestSectionProps> = ({
  selectedTierName,
  selectedMonthlyVolume,
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [channelUrl, setChannelUrl] = useState<string>('');
  const [tierName, setTierName] = useState<string>(selectedTierName || 'Full Studio Suite');
  const [monthlyVolume, setMonthlyVolume] = useState<string>(String(selectedMonthlyVolume || 24));
  const [osPlatform, setOsPlatform] = useState<'Windows 11 (CUDA GPU)' | 'macOS (Apple Silicon M-Series)'>(
    'Windows 11 (CUDA GPU)'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissions, setSubmissions] = useState<SubmittedRequest[]>([]);

  useEffect(() => {
    if (selectedTierName) setTierName(selectedTierName);
    if (selectedMonthlyVolume) setMonthlyVolume(String(selectedMonthlyVolume));
  }, [selectedTierName, selectedMonthlyVolume]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateLicenseInquiry({
      fullName,
      email,
      channelUrl,
      monthlyVolume,
    });
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    const newEntry: SubmittedRequest = {
      id: `SB-${Math.floor(100000 + Math.random() * 900000)}`,
      fullName: fullName.trim(),
      email: email.trim(),
      channelUrl: channelUrl.trim(),
      tierName,
      monthlyVolume,
      osPlatform,
      createdAt: 'Just now',
    };
    setSubmissions((prev) => [newEntry, ...prev]);
    setFullName('');
    setEmail('');
    setChannelUrl('');
  };

  return (
    <section id="contact" className="py-24 max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left 5 Columns: Direct Studio License & Installer Provisioning Info */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="text-xs font-mono text-amber-400 mb-2">
              Desktop Installer & License Key Provisioning
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-display tracking-tight mb-4">
              Request Your ScrollBard Studio Build
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Reserve your license key and download the offline-capable desktop application with local NVIDIA TensorRT and Apple Metal acceleration for zero-cost local panel slicing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121216] border border-white/[0.08] space-y-4">
            <h3 className="text-sm font-semibold text-white">Included in Every Desktop Build</h3>
            <ul className="space-y-2.5 text-xs text-neutral-300">
              <li>01. Local YOLO v9 Panel & Speech Bubble Detector (offline GPU execution)</li>
              <li>02. Direct CapCut Desktop, DaVinci Resolve 19 & Premiere Pro exporters</li>
              <li>03. Multi-chapter character glossary & pronunciation lock dictionary</li>
              <li>04. Sample Northern Citadel 4-panel starter project pre-installed</li>
            </ul>
          </div>

          {submissions.length > 0 && (
            <div
              role="status"
              aria-live="polite"
              className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2"
            >
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Studio License Provisioned ({submissions[0].id})
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Prepared <span className="text-white font-medium">{submissions[0].tierName}</span> installer for{' '}
                <span className="text-white font-medium">{submissions[0].fullName}</span> ({submissions[0].email}) on{' '}
                <span className="font-mono text-amber-300">{submissions[0].osPlatform}</span>.
              </p>
            </div>
          )}
        </div>

        {/* Right 7 Columns: Validated License Registration Form */}
        <div className="lg:col-span-7 rounded-2xl bg-[#121216] border border-white/[0.08] p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="license-fullname" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Creator Name or Studio Handle
                </label>
                <input
                  id="license-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kang Jin Studio"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0C] border border-white/[0.12] text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="license-email" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Creator or Work Email
                </label>
                <input
                  id="license-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="producer@manhwastudio.io"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0C] border border-white/[0.12] text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500"
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="license-channel" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  YouTube Channel or Studio Handle
                </label>
                <input
                  id="license-channel"
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="@CitadelRecapsHD"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0C] border border-white/[0.12] text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500"
                />
                {errors.channelUrl && (
                  <p className="text-xs text-red-400 mt-1.5">{errors.channelUrl}</p>
                )}
              </div>

              <div>
                <label htmlFor="license-tier" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Selected License Tier
                </label>
                <select
                  id="license-tier"
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0C] border border-white/[0.12] text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Consumer Workspace">Consumer Workspace ($24/mo)</option>
                  <option value="Full Studio Suite">Full Studio Suite ($54/mo)</option>
                  <option value="Production Network">Production Network ($144/mo)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="license-os" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Target Desktop Runtime
                </label>
                <select
                  id="license-os"
                  value={osPlatform}
                  onChange={(e) =>
                    setOsPlatform(
                      e.target.value as 'Windows 11 (CUDA GPU)' | 'macOS (Apple Silicon M-Series)'
                    )
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0C] border border-white/[0.12] text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Windows 11 (CUDA GPU)">Windows 11 (CUDA GPU)</option>
                  <option value="macOS (Apple Silicon M-Series)">macOS (Apple Silicon M-Series)</option>
                </select>
              </div>

              <div>
                <label htmlFor="license-volume" className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Estimated Chapters / Month
                </label>
                <input
                  id="license-volume"
                  type="number"
                  min={1}
                  max={500}
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A0A0C] border border-white/[0.12] text-xs text-white font-mono tabular-nums focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-4">
              <span className="text-xs text-neutral-400">
                Instant license key generation · No credit card required for 14-day studio trial
              </span>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-neutral-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Request Studio Installer
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
