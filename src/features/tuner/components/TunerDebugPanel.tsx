import type { TunerDebugState } from '@/shared/types/tuner';

type TunerDebugPanelText = {
  title: string;
  detector: string;
  profile: string;
  strings: string;
  mode: string;
  manualString: string;
  reference: string;
  stage: string;
  reason: string;
  sampleRate: string;
  signal: string;
  peak: string;
  clipping: string;
  minimum: string;
  retention: string;
  counters: string;
  smoothing: string;
  note: string;
  broad: string;
  refined: string;
  selected: string;
  refinement: string;
  comparison: string;
  events: string;
  fallback: string;
};

type TunerDebugPanelProps = {
  debug: TunerDebugState;
  text: TunerDebugPanelText;
};

function formatValue(value: number | null, digits = 2) {
  return value === null ? '--' : value.toFixed(digits);
}

export function TunerDebugPanel({ debug, text }: TunerDebugPanelProps) {
  return (
    <section className="debug-panel" aria-label={text.title}>
      <p className="debug-panel__title">{text.title}</p>
      <div className="debug-panel__grid">
        <span>{text.detector}</span>
        <strong>{debug.detectorId}</strong>
        <span>{text.profile}</span>
        <strong>{debug.captureProfileId}</strong>
        <span>{text.strings}</span>
        <strong>{debug.stringTypeId}</strong>
        <span>{text.mode}</span>
        <strong>{debug.mode}</strong>
        <span>{text.manualString}</span>
        <strong>{debug.manualStringId}</strong>
        <span>{text.reference}</span>
        <strong>{debug.referenceStringId ?? '--'}</strong>
        <span>{text.stage}</span>
        <strong>{debug.stage}</strong>
        <span>{text.reason}</span>
        <strong>{debug.rejectionReason ?? '--'}</strong>
        <span>{text.sampleRate}</span>
        <strong>{formatValue(debug.sampleRate, 0)}</strong>
        <span>{text.signal}</span>
        <strong>{debug.signalLevel.toFixed(4)}</strong>
        <span>{text.peak}</span>
        <strong>{debug.peak.toFixed(4)}</strong>
        <span>{text.minimum}</span>
        <strong>{debug.minimumSignalLevel.toFixed(4)}</strong>
        <span>{text.clipping}</span>
        <strong>{debug.clipping ? 'yes' : 'no'}</strong>
        <span>{text.retention}</span>
        <strong>
          {debug.hasRecentReading ? 'recent' : 'no'} / {debug.hasLogicalRetention ? 'logical' : 'no'}
        </strong>
        <span>{text.counters}</span>
        <strong>
          w{debug.weakSignalFrames} g{debug.consecutiveGoodFrames} b{debug.consecutiveBadFrames}
        </strong>
        <span>{text.smoothing}</span>
        <strong>
          {formatValue(debug.smoothingFrequency)} / {formatValue(debug.visualFrequency)}
        </strong>
        <span>{text.note}</span>
        <strong>{debug.noteLabel ?? '--'}</strong>
        <span>{text.fallback}</span>
        <strong>{debug.sessionFallback ? 'yes' : 'no'}</strong>
        <span>{text.broad}</span>
        <strong>
          {formatValue(debug.broadFrequency)} / {debug.broadConfidence.toFixed(2)}
        </strong>
        <span>{text.refined}</span>
        <strong>
          {formatValue(debug.refinedFrequency)} / {debug.refinedConfidence.toFixed(2)}
        </strong>
        <span>{text.selected}</span>
        <strong>
          {formatValue(debug.selectedFrequency)} / {debug.selectedConfidence.toFixed(2)}
        </strong>
        <span>{text.refinement}</span>
        <strong>
          {formatValue(debug.refinementMinFrequency)} - {formatValue(debug.refinementMaxFrequency)}
        </strong>
        <span>{text.comparison}</span>
        <strong>
          S {formatValue(debug.detectorComparison['autocorrelate-stable'].frequency)} /{' '}
          {debug.detectorComparison['autocorrelate-stable'].confidence.toFixed(2)} | C{' '}
          {formatValue(debug.detectorComparison['autocorrelate-classic'].frequency)} /{' '}
          {debug.detectorComparison['autocorrelate-classic'].confidence.toFixed(2)}
        </strong>
      </div>
      <div className="debug-panel__events">
        <span className="debug-panel__events-label">{text.events}</span>
        <ul className="debug-panel__events-list">
          {debug.events.map((event) => (
            <li key={`${event.timestamp}-${event.stage}-${event.detail}`}>
              <strong>{event.stage}</strong>
              <span>{event.reason ?? 'ok'}</span>
              <code>{event.detail}</code>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
