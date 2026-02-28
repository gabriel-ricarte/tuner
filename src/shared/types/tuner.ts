import type { CaptureProfileId } from '@/shared/types/audio';

export type TunerStatus =
  | 'idle'
  | 'requesting-permission'
  | 'listening'
  | 'no-signal'
  | 'detecting'
  | 'error';

export type TunerMode = 'auto' | 'manual';

export type GuitarStringId = 'E2' | 'A2' | 'D3' | 'G3' | 'B3' | 'E4';

export type GuitarString = {
  id: GuitarStringId;
  label: string;
  midi: number;
  frequency: number;
};

export type DetectedNote = {
  frequency: number;
  midi: number;
  label: string;
};

export type TunerSnapshot = {
  frequency: number | null;
  note: DetectedNote | null;
  cents: number | null;
  targetNote: GuitarString | null;
  targetString: GuitarString | null;
  signalLevel: number;
  confidence: number;
};

export type TunerPreferences = {
  mode: TunerMode;
  targetStringId: GuitarStringId;
  captureProfileId: CaptureProfileId;
};

export type TunerHookResult = {
  status: TunerStatus;
  mode: TunerMode;
  captureProfileId: CaptureProfileId;
  frequency: number | null;
  note: DetectedNote | null;
  cents: number | null;
  targetNote: GuitarString | null;
  targetString: GuitarString | null;
  signalLevel: number;
  confidence: number;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  setCaptureProfile: (profileId: CaptureProfileId) => void;
  setTargetString: (value: GuitarStringId | null) => void;
  setMode: (mode: TunerMode) => void;
};
