export type CameraMotionPreset = 'pan-down' | 'zoom-in' | 'pan-up' | 'impact-focus';

export type ExportFormat = 'capcut-json' | 'davinci-fcpxml' | 'premiere-xml';

export interface PanelSlice {
  id: string;
  index: number;
  title: string;
  sceneTag: string;
  imageUrl: string;
  cropBox: { x: number; y: number; width: number; height: number; confidence: number };
  narrationScript: string;
  voiceId: 'narrator-deep' | 'chronicle-calm' | 'dramatic-lead';
  speakingRateWpm: number;
  durationSec: number;
  cameraMotion: CameraMotionPreset;
  zoomIntensity: number;
  bubbleCleaned: boolean;
}

export interface TimelineCue {
  panelId: string;
  index: number;
  title: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  startFrame: number;
  endFrame: number;
  cameraMotion: CameraMotionPreset;
  narrationScript: string;
}

export interface RoiEstimate {
  monthlyChapters: number;
  manualHoursTotal: number;
  studioHoursTotal: number;
  hoursSaved: number;
  costSavedUsd: number;
  recommendedTierId: 'creator' | 'studio' | 'enterprise';
}

export const INITIAL_PANELS: PanelSlice[] = [
  {
    id: 'panel-01',
    index: 1,
    title: 'Citadel Nightfall Overlook',
    sceneTag: 'Establishing Shot',
    imageUrl: '/src/assets/images/manhwa_panel_rooftop_1794986339061.jpg',
    cropBox: { x: 4, y: 3, width: 92, height: 94, confidence: 0.992 },
    narrationScript: 'For seven years, the Northern Citadel stood sealed beneath eternal rain—until Kang Jin returned to collect the blood debt owed by the High Council.',
    voiceId: 'narrator-deep',
    speakingRateWpm: 155,
    durationSec: 5.2,
    cameraMotion: 'pan-down',
    zoomIntensity: 1.14,
    bubbleCleaned: true,
  },
  {
    id: 'panel-02',
    index: 2,
    title: 'Unsealing the Runic Blade',
    sceneTag: 'Close-Up Tension',
    imageUrl: '/src/assets/images/manhwa_panel_blade_1794986340561.jpg',
    cropBox: { x: 6, y: 8, width: 88, height: 86, confidence: 0.987 },
    narrationScript: 'A single thumb press broke the third sovereign seal. The dormant runes ignited along the scabbard, resonating across every ward in the capital.',
    voiceId: 'narrator-deep',
    speakingRateWpm: 155,
    durationSec: 4.8,
    cameraMotion: 'zoom-in',
    zoomIntensity: 1.22,
    bubbleCleaned: true,
  },
  {
    id: 'panel-03',
    index: 3,
    title: 'Courtyard Sky Clash',
    sceneTag: 'Action Peak',
    imageUrl: '/src/assets/images/manhwa_panel_clash_1794986341170.jpg',
    cropBox: { x: 2, y: 5, width: 96, height: 90, confidence: 0.995 },
    narrationScript: 'Before the Vanguard Commander could sound the alarm, twin meridians collided mid-air—shattering the ancestral courtyard tiles into suspended dust.',
    voiceId: 'dramatic-lead',
    speakingRateWpm: 165,
    durationSec: 4.6,
    cameraMotion: 'impact-focus',
    zoomIntensity: 1.28,
    bubbleCleaned: true,
  },
  {
    id: 'panel-04',
    index: 4,
    title: 'The Grand Archive Astrolabe',
    sceneTag: 'Lore Reveal',
    imageUrl: '/src/assets/images/manhwa_panel_archive_1794986341730.jpg',
    cropBox: { x: 5, y: 4, width: 90, height: 92, confidence: 0.989 },
    narrationScript: 'Deep inside the Royal Observatory, Strategist Seo aligned the bronze astrolabe, realizing the eclipse prophecy had already begun.',
    voiceId: 'chronicle-calm',
    speakingRateWpm: 145,
    durationSec: 4.9,
    cameraMotion: 'pan-up',
    zoomIntensity: 1.16,
    bubbleCleaned: true,
  },
];

