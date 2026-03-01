import { describe, expect, it } from 'vitest';
import { CAPTURE_PROFILES } from '@/lib/audio/captureProfiles';
import { prepareAudioFrame, preparePitchInputFrame } from '@/lib/audio/frameAnalysis';
import { SAMPLE_RATE, createDcOffsetSignal, createSineWave } from '@/test/signalFactory';

describe('prepareAudioFrame', () => {
  it('removes DC offset from the buffer', () => {
    const input = createDcOffsetSignal(196, 0.22);
    const prepared = prepareAudioFrame(input, CAPTURE_PROFILES.balanceado);
    const mean =
      prepared.buffer.reduce((sum, value) => sum + value, 0) / prepared.buffer.length;

    expect(prepared.quality.dcOffset).toBeGreaterThan(0.15);
    expect(Math.abs(mean)).toBeLessThan(0.001);
  });

  it('normalizes by peak while preserving frame quality metadata', () => {
    const input = createSineWave(110, { amplitude: 0.42 });
    const prepared = prepareAudioFrame(input, CAPTURE_PROFILES.balanceado);
    const peak = Math.max(...Array.from(prepared.buffer, (value) => Math.abs(value)));

    expect(prepared.quality.peak).toBeGreaterThan(0.4);
    expect(peak).toBeCloseTo(1, 3);
  });

  it('flags clipping when the peak crosses the profile threshold', () => {
    const input = createSineWave(82.41, { amplitude: 1.02 });
    const prepared = prepareAudioFrame(input, CAPTURE_PROFILES.estrito);

    expect(prepared.quality.hasClipping).toBe(true);
  });

  it('boosts quiet frames before evaluating minimum signal quality', () => {
    const loud = prepareAudioFrame(
      createSineWave(146.83, { amplitude: 0.08 }),
      CAPTURE_PROFILES.balanceado,
    );
    const quiet = prepareAudioFrame(
      createSineWave(146.83, { amplitude: 0.004 }),
      CAPTURE_PROFILES.balanceado,
    );

    expect(loud.quality.hasMinimumSignal).toBe(true);
    expect(quiet.quality.rms).toBeGreaterThan(CAPTURE_PROFILES.balanceado.holdRms);
    expect(quiet.quality.hasMinimumSignal).toBe(true);
  });

  it('keeps the pitch input frame lighter than the gate frame for the same signal', () => {
    const input = createSineWave(196, { amplitude: 0.02 });
    const gateFrame = prepareAudioFrame(input, CAPTURE_PROFILES.balanceado, {
      sampleRate: SAMPLE_RATE,
      emphasisFrequency: 196,
    });
    const pitchFrame = preparePitchInputFrame(input, CAPTURE_PROFILES.balanceado, {
      sampleRate: SAMPLE_RATE,
      emphasisFrequency: 196,
    });

    expect(pitchFrame.quality.peak).toBeLessThanOrEqual(gateFrame.quality.peak);
    expect(pitchFrame.quality.rms).toBeLessThan(gateFrame.quality.rms);
  });
});
