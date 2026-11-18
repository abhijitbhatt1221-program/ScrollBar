import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Scissors,
  Wand2,
  Sliders,
  Check,
  Copy,
  Volume2,
  VolumeX,
  Plus,
} from 'lucide-react';
import {
  PanelSlice,
  CameraMotionPreset,
  ExportFormat,
  calculateNarrationDuration,
  buildTimelineCues,
  formatTimecode,
  generateNleExportPayload,
} from '../utils/studioEngine';

interface InteractiveStudioProps {
  panels: PanelSlice[];
  onUpdatePanels: React.Dispatch<React.SetStateAction<PanelSlice[]>>;
}

type StudioStage = 'slicer' | 'script' | 'timeline';

const VOICE_PROFILES: Record<PanelSlice['voiceId'], { label: string; pitchHz: number; cadenceNote: string }> = {
  'narrator-deep': { label: 'Seong-Jin (Deep Chronicle)', pitchHz: 115, cadenceNote: '155 WPM · Baritone' },
  'chronicle-calm': { label: 'Eun-Ha (Archivist Calm)', pitchHz: 165, cadenceNote: '145 WPM · Measured' },
  'dramatic-lead': { label: 'Tae-Yang (Action Lead)', pitchHz: 135, cadenceNote: '165 WPM · High Energy' },
};

const CAMERA_PRESETS: { id: CameraMotionPreset; label: string; description: string }[] = [
  { id: 'pan-down', label: 'Vertical Scroll Pan', description: 'Top-to-bottom webtoon reveal' },
  { id: 'zoom-in', label: 'Dramatic Push-In', description: 'Slow focal zoom toward center' },
  { id: 'pan-up', label: 'Ascending Reveal', description: 'Bottom-to-top architectural sweep' },
  { id: 'impact-focus', label: 'Action Snap Zoom', description: 'Rapid kinetic scale for combat panels' },
];

