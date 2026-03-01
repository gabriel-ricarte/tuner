import { InstallPwaSheet } from '@/components/InstallPwaSheet';
import { SettingsGlassSheet } from '@/components/SettingsGlassSheet';
import { useI18n } from '@/lib/i18n/useI18n';
import { TopToolbar } from '@/components/TopToolbar';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TunerStatusPill } from '@/components/TunerStatusPill';
import { StringSelector } from '@/features/tuner/components/StringSelector';
import { TunerDisplay } from '@/features/tuner/components/TunerDisplay';
import { usePwaInstall } from '@/features/tuner/hooks/usePwaInstall';
import { useTuner } from '@/features/tuner/hooks/useTuner';
import { resolveStringSelectorViewState } from '@/features/tuner/viewState';
import { useState } from 'react';

export function TunerPage() {
  const { locale, setLocale, t } = useI18n();
  const tuner = useTuner(locale);
  const pwaInstall = usePwaInstall();
  const [installSheetOpen, setInstallSheetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isListening =
    tuner.status === 'listening' ||
    tuner.status === 'detecting' ||
    tuner.status === 'no-signal';
  const status = getStatusContent(tuner.status, tuner.error, tuner.confidence, tuner.cents, t.status);
  const stringSelectorState = resolveStringSelectorViewState({
    mode: tuner.mode,
    manualStringId: tuner.manualStringId,
    detectedTargetStringId: tuner.mode === 'auto' ? tuner.targetString?.id ?? null : null,
  });

  return (
    <main className="page-shell">
      <TopToolbar
        appName={t.labels.appName}
        installLabel={t.labels.install}
        settingsLabel={t.labels.settings}
        onInstallClick={() => {
          pwaInstall.resetDismiss();
          setInstallSheetOpen(true);
        }}
        onSettingsClick={() => setSettingsOpen(true)}
        showInstall={pwaInstall.canInstall}
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
        mode={stringSelectorState.mode}
        selectedString={stringSelectorState.selectedString}
        text={{
          tuningMode: t.labels.tuningMode,
          targetString: t.labels.targetString,
          auto: t.modes.auto,
          manual: t.modes.manual,
        }}
        onModeChange={(nextMode) => {
          tuner.setMode(nextMode);
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
      <SettingsGlassSheet
        captureProfileId={tuner.captureProfileId}
        captureProfileLabel={t.labels.captureProfile}
        closeLabel={t.install.close}
        languageLabel={t.labels.language}
        locale={locale}
        onCaptureProfileChange={tuner.setCaptureProfile}
        onClose={() => setSettingsOpen(false)}
        onLocaleChange={setLocale}
        onStringTypeChange={tuner.setStringType}
        open={settingsOpen}
        profileNames={t.profiles}
        stringTypeId={tuner.stringTypeId}
        stringTypeLabel={t.labels.stringType}
        stringTypeNames={t.stringTypes}
        title={t.labels.settings}
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
