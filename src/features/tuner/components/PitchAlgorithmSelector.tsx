import type { PitchDetectorId } from '@/shared/types/pitch';

type PitchAlgorithmSelectorText = {
  label: string;
  stable: string;
  classic: string;
  aubio: string;
  hybrid: string;
};

type PitchAlgorithmSelectorProps = {
  pitchDetectorId: PitchDetectorId;
  text: PitchAlgorithmSelectorText;
  onChange: (pitchDetectorId: PitchDetectorId) => void;
};

export function PitchAlgorithmSelector({
  pitchDetectorId,
  text,
  onChange,
}: PitchAlgorithmSelectorProps) {
  return (
    <section className="toolbar-group toolbar-group--algorithm">
      <span className="toolbar-label toolbar-label--sr">{text.label}</span>
      <div className="toolbar-toggle toolbar-toggle--quad" role="tablist" aria-label={text.label}>
        <button
          className={pitchDetectorId === 'autocorrelate-stable' ? 'is-active' : ''}
          onClick={() => onChange('autocorrelate-stable')}
          type="button"
        >
          {text.stable}
        </button>
        <button
          className={pitchDetectorId === 'autocorrelate-classic' ? 'is-active' : ''}
          onClick={() => onChange('autocorrelate-classic')}
          type="button"
        >
          {text.classic}
        </button>
        <button
          className={pitchDetectorId === 'aubio-default' ? 'is-active' : ''}
          onClick={() => onChange('aubio-default')}
          type="button"
        >
          {text.aubio}
        </button>
        <button
          className={pitchDetectorId === 'hybrid' ? 'is-active' : ''}
          onClick={() => onChange('hybrid')}
          type="button"
        >
          {text.hybrid}
        </button>
      </div>
    </section>
  );
}