export const InteractiveStudio: React.FC<InteractiveStudioProps> = ({ panels, onUpdatePanels }) => {
  const [activeStage, setActiveStage] = useState<StudioStage>('slicer');
  const [selectedPanelId, setSelectedPanelId] = useState<string>(panels[0]?.id || 'panel-01');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playheadSec, setPlayheadSec] = useState<number>(0);
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('capcut-json');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<string>('4 panels sliced · Ready for timeline playback');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const audioCtxRef = useRef<AudioContext | null>(null);

  const cues = useMemo(() => buildTimelineCues(panels, 60), [panels]);
  const totalDurationSec = useMemo(
    () => (cues.length > 0 ? cues[cues.length - 1].endSec : 0),
    [cues]
  );

  const selectedPanel = useMemo(
    () => panels.find((p) => p.id === selectedPanelId) || panels[0],
    [panels, selectedPanelId]
  );

  // Determine which cue is currently under the playhead
  const activePlaybackCue = useMemo(() => {
    if (cues.length === 0) return null;
    const match = cues.find((c) => playheadSec >= c.startSec && playheadSec < c.endSec);
    return match || cues[cues.length - 1];
  }, [cues, playheadSec]);

  const activePlaybackPanel = useMemo(() => {
    if (!activePlaybackCue) return selectedPanel;
    return panels.find((p) => p.id === activePlaybackCue.panelId) || selectedPanel;
  }, [activePlaybackCue, panels, selectedPanel]);

  // Calculate normalized progress (0..1) inside the currently playing panel
  const panelProgress = useMemo(() => {
    if (!activePlaybackCue || activePlaybackCue.durationSec <= 0) return 0;
    const elapsed = Math.max(0, playheadSec - activePlaybackCue.startSec);
    return Math.min(1, elapsed / activePlaybackCue.durationSec);
  }, [activePlaybackCue, playheadSec]);

  // Subtle Web Audio synthesizer pulse when switching panels during playback
  const playSubtleCueTone = (freq: number) => {
    if (audioMuted) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Ignore audio errors in restricted headless environments
    }
  };

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 100;
    const timer = window.setInterval(() => {
      setPlayheadSec((prev) => {
        const next = Math.round((prev + 0.1) * 10) / 10;
        if (next >= totalDurationSec) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [isPlaying, totalDurationSec]);

  // Keep selected panel synced while playing
  useEffect(() => {
    if (isPlaying && activePlaybackCue && activePlaybackCue.panelId !== selectedPanelId) {
      setSelectedPanelId(activePlaybackCue.panelId);
      const voice = VOICE_PROFILES[activePlaybackPanel?.voiceId || 'narrator-deep'];
      playSubtleCueTone(voice.pitchHz);
    }
  }, [isPlaying, activePlaybackCue, selectedPanelId, activePlaybackPanel]);

  const handleTogglePlay = () => {
    if (!isPlaying) {
      if (playheadSec >= totalDurationSec) {
        setPlayheadSec(0);
      }
      const voice = VOICE_PROFILES[selectedPanel?.voiceId || 'narrator-deep'];
      playSubtleCueTone(voice.pitchHz);
      setIsPlaying(true);
      setStatusFeedback('Playing 60fps Ken Burns recap timeline');
    } else {
      setIsPlaying(false);
      setStatusFeedback(`Paused at ${formatTimecode(playheadSec)}`);
    }
  };

  const handleResetTimeline = () => {
    setIsPlaying(false);
    setPlayheadSec(0);
    if (panels[0]) setSelectedPanelId(panels[0].id);
    setStatusFeedback('Playhead reset to 00:00.0');
  };

  const handleScriptChange = (newScript: string) => {
    onUpdatePanels((prev) =>
      prev.map((panel) => {
        if (panel.id !== selectedPanel.id) return panel;
        const autoDuration = calculateNarrationDuration(newScript, panel.speakingRateWpm);
        return {
          ...panel,
          narrationScript: newScript,
          durationSec: autoDuration,
        };
      })
    );
    setStatusFeedback('Updated narration script and recalculated clip duration');
  };

  const handleVoiceChange = (voiceId: PanelSlice['voiceId']) => {
    const defaultWpm = voiceId === 'dramatic-lead' ? 165 : voiceId === 'chronicle-calm' ? 145 : 155;
    onUpdatePanels((prev) =>
      prev.map((panel) => {
        if (panel.id !== selectedPanel.id) return panel;
        const autoDuration = calculateNarrationDuration(panel.narrationScript, defaultWpm);
        return {
          ...panel,
          voiceId,
          speakingRateWpm: defaultWpm,
          durationSec: autoDuration,
        };
      })
    );
    playSubtleCueTone(VOICE_PROFILES[voiceId].pitchHz);
    setStatusFeedback(`Voice switched to ${VOICE_PROFILES[voiceId].label}`);
  };

  const handleCameraPresetChange = (preset: CameraMotionPreset) => {
    onUpdatePanels((prev) =>
      prev.map((panel) => (panel.id === selectedPanel.id ? { ...panel, cameraMotion: preset } : panel))
    );
    setStatusFeedback(`Applied ${preset} keyframe curve to Panel 0${selectedPanel.index}`);
  };

  const handleAutoSyncAllTimings = () => {
    onUpdatePanels((prev) =>
      prev.map((panel) => ({
        ...panel,
        durationSec: calculateNarrationDuration(panel.narrationScript, panel.speakingRateWpm),
        bubbleCleaned: true,
      }))
    );
    setStatusFeedback('Synchronized all panel durations to voiceover syllable cadence');
  };

  const handleDuplicateCut = () => {
    if (panels.length >= 6) {
      setStatusFeedback('Maximum 6 chapter slices reached in preview workspace');
      return;
    }
    const nextIndex = panels.length + 1;
    const cloned: PanelSlice = {
      ...selectedPanel,
      id: `panel-0${nextIndex}-${Date.now().toString().slice(-3)}`,
      index: nextIndex,
      title: `${selectedPanel.title} (Close Cut)`,
      sceneTag: 'Reaction Beat',
      cameraMotion: selectedPanel.cameraMotion === 'zoom-in' ? 'impact-focus' : 'zoom-in',
      durationSec: 3.4,
    };
    onUpdatePanels((prev) => [...prev, cloned]);
    setSelectedPanelId(cloned.id);
    setStatusFeedback(`Sliced additional reaction panel (Panel 0${nextIndex})`);
  };

  const exportPayload = useMemo(
    () => generateNleExportPayload('Northern Citadel Chapter 14', panels, exportFormat, 60),
    [panels, exportFormat]
  );

  const handleDownloadExport = () => {
    const blob = new Blob([exportPayload.content], { type: exportPayload.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportPayload.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusFeedback(`Exported ${exportPayload.filename} (${exportPayload.totalFrames} frames @ 60fps)`);
  };

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(exportPayload.content);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } catch {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  // Compute CSS transform for the active panel inside the preview monitor
  const getCameraTransformStyle = (): React.CSSProperties => {
    const p = isPlaying ? panelProgress : 0.35;
    const motion = activePlaybackPanel?.cameraMotion || 'pan-down';
    if (motion === 'pan-down') {
      const translateY = -6 + p * 12;
      return { transform: `scale(1.16) translateY(${translateY.toFixed(2)}%)` };
    }
    if (motion === 'pan-up') {
      const translateY = 6 - p * 12;
      return { transform: `scale(1.16) translateY(${translateY.toFixed(2)}%)` };
    }
    if (motion === 'impact-focus') {
      const scale = 1.05 + p * 0.24;
      return { transform: `scale(${scale.toFixed(3)})` };
    }
    // zoom-in
    const scale = 1.02 + p * 0.18;
    return { transform: `scale(${scale.toFixed(3)})` };
  };

  return (
    <section id="studio" className="w-full max-w-7xl mx-auto px-6 pt-8 pb-20">
      {/* Studio Workspace Container */}
      <div className="rounded-2xl bg-[#121216] border border-white/[0.08] overflow-hidden">
        {/* Top Studio Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 bg-[#16161C] border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-amber-400 font-medium">Chapter 14: The Northern Citadel</span>
            <span className="text-neutral-600" aria-hidden="true">·</span>
            <span className="text-xs font-mono text-neutral-400 tabular-nums">
              {panels.length} Panels · {totalDurationSec.toFixed(1)}s · {Math.round(totalDurationSec * 60)} Frames
            </span>
          </div>

          {/* Interactive Stage Switcher (Functional Segmented Controls) */}
          <div role="tablist" aria-label="Production Pipeline Stages" className="flex items-center gap-1 p-1 bg-[#0A0A0C] rounded-lg border border-white/[0.06]">
            <button
              type="button"
              role="tab"
              aria-selected={activeStage === 'slicer'}
              onClick={() => setActiveStage('slicer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeStage === 'slicer'
                  ? 'bg-amber-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              1. Panel Slicer
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeStage === 'script'}
              onClick={() => setActiveStage('script')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeStage === 'script'
                  ? 'bg-amber-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              2. Script & Voice
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeStage === 'timeline'}
              onClick={() => setActiveStage('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeStage === 'timeline'
                  ? 'bg-amber-500 text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              3. Camera & NLE
            </button>
          </div>

          {/* Primary Export Trigger */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              Export NLE Project
            </button>
          </div>
        </div>

        {/* Main 12-Column Studio Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
          {/* Left Column (3 cols): Vertical Webtoon Strip & Detected Panel Queue */}
          <div className="lg:col-span-3 p-4 flex flex-col justify-between bg-[#0E0E12]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-neutral-300">Detected Webtoon Slices</h2>
                <button
                  type="button"
                  onClick={handleDuplicateCut}
                  className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Sub-Cut
                </button>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {panels.map((panel, idx) => {
                  const isSelected = panel.id === selectedPanel.id;
                  const cue = cues[idx];
                  return (
                    <button
                      key={panel.id}
                      type="button"
                      onClick={() => {
                        setSelectedPanelId(panel.id);
                        if (cue) setPlayheadSec(cue.startSec);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border transition-colors flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/[0.12] border-amber-500/50 text-white'
                          : 'bg-[#14141A] border-white/[0.06] text-neutral-300 hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="w-14 h-11 rounded-lg overflow-hidden bg-neutral-900 shrink-0 relative border border-white/10">
                        {!imgErrors[panel.id] ? (
                          <img
                            src={panel.imageUrl}
                            alt={panel.title}
                            referrerPolicy="no-referrer"
                            onError={() => setImgErrors((prev) => ({ ...prev, [panel.id]: true }))}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center text-[10px] font-mono text-amber-400">
                            P0{idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold truncate">
                            0{idx + 1}. {panel.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono tabular-nums mt-0.5 truncate">
                          {panel.sceneTag} · {panel.durationSec.toFixed(1)}s · {(panel.cropBox.confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
              <span>YOLO Crop Overlay</span>
              <button
                type="button"
                onClick={() => setShowBoundingBoxes((prev) => !prev)}
                aria-pressed={showBoundingBoxes}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  showBoundingBoxes ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-white/5 text-neutral-400'
                }`}
              >
                {showBoundingBoxes ? 'Boxes Visible' : 'Boxes Hidden'}
              </button>
            </div>
          </div>

          {/* Center Column (5 cols): Live 16:9 Ken Burns Recap Viewport & Transport Controls */}
          <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-[#0A0A0C]">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-neutral-400">
                  <span className="text-white font-medium">Recap Viewport</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span className="font-mono">1080p60 Preview</span>
                </div>
                <div className="text-xs font-mono text-amber-400 tabular-nums">
                  {formatTimecode(playheadSec)} / {formatTimecode(totalDurationSec)}
                </div>
              </div>

              {/* 16:9 Interactive Preview Frame */}
              <div
                data-testid="studio-preview-canvas"
                className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-950 border border-white/[0.1] select-none"
              >
                {activePlaybackPanel && !imgErrors[activePlaybackPanel.id] ? (
                  <img
                    src={activePlaybackPanel.imageUrl}
                    alt={activePlaybackPanel.title}
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setImgErrors((prev) => ({ ...prev, [activePlaybackPanel.id]: true }))
                    }
                    style={getCameraTransformStyle()}
                    className="w-full h-full object-cover transition-transform duration-150 ease-linear"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-sm font-semibold text-white">{activePlaybackPanel?.title}</span>
                    <span className="text-xs text-neutral-400 mt-1">{activePlaybackPanel?.sceneTag}</span>
                  </div>
                )}

                {/* Optional YOLO Bounding Box Detection Overlay */}
                {showBoundingBoxes && activePlaybackPanel && (
                  <div
                    style={{
                      left: `${activePlaybackPanel.cropBox.x}%`,
                      top: `${activePlaybackPanel.cropBox.y}%`,
                      width: `${activePlaybackPanel.cropBox.width}%`,
                      height: `${activePlaybackPanel.cropBox.height}%`,
                    }}
                    className="absolute border border-amber-400/75 pointer-events-none rounded-sm"
                  >
                    <div className="bg-neutral-950/85 text-amber-300 px-1.5 py-0.5 text-[10px] font-mono inline-block">
                      panel_0{activePlaybackPanel.index} · conf {(activePlaybackPanel.cropBox.confidence * 100).toFixed(1)}% ·{' '}
                      {activePlaybackPanel.cameraMotion}
                    </div>
                  </div>
                )}

                {/* Measured Contrast Scrim + Live Synchronized Narration Subtitle Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-10 pb-3.5 px-4">
                  <p className="text-xs md:text-sm text-white font-medium leading-snug text-center max-w-lg mx-auto drop-shadow">
                    “{activePlaybackPanel?.narrationScript}”
                  </p>
                </div>
              </div>
            </div>

            {/* Playback Transport Bar & Timeline Scrubbing Track */}
            <div className="mt-4 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center gap-3 mb-3">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  {isPlaying ? 'Pause Preview' : 'Play Recap Preview'}
                </button>
                <button
                  type="button"
                  onClick={handleResetTimeline}
                  aria-label="Reset Timeline Playhead"
                  className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAudioMuted((m) => !m)}
                  aria-label={audioMuted ? 'Unmute Studio Audio' : 'Mute Studio Audio'}
                  className="p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 transition-colors cursor-pointer"
                >
                  {audioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <div className="ml-auto text-[11px] font-mono text-neutral-400 truncate max-w-[200px]">
                  {statusFeedback}
                </div>
              </div>

              {/* Multi-Segment Interactive Timeline Bar */}
              <div className="space-y-1.5">
                <div className="flex w-full h-7 rounded-lg overflow-hidden bg-[#16161D] border border-white/[0.08] p-0.5 gap-0.5">
                  {cues.map((cue) => {
                    const widthPct = totalDurationSec > 0 ? (cue.durationSec / totalDurationSec) * 100 : 25;
                    const isCurrent = activePlaybackCue?.panelId === cue.panelId;
                    return (
                      <button
                        key={cue.panelId}
                        type="button"
                        onClick={() => {
                          setSelectedPanelId(cue.panelId);
                          setPlayheadSec(cue.startSec);
                        }}
                        style={{ width: `${widthPct}%` }}
                        className={`h-full rounded-sm px-2 flex items-center justify-between text-[10px] font-mono transition-colors overflow-hidden cursor-pointer ${
                          isCurrent
                            ? 'bg-amber-500 text-neutral-950 font-semibold'
                            : 'bg-white/[0.06] text-neutral-300 hover:bg-white/[0.12]'
                        }`}
                      >
                        <span className="truncate">P0{cue.index}</span>
                        <span className="tabular-nums opacity-80">{cue.durationSec.toFixed(1)}s</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Context-Sensitive Inspector for Active Pipeline Stage */}
          <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-[#121216]">
            {activeStage === 'slicer' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Panel Slicer & Speech Bubble Cleaner</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Adjust YOLO crop bounds and speech-bubble inpainting for <span className="text-white">{selectedPanel.title}</span>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A0A0C] border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Detection Confidence</span>
                    <span className="font-mono text-amber-400 tabular-nums">
                      {(selectedPanel.cropBox.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Crop Region (X / Y / W / H)</span>
                    <span className="font-mono text-neutral-200 tabular-nums">
                      {selectedPanel.cropBox.x}% · {selectedPanel.cropBox.y}% · {selectedPanel.cropBox.width}% · {selectedPanel.cropBox.height}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.06]">
                    <span className="text-neutral-400">Speech Bubble Inpainting</span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdatePanels((prev) =>
                          prev.map((p) =>
                            p.id === selectedPanel.id ? { ...p, bubbleCleaned: !p.bubbleCleaned } : p
                          )
                        )
                      }
                      className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                        selectedPanel.bubbleCleaned
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      {selectedPanel.bubbleCleaned ? 'Cleaned (Original Art Restored)' : 'Raw Scan'}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="scene-tag-select" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Scene Classification Tag
                  </label>
                  <select
                    id="scene-tag-select"
                    value={selectedPanel.sceneTag}
                    onChange={(e) => {
                      const val = e.target.value;
                      onUpdatePanels((prev) =>
                        prev.map((p) => (p.id === selectedPanel.id ? { ...p, sceneTag: val } : p))
                      );
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0C] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Establishing Shot">Establishing Shot</option>
                    <option value="Close-Up Tension">Close-Up Tension</option>
                    <option value="Action Peak">Action Peak</option>
                    <option value="Lore Reveal">Lore Reveal</option>
                    <option value="Reaction Beat">Reaction Beat</option>
                  </select>
                </div>
              </div>
            )}

            {activeStage === 'script' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Narrative Script & Voice Synthesis</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Edit the recap narration line. Clip duration automatically adapts to speaking rate.
                  </p>
                </div>

                <div>
                  <label htmlFor="narration-textarea" className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Panel 0{selectedPanel.index} Voiceover Script
                  </label>
                  <textarea
                    id="narration-textarea"
                    rows={3}
                    value={selectedPanel.narrationScript}
                    onChange={(e) => handleScriptChange(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#0A0A0C] border border-white/[0.1] text-xs text-white leading-relaxed focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mt-1">
                    <span>{selectedPanel.narrationScript.trim().split(/\s+/).filter(Boolean).length} words</span>
                    <span className="text-amber-400 tabular-nums">Auto-Timed: {selectedPanel.durationSec.toFixed(1)}s</span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-neutral-300 mb-1.5">Narrator Voice Model</span>
                  <div className="space-y-1.5">
                    {(Object.keys(VOICE_PROFILES) as PanelSlice['voiceId'][]).map((vId) => {
                      const profile = VOICE_PROFILES[vId];
                      const active = selectedPanel.voiceId === vId;
                      return (
                        <button
                          key={vId}
                          type="button"
                          onClick={() => handleVoiceChange(vId)}
                          className={`w-full px-3 py-2 rounded-lg border text-left flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            active
                              ? 'bg-amber-500/15 border-amber-500/50 text-white'
                              : 'bg-[#0A0A0C] border-white/[0.06] text-neutral-300 hover:border-white/[0.15]'
                          }`}
                        >
                          <span className="font-medium">{profile.label}</span>
                          <span className="text-[11px] font-mono text-neutral-400">{profile.cadenceNote}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeStage === 'timeline' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Camera Motion & NLE Keyframes</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Assign automated Ken Burns pan/zoom curves exported directly to CapCut & DaVinci Resolve.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {CAMERA_PRESETS.map((preset) => {
                    const isSelected = selectedPanel.cameraMotion === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleCameraPresetChange(preset.id)}
                        className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/50 text-white'
                            : 'bg-[#0A0A0C] border-white/[0.06] text-neutral-300 hover:border-white/[0.15]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>{preset.label}</span>
                          <span className="font-mono text-[11px] text-amber-400">{preset.id}</span>
                        </div>
                        <div className="text-[11px] text-neutral-400 mt-0.5">{preset.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Action Footer inside Right Inspector */}
            <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleAutoSyncAllTimings}
                className="px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-neutral-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Auto-Time to Speech
              </button>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-neutral-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Generate NLE Draft
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NLE Project Export Dialog Modal */}
      {isExportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="w-full max-w-2xl rounded-2xl bg-[#14141A] border border-white/[0.12] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div>
                <h3 id="export-modal-title" className="text-lg font-bold text-white font-display">
                  Export Frame-Accurate NLE Project
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Includes sliced panel crops, camera motion keyframes, and synchronized narration track.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs text-neutral-300 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Close Modal
              </button>
            </div>

            {/* Format Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2 my-4">
              {(
                [
                  { id: 'capcut-json', label: 'CapCut Desktop (.json)' },
                  { id: 'davinci-fcpxml', label: 'DaVinci Resolve (.fcpxml)' },
                  { id: 'premiere-xml', label: 'Premiere Pro (.xml)' },
                ] as { id: ExportFormat; label: string }[]
              ).map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setExportFormat(fmt.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    exportFormat === fmt.id
                      ? 'bg-amber-500 text-neutral-950 font-semibold'
                      : 'bg-[#0A0A0C] text-neutral-300 border border-white/[0.08] hover:border-white/[0.2]'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>

            {/* Code Preview */}
            <div className="rounded-xl bg-[#0A0A0C] border border-white/[0.08] p-4 max-h-64 overflow-y-auto font-mono text-xs text-neutral-300">
              <pre className="whitespace-pre-wrap break-words">{exportPayload.content}</pre>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs font-mono text-neutral-400 tabular-nums whitespace-nowrap truncate">
                File: <span className="text-white">{exportPayload.filename}</span> · {exportPayload.totalFrames} frames
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs font-medium text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPayload ? 'Copied to Clipboard' : 'Copy Project File'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadExport}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-semibold text-neutral-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download {exportPayload.filename}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