/**
 * Calculates word count and speaking duration in seconds from narration text and WPM rate.
 * Enforces a minimum of 1.5s and rounds to 1 decimal place.
 */
export function calculateNarrationDuration(script: string, wpm: number = 155): number {
  const trimmed = script.trim();
  if (!trimmed) {
    return 1.5;
  }
  const safeWpm = Math.max(80, Math.min(260, wpm));
  const wordCount = trimmed.split(/\s+/).length;
  // Add 0.4s natural breath pause between panels
  const rawSeconds = (wordCount / safeWpm) * 60 + 0.4;
  return Math.max(1.5, Math.round(rawSeconds * 10) / 10);
}

/**
 * Builds frame-accurate timeline cues at a target FPS (default 60fps).
 */
export function buildTimelineCues(panels: PanelSlice[], fps: number = 60): TimelineCue[] {
  let cursorSec = 0;
  return panels.map((panel, idx) => {
    const duration = Math.max(1.0, Math.round(panel.durationSec * 10) / 10);
    const startSec = Math.round(cursorSec * 10) / 10;
    const endSec = Math.round((cursorSec + duration) * 10) / 10;
    const startFrame = Math.round(startSec * fps);
    const endFrame = Math.round(endSec * fps);
    cursorSec = endSec;
    return {
      panelId: panel.id,
      index: idx + 1,
      title: panel.title,
      startSec,
      endSec,
      durationSec: duration,
      startFrame,
      endFrame,
      cameraMotion: panel.cameraMotion,
      narrationScript: panel.narrationScript,
    };
  });
}

/**
 * Formats seconds into SMPTE-style MM:SS.d timecode.
 */
export function formatTimecode(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = Math.floor(clamped % 60);
  const tenths = Math.floor(Math.round((clamped - Math.floor(clamped)) * 10)) % 10;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
}

/**
 * Filters detected panels by YOLO confidence threshold (0.80 - 0.995).
 */
export function filterPanelsByConfidence(panels: PanelSlice[], minConfidence: number): PanelSlice[] {
  return panels.filter((p) => p.cropBox.confidence >= minConfidence);
}

/**
 * Generates an NLE export payload string for CapCut JSON, DaVinci FCPXML, or Premiere XML.
 */
