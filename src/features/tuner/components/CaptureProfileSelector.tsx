import { CAPTURE_PROFILES } from '@/lib/audio/captureProfiles';
import type { CaptureProfileId } from '@/shared/types/audio';

type CaptureProfileSelectorText = {
  label: string;
  profiles: Record<CaptureProfileId, string>;
};

type CaptureProfileSelectorProps = {
  profileId: CaptureProfileId;
  text: CaptureProfileSelectorText;
  onChange: (profileId: CaptureProfileId) => void;
};

export function CaptureProfileSelector({
  profileId,
  text,
  onChange,
}: CaptureProfileSelectorProps) {
  return (
    <section className="toolbar-group toolbar-group--profile">
      <span className="toolbar-label toolbar-label--sr">{text.label}</span>
      <div className="toolbar-toggle toolbar-toggle--wide" role="tablist" aria-label={text.label}>
        {Object.values(CAPTURE_PROFILES).map((profile) => (
          <button
            key={profile.id}
            className={profile.id === profileId ? 'is-active' : ''}
            onClick={() => onChange(profile.id)}
            type="button"
          >
            {text.profiles[profile.id]}
          </button>
        ))}
      </div>
    </section>
  );
}
