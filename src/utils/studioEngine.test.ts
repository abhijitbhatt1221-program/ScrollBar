import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_PANELS,
  calculateNarrationDuration,
  buildTimelineCues,
  formatTimecode,
  filterPanelsByConfidence,
  generateNleExportPayload,
  calculateCreatorRoi,
  validateLicenseInquiry,
} from './studioEngine';

test('calculateNarrationDuration computes accurate speaking time from word count and WPM', () => {
  // 20 words at 150 WPM = (20/150)*60 + 0.4 = 8.0 + 0.4 = 8.4s
  const script20Words =
    'One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty';
  assert.equal(calculateNarrationDuration(script20Words, 150), 8.4);
  assert.equal(calculateNarrationDuration('', 150), 1.5);
});

test('buildTimelineCues builds sequential non-overlapping frame ranges at 60fps', () => {
  const cues = buildTimelineCues(INITIAL_PANELS, 60);
  assert.equal(cues.length, 4);
  assert.equal(cues[0].startSec, 0);
  assert.equal(cues[0].endSec, 5.2);
  assert.equal(cues[0].startFrame, 0);
  assert.equal(cues[0].endFrame, 312);

  assert.equal(cues[1].startSec, 5.2);
  assert.equal(cues[1].endSec, 10.0);
  assert.equal(cues[3].endSec, 19.5);
  assert.equal(cues[3].endFrame, 1170);
});

test('formatTimecode formats seconds into MM:SS.d tabular format', () => {
  assert.equal(formatTimecode(0), '00:00.0');
  assert.equal(formatTimecode(5.2), '00:05.2');
  assert.equal(formatTimecode(65.8), '01:05.8');
});

test('filterPanelsByConfidence filters slices by YOLO confidence threshold', () => {
  const highConf = filterPanelsByConfidence(INITIAL_PANELS, 0.99);
  assert.equal(highConf.length, 2); // 0.992 and 0.995
});

test('generateNleExportPayload outputs valid CapCut JSON and DaVinci FCPXML', () => {
  const capcut = generateNleExportPayload('Northern Citadel Ch 14', INITIAL_PANELS, 'capcut-json', 60);
  assert.equal(capcut.filename, 'northern-citadel-ch-14-capcut-draft.json');
  assert.equal(capcut.totalDurationSec, 19.5);
  const parsed = JSON.parse(capcut.content);
  assert.equal(parsed.tracks.length, 2);
  assert.equal(parsed.tracks[0].segments.length, 4);

  const fcpxml = generateNleExportPayload('Northern Citadel Ch 14', INITIAL_PANELS, 'davinci-fcpxml', 60);
  assert.equal(fcpxml.filename, 'northern-citadel-ch-14-resolve.fcpxml');
  assert.ok(fcpxml.content.includes('<fcpxml version="1.10">'));
  assert.ok(fcpxml.content.includes('duration="1170/60s"'));
});

test('calculateCreatorRoi computes saved hours and recommends tier accurately', () => {
  const roi = calculateCreatorRoi(20, 40);
  assert.equal(roi.manualHoursTotal, 64);
  assert.equal(roi.studioHoursTotal, 7);
  assert.equal(roi.hoursSaved, 57);
  assert.equal(roi.costSavedUsd, 2280);
  assert.equal(roi.recommendedTierId, 'studio');
});

test('validateLicenseInquiry catches invalid email and empty fields', () => {
  const invalid = validateLicenseInquiry({
    fullName: 'A',
    email: 'not-an-email',
    channelUrl: '',
    monthlyVolume: '20',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.channelUrl);

  const valid = validateLicenseInquiry({
    fullName: 'Jin Woo Studio',
    email: 'producer@manhwarecaps.io',
    channelUrl: '@ManhwaChronicleHD',
    monthlyVolume: '30',
  });
  assert.equal(valid.valid, true);
});
