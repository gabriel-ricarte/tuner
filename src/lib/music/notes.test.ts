import { describe, expect, it } from 'vitest';
import {
  centsOffFromPitch,
  createDetectedNote,
  frequencyToMidi,
  getNearestGuitarString,
  midiToNoteLabel,
} from '@/lib/music/notes';

describe('music note helpers', () => {
  it('converts A4 to MIDI 69', () => {
    expect(frequencyToMidi(440)).toBeCloseTo(69, 5);
  });

  it('maps MIDI values to note labels', () => {
    expect(midiToNoteLabel(40)).toBe('E2');
    expect(midiToNoteLabel(59)).toBe('B3');
    expect(midiToNoteLabel(64)).toBe('E4');
  });

  it('returns 0 cents when frequency matches the target', () => {
    expect(centsOffFromPitch(329.63, 329.63)).toBeCloseTo(0, 8);
  });

  it('creates a detected note object from frequency', () => {
    const note = createDetectedNote(110);

    expect(note.label).toBe('A2');
    expect(note.frequency).toBe(110);
  });

  it('finds the nearest guitar string for nearby frequencies', () => {
    expect(getNearestGuitarString(108).id).toBe('A2');
    expect(getNearestGuitarString(194).id).toBe('G3');
    expect(getNearestGuitarString(332).id).toBe('E4');
  });
});