export function generateNleExportPayload(
  projectName: string,
  panels: PanelSlice[],
  format: ExportFormat,
  fps: number = 60
): { filename: string; mimeType: string; content: string; totalDurationSec: number; totalFrames: number } {
  const cues = buildTimelineCues(panels, fps);
  const totalDurationSec = cues.length > 0 ? cues[cues.length - 1].endSec : 0;
  const totalFrames = cues.length > 0 ? cues[cues.length - 1].endFrame : 0;
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scrollbard-recap';

  if (format === 'capcut-json') {
    const payload = {
      schemaVersion: 'ScrollBard-WTN-CapCut-2.4',
      project: projectName,
      fps,
      resolution: { width: 1920, height: 1080 },
      totalDurationSec,
      totalFrames,
      tracks: [
        {
          type: 'video_panels',
          segments: cues.map((cue) => ({
            id: cue.panelId,
            title: cue.title,
            startMicros: Math.round(cue.startSec * 1_000_000),
            durationMicros: Math.round(cue.durationSec * 1_000_000),
            cameraKeyframe: cue.cameraMotion,
          })),
        },
        {
          type: 'tts_narration',
          segments: cues.map((cue) => ({
            id: `audio-${cue.panelId}`,
            script: cue.narrationScript,
            startMicros: Math.round(cue.startSec * 1_000_000),
            durationMicros: Math.round(cue.durationSec * 1_000_000),
          })),
        },
      ],
    };
    return {
      filename: `${slug}-capcut-draft.json`,
      mimeType: 'application/json',
      content: JSON.stringify(payload, null, 2),
      totalDurationSec,
      totalFrames,
    };
  }

  if (format === 'davinci-fcpxml') {
    const clipXml = cues
      .map(
        (c) =>
          `        <asset-clip name="${c.title}" offset="${c.startFrame}/${fps}s" duration="${c.endFrame - c.startFrame}/${fps}s" motion="${c.cameraMotion}">\n          <note>${c.narrationScript}</note>\n        </asset-clip>`
      )
      .join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.10">
  <resources>
    <format id="r1" name="FFVideoFormat1080p60" frameDuration="1/${fps}s" width="1920" height="1080"/>
  </resources>
  <library>
    <event name="${projectName}">
      <project name="${projectName} Timeline">
        <sequence format="r1" duration="${totalFrames}/${fps}s">
          <spine>
${clipXml}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;
    return {
      filename: `${slug}-resolve.fcpxml`,
      mimeType: 'application/xml',
      content: xml,
      totalDurationSec,
      totalFrames,
    };
  }

  // Premiere XML
  const trackItems = cues
    .map(
      (c) =>
        `      <clipitem id="${c.panelId}">
        <name>${c.title}</name>
        <start>${c.startFrame}</start>
        <end>${c.endFrame}</end>
        <effect>${c.cameraMotion}</effect>
      </clipitem>`
    )
    .join('\n');
  const premiereXml = `<?xml version="1.0" encoding="UTF-8"?>
<xmeml version="5">
  <sequence>
    <name>${projectName}</name>
    <duration>${totalFrames}</duration>
    <rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate>
    <media>
      <video>
${trackItems}
      </video>
    </media>
  </sequence>
</xmeml>`;

  return {
    filename: `${slug}-premiere.xml`,
    mimeType: 'application/xml',
    content: premiereXml,
    totalDurationSec,
    totalFrames,
  };
}

/**
 * Calculates creator time savings and ROI based on monthly manhwa chapters produced.
 */
export function calculateCreatorRoi(monthlyChapters: number, hourlyRateUsd: number = 35): RoiEstimate {
  const clampedChapters = Math.max(1, Math.min(200, Math.round(monthlyChapters)));
  // Traditional manual workflow: ~3.2 hours per chapter (cropping, cleaning bubbles, script, TTS align, keyframes)
  // ScrollBard + WTN pipeline: ~0.35 hours (21 mins) per chapter
  const manualHoursTotal = Math.round(clampedChapters * 3.2 * 10) / 10;
  const studioHoursTotal = Math.round(clampedChapters * 0.35 * 10) / 10;
  const hoursSaved = Math.round((manualHoursTotal - studioHoursTotal) * 10) / 10;
  const costSavedUsd = Math.round(hoursSaved * hourlyRateUsd);

  let recommendedTierId: 'creator' | 'studio' | 'enterprise' = 'creator';
  if (clampedChapters > 60) {
    recommendedTierId = 'enterprise';
  } else if (clampedChapters >= 16) {
    recommendedTierId = 'studio';
  }

  return {
    monthlyChapters: clampedChapters,
    manualHoursTotal,
    studioHoursTotal,
    hoursSaved,
    costSavedUsd,
    recommendedTierId,
  };
}

/**
 * Validates the studio license / pipeline inquiry form.
 */
export function validateLicenseInquiry(input: {
  fullName: string;
  email: string;
  channelUrl: string;
  monthlyVolume: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!input.fullName || input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your name or studio handle (at least 2 characters).';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email.trim())) {
    errors.email = 'Please enter a valid work or creator email address.';
  }
  if (!input.channelUrl || input.channelUrl.trim().length < 3) {
    errors.channelUrl = 'Please specify your YouTube channel name, handle, or studio URL.';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
