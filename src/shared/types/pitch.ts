export type PitchDetectorId =
  | 'autocorrelate-stable'
  | 'autocorrelate-classic'
  | 'aubio-default'
  | 'hybrid';

export type RuntimePitchDetectorId = Exclude<PitchDetectorId, 'hybrid'>;
