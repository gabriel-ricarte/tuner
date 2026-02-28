type InstallPwaButtonProps = {
  disabled?: boolean;
  compact?: boolean;
  children: string;
  onClick: () => void;
};

export function InstallPwaButton({
  disabled = false,
  compact = false,
  children,
  onClick,
}: InstallPwaButtonProps) {
  return (
    <button
      className={`install-button ${compact ? 'install-button--compact' : ''}`.trim()}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
