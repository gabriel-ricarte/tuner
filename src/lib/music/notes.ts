import { GUITAR_STRINGS } from '@/shared/constants/tuner';
import type { DetectedNote, GuitarString } from '@/shared/types/tuner';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const A4_REFERENCE_FREQUENCY = 440;

export function frequencyToMidi(frequency: number) {
  return 69 + 12 * Math.log2(frequency / A4_REFERENCE_FREQUENCY);
}

export function midiToNoteLabel(midi: number) {
  const rounded = Math.round(midi);
  const noteName = NOTE_NAMES[((rounded % 12) + 12) % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return `${noteName}${octave}`;
}

export function centsOffFromPitch(frequency: number, targetFrequency: number) {
  return 1200 * Math.log2(frequency / targetFrequency);
}

export function createDetectedNote(frequency: number): DetectedNote {
  const midi = frequencyToMidi(frequency);

  return {
    frequency,
    midi,
    label: midiToNoteLabel(midi)
  };
}

export function getNearestGuitarString(frequency: number): GuitarString {
  return GUITAR_STRINGS.reduce((closest, current) => {
    const currentDistance = Math.abs(centsOffFromPitch(frequency, current.frequency));
    const closestDistance = Math.abs(centsOffFromPitch(frequency, closest.frequency));
    return currentDistance < closestDistance ? current : closest;
  });
}
