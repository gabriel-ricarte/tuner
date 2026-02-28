import { TunerGauge } from '@/features/tuner/components/TunerGauge';
import type { TunerSnapshot } from '@/shared/types/tuner';

type TunerDisplayText = {
  tuningOffset: string;
  cents: string;
  centered: string;
  low: string;
  high: string;
};

type TunerDisplayProps = {
  snapshot: TunerSnapshot;
  text: TunerDisplayText;
};

export function TunerDisplay({ snapshot, text }: TunerDisplayProps) {
  const noteLabel = snapshot.note?.label ?? '--';
  const targetLabel = snapshot.targetNote?.label ?? '--';
  const frequencyLabel =
    snapshot.frequency === null ? '--' : `${snapshot.frequency.toFixed(2)} Hz`;
  const state =
    snapshot.note === null ? 'neutral' : snapshot.confidence > 0 ? 'active' : 'held';
  const centered = snapshot.cents !== null && Math.abs(snapshot.cents) <= 4;

  return (
    <section className={`display-card display-card--${state}`}>
      <div className="note-stack">
        <strong className="note-value">{noteLabel}</strong>
        <span className={`target-value ${centered ? 'target-value--centered' : ''}`}>
          {targetLabel}
        </span>
      </div>
      <p className="frequency-value">{frequencyLabel}</p>
      <TunerGauge cents={snapshot.cents} state={state} text={text} />
    </section>
  );
}
