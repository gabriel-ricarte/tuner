import { InstallPwaSheet } from '@/components/InstallPwaSheet';
import { useI18n } from '@/lib/i18n/useI18n';
import { TopToolbar } from '@/components/TopToolbar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TunerStatusPill } from '@/components/TunerStatusPill';
import { TunerDebugPanel } from '@/features/tuner/components/TunerDebugPanel';
import { StringSelector } from '@/features/tuner/components/StringSelector';
import { TunerDisplay } from '@/features/tuner/components/TunerDisplay';
import { usePwaInstall } from '@/features/tuner/hooks/usePwaInstall';
import { useTuner } from '@/features/tuner/hooks/useTuner';
import { useState } from 'react';

export function TunerPage() {
  const { locale, setLocale, t } = useI18n();
  const tuner = useTuner(locale);
  const pwaInstall = usePwaInstall();
  const [installSheetOpen, setInstallSheetOpen] = useState(false);
  const isListening =
    tuner.status === 'listening' ||
    tuner.status === 'detecting' ||
    tuner.status === 'no-signal';
  const status = getStatusContent(tuner.status, tuner.error, tuner.confidence, tuner.cents, t.status);

  return (
    <main className="page-shell">
      <TopToolbar
        appName={t.labels.appName}
        captureProfileId={tuner.captureProfileId}
        captureProfileLabel={t.labels.captureProfile}
        installLabel={t.labels.install}
        languageLabel={t.labels.language}
        locale={locale}
        onCaptureProfileChange={tuner.setCaptureProfile}
        onInstallClick={() => {
          pwaInstall.resetDismiss();
          setInstallSheetOpen(true);
        }}
        onLocaleChange={setLocale}
        onPitchDetectorChange={tuner.setPitchDetector}
        onStringTypeChange={tuner.setStringType}
        pitchDetectorId={tuner.pitchDetectorId}
        pitchDetectorLabel={t.labels.pitchDetector}
        pitchDetectorNames={t.pitchDetectors}
        profileNames={t.profiles}
        showInstall={pwaInstall.canInstall}
        stringTypeId={tuner.stringTypeId}
        stringTypeLabel={t.labels.stringType}
        stringTypeNames={t.stringTypes}
      />

      <section className="display-stage">
        <TunerDisplay
          snapshot={{
            frequency: tuner.frequency,
            note: tuner.note,
            cents: tuner.cents,
            targetNote: tuner.targetNote,
            targetString: tuner.targetString,
            signalLevel: tuner.signalLevel,
            confidence: tuner.confidence
          }}
          text={{
            tuningOffset: t.labels.tuningOffset,
            cents: t.labels.cents,
            centered: t.status.inTune,
            low: t.status.low,
            high: t.status.high,
          }}
        />
      </section>

      <StringSelector
        locale={locale}
        mode={tuner.mode}
        selectedString={tuner.mode === 'manual' ? tuner.targetString?.id ?? null : null}
        text={{
          tuningMode: t.labels.tuningMode,
          targetString: t.labels.targetString,
          auto: t.modes.auto,
          manual: t.modes.manual,
        }}
        onModeChange={(nextMode) => {
          tuner.setMode(nextMode);
          if (nextMode === 'auto') {
            tuner.setTargetString(null);
          }
        }}
        onSelectString={tuner.setTargetString}
      />

      <section className="control-panel">
        <PrimaryButton onClick={isListening ? tuner.stop : tuner.start}>
          {isListening ? t.actions.stop : t.actions.start}
        </PrimaryButton>
        <TunerStatusPill tone={status.tone}>{status.label}</TunerStatusPill>
        {tuner.error ? <p className="error-banner">{tuner.error}</p> : null}
      </section>

      <TunerDebugPanel debug={tuner.debug} text={t.debug} />

      <InstallPwaSheet
        availability={pwaInstall.availability}
        onClose={() => {
          pwaInstall.dismiss();
          setInstallSheetOpen(false);
        }}
        onConfirm={async () => {
          await pwaInstall.promptInstall();
          setInstallSheetOpen(false);
        }}
        open={installSheetOpen}
        text={t.install}
      />
    </main>
  );
}

function getStatusContent(
  status: ReturnType<typeof useTuner>['status'],
  error: string | null,
  confidence: number,
  cents: number | null,
  labels: {
    listening: string;
    detecting: string;
    noSignal: string;
    permission: string;
    idle: string;
    error: string;
    inTune: string;
    low: string;
    high: string;
    held: string;
  },
) {
  if (error) {
    return { label: labels.error, tone: 'error' as const };
  }

  if (status === 'requesting-permission') {
    return { label: labels.permission, tone: 'neutral' as const };
  }

  if (status === 'idle') {
    return { label: labels.idle, tone: 'neutral' as const };
  }

  if (status === 'no-signal') {
    return { label: labels.noSignal, tone: 'warning' as const };
  }

  if (status === 'detecting') {
    return {
      label: confidence === 0 && cents !== null ? labels.held : labels.detecting,
      tone: 'warning' as const,
    };
  }

  if (cents !== null && Math.abs(cents) <= 4) {
    return { label: labels.inTune, tone: 'active' as const };
  }

  return { label: labels.listening, tone: 'active' as const };
}
