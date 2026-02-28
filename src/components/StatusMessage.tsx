type StatusMessageProps = {
  tone?: 'neutral' | 'warning' | 'error';
  children: string;
};

export function StatusMessage({
  tone = 'neutral',
  children
}: StatusMessageProps) {
  return <p className={`status-message status-message--${tone}`}>{children}</p>;
}
