/**
 * Audio Player utilities for PCM audio playback
 */

export interface AudioPlayerNode {
  port: MessagePort;
  connect(destination: AudioNode): void;
  disconnect(): void;
}

export interface AudioPlayerResult {
  node: AudioWorkletNode;
  context: AudioContext;
}

/**
 * Starts an audio player worklet for PCM audio playback
 * @param sampleRate - Sample rate for the audio context (default: 24000)
 * @returns Promise resolving to player node and audio context
 */
export async function startAudioPlayerWorklet(
  sampleRate: number = 24000
): Promise<[AudioWorkletNode, AudioContext]> {
  const audioContext = new AudioContext({ sampleRate });

  const workletURL = new URL(
    "/audio/pcm-player-processor.js",
    window.location.origin
  );

  await audioContext.audioWorklet.addModule(workletURL);

  const audioPlayerNode = new AudioWorkletNode(
    audioContext,
    "pcm-player-processor"
  );

  audioPlayerNode.connect(audioContext.destination);

  return [audioPlayerNode, audioContext];
}

/**
 * Creates a simple audio player with resampling capabilities
 * @param defaultSourceSampleRate - Default sample rate for incoming audio
 * @returns Promise resolving to player object and audio context
 */
export async function startAudioPlayer(
  defaultSourceSampleRate: number = 24000
): Promise<
  [{ port: MessagePort; ctx: AudioContext; close: () => void }, AudioContext]
> {
  const AudioContextClass =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  // Queueing playback time to avoid gaps
  let playTime = audioCtx.currentTime + 0.05;

  /**
   * Resamples Float32Array from sourceRate to targetRate
   */
  const resampleFloat32ToAudioBuffer = async (
    float32: Float32Array,
    sourceRate: number,
    targetRate: number
  ): Promise<AudioBuffer> => {
    if (sourceRate === targetRate) {
      const buf = new AudioBuffer({
        length: float32.length,
        numberOfChannels: 1,
        sampleRate: targetRate,
      });
      buf.getChannelData(0).set(float32);
      return buf;
    }

    const targetLength = Math.ceil((float32.length * targetRate) / sourceRate);
    const offlineCtx = new OfflineAudioContext(1, targetLength, targetRate);

    const sourceBuffer = new AudioBuffer({
      length: float32.length,
      numberOfChannels: 1,
      sampleRate: sourceRate,
    });
    sourceBuffer.getChannelData(0).set(float32);

    const src = offlineCtx.createBufferSource();
    src.buffer = sourceBuffer;
    src.connect(offlineCtx.destination);
    src.start(0);

    return await offlineCtx.startRendering();
  };

  /**
   * Plays PCM ArrayBuffer with optional sample rate
   */
  const playPcmArrayBuffer = async (
    ab: ArrayBuffer,
    sourceSampleRate?: number
  ): Promise<void> => {
    const view = new DataView(ab);
    const len = view.byteLength / 2;
    const float32 = new Float32Array(len);

    for (let i = 0; i < len; i++) {
      const s = view.getInt16(i * 2, true); // little-endian
      float32[i] = s / 32768;
    }

    const srcRate =
      sourceSampleRate && Number.isFinite(sourceSampleRate)
        ? sourceSampleRate
        : defaultSourceSampleRate;

    let targetBuffer: AudioBuffer;
    try {
      targetBuffer = await resampleFloat32ToAudioBuffer(
        float32,
        srcRate,
        audioCtx.sampleRate
      );
    } catch (e) {
      const fallback = audioCtx.createBuffer(
        1,
        float32.length,
        audioCtx.sampleRate
      );
      fallback.getChannelData(0).set(float32);
      targetBuffer = fallback;
    }

    const src = audioCtx.createBufferSource();
    src.buffer = targetBuffer;
    src.connect(audioCtx.destination);

    // Schedule to play at playTime to maintain continuity
    src.start(playTime);
    playTime += targetBuffer.duration;
    src.onended = () => {
      if (playTime < audioCtx.currentTime) playTime = audioCtx.currentTime;
    };
  };

  interface AudioMessage {
    command?: string;
    buffer?: ArrayBuffer | Uint8Array;
    sampleRate?: number;
    sample_rate?: number;
  }

  const port: MessagePort = {
    postMessage: (
      message: AudioMessage | ArrayBuffer,
      _transfer?: Transferable[]
    ): void => {
      if (!message) return;

      if (
        typeof message === "object" &&
        "command" in message &&
        message.command === "endOfAudio"
      ) {
        return;
      }

      if (message instanceof ArrayBuffer) {
        playPcmArrayBuffer(message).catch((e) =>
          console.error("playPcm error", e)
        );
        return;
      }

      if (typeof message === "object" && message.buffer) {
        if (message.buffer instanceof ArrayBuffer) {
          const sampleRate = message.sampleRate || message.sample_rate;
          playPcmArrayBuffer(message.buffer, sampleRate).catch((e) =>
            console.error("playPcm error", e)
          );
          return;
        }

        if (message.buffer instanceof Uint8Array) {
          playPcmArrayBuffer(message.buffer.buffer as ArrayBuffer).catch((e) =>
            console.error("playPcm error", e)
          );
          return;
        }
      }

      console.warn("player: unexpected message shape", message);
    },
    start: () => {},
    close: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
    onmessage: null,
    onmessageerror: null,
  } as MessagePort;

  const playerObj = {
    port,
    ctx: audioCtx,
    close: () => audioCtx.close(),
  };

  return [playerObj, audioCtx] as const;
}
