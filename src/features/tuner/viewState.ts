import type { GuitarStringId, TunerMode } from '@/shared/types/tuner';

type StringSelectorViewStateInput = {
  mode: TunerMode;
  manualStringId: GuitarStringId;
  detectedTargetStringId: GuitarStringId | null;
};

export type StringSelectorViewState = {
  mode: TunerMode;
  selectedString: GuitarStringId;
  showManualGrid: boolean;
};

export function resolveStringSelectorViewState({
  mode,
  manualStringId,
}: StringSelectorViewStateInput): StringSelectorViewState {
  return {
    mode,
    selectedString: manualStringId,
    showManualGrid: mode === 'manual',
  };
}
