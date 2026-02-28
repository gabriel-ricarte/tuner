import { useEffect, useRef, useState } from 'react';

type TunerGaugeText = {
  tuningOffset: string;
  cents: string;
  centered: string;
  low: string;
  high: string;
};

type TunerGaugeProps = {
  cents: number | null;
  state: 'active' | 'held' | 'neutral';
  text: TunerGaugeText;
};

const MAX_CENTS = 50;

export function TunerGauge({ cents, state, text }: TunerGaugeProps) {
  const [visualCents, setVisualCents] = useState(0);
  const animationFrame = useRef<number | null>(null);
  const target = cents === null ? 0 : Math.max(-MAX_CENTS, Math.min(MAX_CENTS, cents));
  const percent = ((visualCents + MAX_CENTS) / (MAX_CENTS * 2)) * 100;
  const centered = cents !== null && Math.abs(cents) <= 4;
  const directionLabel = centered ? text.centered : visualCents < 0 ? text.low : text.high;
  const zoneClass = centered ? 'is-centered' : visualCents < 0 ? 'is-low' : 'is-high';

  useEffect(() => {
    const animate = () => {
      setVisualCents((current) => {
        const delta = target - current;
        const next = Math.abs(delta) < 0.35 ? target : current + delta * 0.22;
        return Math.max(-MAX_CENTS, Math.min(MAX_CENTS, next));
      });
      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [target]);


  return (
    <section className={`gauge-card gauge-card--${state} ${zoneClass}`} aria-label={text.tuningOffset}>
      <div className="gauge-scale">
        <span>-50</span>
        <span>0</span>
        <span>+50</span>
      </div>
      <div className="gauge-track">
        <div className="gauge-center-ring" />
        <div className="gauge-center-glow" />
        <div className={`gauge-center ${centered ? 'is-centered' : ''}`} />
        <div className="gauge-needle" style={{ left: `${percent}%` }} />
      </div>
      <p className={`gauge-value ${centered ? 'is-centered' : ''}`}>
        {cents === null ? '--' : `${cents > 0 ? '+' : ''}${Math.round(cents)} ${text.cents}`}
      </p>
      <p className={`gauge-direction ${centered ? 'is-centered' : ''}`}>{directionLabel}</p>
    </section>
  );
}
