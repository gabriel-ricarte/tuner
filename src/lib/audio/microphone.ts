import { getAudioContext } from '@/lib/audio/audioContext';
import type { MicrophoneSession } from '@/shared/types/audio';

type MicrophoneControllerOptions = {
  fftSize: number;
  smoothingTimeConstant: number;
};

type AudioAnalysis = {
  buffer: Float32Array;
  sampleRate: number;
  session: MicrophoneSession;
};

export function createMicrophoneController(options: MicrophoneControllerOptions) {
  let stream: MediaStream | null = null;
  let source: MediaStreamAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  let buffer = new Float32Array(options.fftSize);
  let session: MicrophoneSession = {
    settings: null,
    constraints: null,
    usedFallback: false,
  };

  const preferredConstraints: MediaTrackConstraints = {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    channelCount: 1,
  };

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Este navegador nao oferece suporte ao microfone.');
    }

    const audioContext = getAudioContext();

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    if (stream) {
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: preferredConstraints,
      });
      session.usedFallback = false;
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      session.usedFallback = true;
    }

    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = options.fftSize;
    analyser.smoothingTimeConstant = options.smoothingTimeConstant;
    source.connect(analyser);
    buffer = new Float32Array(analyser.fftSize);

    const [track] = stream.getAudioTracks();
    session = {
      settings: track?.getSettings?.() ?? null,
      constraints: track?.getConstraints?.() ?? preferredConstraints,
      usedFallback: session.usedFallback,
    };
  };

  const stop = () => {
    source?.disconnect();
    analyser?.disconnect();
    stream?.getTracks().forEach((track) => track.stop());
    source = null;
    analyser = null;
    stream = null;
  };

  const read = (): AudioAnalysis | null => {
    if (!analyser) {
      return null;
    }

    analyser.getFloatTimeDomainData(buffer);

    return {
      buffer: Float32Array.from(buffer),
      sampleRate: getAudioContext().sampleRate,
      session,
    };
  };

  return {
    start,
    stop,
    read
  };
}
