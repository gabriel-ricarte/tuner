import { describe, expect, it } from 'vitest';
import { resolveStringSelectorViewState } from '@/features/tuner/viewState';

describe('resolveStringSelectorViewState', () => {
  it('keeps the manual selection even when auto detection points to another string', () => {
    const state = resolveStringSelectorViewState({
      mode: 'auto',
      manualStringId: 'E2',
      detectedTargetStringId: 'G3',
    });

    expect(state.selectedString).toBe('E2');
    expect(state.showManualGrid).toBe(false);
  });

  it('restores the last manual choice when returning to manual mode', () => {
    const autoState = resolveStringSelectorViewState({
      mode: 'auto',
      manualStringId: 'B3',
      detectedTargetStringId: 'E2',
    });
    const manualState = resolveStringSelectorViewState({
      mode: 'manual',
      manualStringId: autoState.selectedString,
      detectedTargetStringId: 'E2',
    });

    expect(manualState.selectedString).toBe('B3');
    expect(manualState.showManualGrid).toBe(true);
  });

  it('ignores repeated auto detections so the manual highlight does not flicker', () => {
    const detections = ['E2', 'A2', 'D3', 'G3', 'E2'] as const;

    const selections = detections.map((detectedTargetStringId) =>
      resolveStringSelectorViewState({
        mode: 'auto',
        manualStringId: 'D3',
        detectedTargetStringId,
      }).selectedString,
    );

    expect(selections).toEqual(['D3', 'D3', 'D3', 'D3', 'D3']);
  });
});
