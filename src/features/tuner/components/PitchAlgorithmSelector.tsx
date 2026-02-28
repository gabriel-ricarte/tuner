import type { PitchDetectorId } from '@/shared/types/pitch';

type PitchAlgorithmSelectorText = {
  label: string;
  stable: string;
  classic: string;
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
      <div className="toolbar-toggle toolbar-toggle--dual" role="tablist" aria-label={text.label}>
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
      </div>
    </section>
  );
}
