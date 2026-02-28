import { InstallPwaButton } from '@/components/InstallPwaButton';
import type { PwaInstallAvailability } from '@/shared/types/pwa';

type InstallPwaSheetText = {
  title: string;
  bodyPrompt: string;
  bodyIos: string;
  iosStepOpen: string;
  iosStepShare: string;
  iosStepAdd: string;
  confirm: string;
  close: string;
};

type InstallPwaSheetProps = {
  availability: PwaInstallAvailability;
  open: boolean;
  text: InstallPwaSheetText;
  onClose: () => void;
  onConfirm: () => void;
};

export function InstallPwaSheet({
  availability,
  open,
  text,
  onClose,
  onConfirm,
}: InstallPwaSheetProps) {
  if (!open || availability === 'installed' || availability === 'unavailable') {
    return null;
  }

  const isPrompt = availability === 'prompt';

  return (
    <div className="install-sheet-backdrop" onClick={onClose} role="presentation">
      <section
        aria-modal="true"
        className="install-sheet"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="install-sheet__handle" />
        <h2>{text.title}</h2>
        <p>{isPrompt ? text.bodyPrompt : text.bodyIos}</p>
        {!isPrompt ? (
          <ol className="install-sheet__steps">
            <li>{text.iosStepOpen}</li>
            <li>{text.iosStepShare}</li>
            <li>{text.iosStepAdd}</li>
          </ol>
        ) : null}
        <div className="install-sheet__actions">
          {isPrompt ? (
            <InstallPwaButton onClick={onConfirm}>{text.confirm}</InstallPwaButton>
          ) : null}
          <button className="install-sheet__close" onClick={onClose} type="button">
            {text.close}
          </button>
        </div>
      </section>
    </div>
  );
}
