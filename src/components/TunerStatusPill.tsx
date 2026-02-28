type TunerStatusPillProps = {
  children: string;
  tone: 'neutral' | 'active' | 'warning' | 'error';
};

export function TunerStatusPill({ children, tone }: TunerStatusPillProps) {
  return <p className={`status-pill status-pill--${tone}`}>{children}</p>;
}
