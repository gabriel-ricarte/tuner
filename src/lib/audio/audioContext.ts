let sharedAudioContext: AudioContext | null = null;

export function getAudioContext() {
  if (sharedAudioContext === null) {
    sharedAudioContext = new AudioContext();
  }

  return sharedAudioContext;
}
