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
      throw new Error('Microphone capture is not supported in this browser.');
    }

    if (!window.isSecureContext) {
      throw new Error('Microphone access requires HTTPS or localhost.');
    }

    const audioContext = getAudioContext();

    if (stream) {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      return;
    }

    const permissionStream = await requestPermissionStream();

    try {
      stream = await requestPreferredStream(preferredConstraints, permissionStream);
      session.usedFallback = false;
    } catch {
      stream = permissionStream;
      session.usedFallback = true;
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const attachedNodes = attachStream(audioContext, options, stream);
    source = attachedNodes.source;
    analyser = attachedNodes.analyser;
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

  const restart = async () => {
    const audioContext = getAudioContext();
    const activeStream = stream;
    const activeTrack = activeStream?.getAudioTracks()[0] ?? null;

    source?.disconnect();
    analyser?.disconnect();
    source = null;
    analyser = null;

    if (activeStream && activeTrack && activeTrack.readyState === 'live') {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const attachedNodes = attachStream(audioContext, options, activeStream);
      source = attachedNodes.source;
      analyser = attachedNodes.analyser;
      buffer = new Float32Array(analyser.fftSize);
      return;
    }

    stop();
    await start();
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
    restart,
    stop,
    read,
  };
}

function attachStream(
  audioContext: AudioContext,
  options: MicrophoneControllerOptions,
  stream: MediaStream,
) {
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = options.fftSize;
  analyser.smoothingTimeConstant = options.smoothingTimeConstant;
  source.connect(analyser);

  return {
    source,
    analyser,
  };
}

async function requestPermissionStream() {
  return navigator.mediaDevices.getUserMedia({ audio: true });
}

async function requestPreferredStream(
  preferredConstraints: MediaTrackConstraints,
  permissionStream: MediaStream,
) {
  const [track] = permissionStream.getAudioTracks();

  if (track?.applyConstraints) {
    try {
      await track.applyConstraints(preferredConstraints);
      return permissionStream;
    } catch {
      // Fall through to a fresh request if applying constraints is ignored or rejected.
    }
  }

  try {
    const preferredStream = await navigator.mediaDevices.getUserMedia({
      audio: preferredConstraints,
    });
    stopStream(permissionStream);
    return preferredStream;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'OverconstrainedError') {
      return permissionStream;
    }

    throw error;
  }
}

function stopStream(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}
