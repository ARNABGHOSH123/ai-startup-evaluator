/**
 * Audio Recorder utilities for PCM audio recording
 */

export interface AudioRecorderNode {
  port: MessagePort;
  disconnect(): void;
}

export interface AudioRecorderResult {
  node: AudioWorkletNode;
  context: AudioContext;
  stream: MediaStream;
}

export type AudioRecorderHandler = (pcmData: ArrayBuffer) => void;

let micStream: MediaStream | null = null;

/**
 * Starts an audio recorder worklet for PCM audio recording
 * @param audioRecorderHandler - Callback function to handle recorded PCM data
 * @param sampleRate - Sample rate for the audio context (default: 16000)
 * @returns Promise resolving to recorder node, audio context, and media stream
 */
export async function startAudioRecorderWorklet(
  audioRecorderHandler: AudioRecorderHandler,
  sampleRate: number = 16000
): Promise<[AudioWorkletNode, AudioContext, MediaStream]> {
  const audioRecorderContext = new AudioContext({ sampleRate });

  const workletURL = new URL(
    "/audio/pcm-recorder-processor.js",
    window.location.origin
  );

  await audioRecorderContext.audioWorklet.addModule(workletURL);

  micStream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1 },
  });

  const source = audioRecorderContext.createMediaStreamSource(micStream);
  const audioRecorderNode = new AudioWorkletNode(
    audioRecorderContext,
    "pcm-recorder-processor"
  );

  source.connect(audioRecorderNode);

  audioRecorderNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
    const pcmData = convertFloat32ToPCM(event.data);
    audioRecorderHandler(pcmData);
  };

  return [audioRecorderNode, audioRecorderContext, micStream];
}

/**
 * Starts a simple audio recorder using ScriptProcessor
 * @param onDataCallback - Callback function to handle recorded PCM data
 * @param existingStream - Optional existing MediaStream to reuse
 * @param sampleRate - Sample rate for the audio context (default: 16000)
 * @returns Promise resolving to recorder node, audio context, and media stream
 */
export async function startAudioRecorder(
  onDataCallback: AudioRecorderHandler,
  existingStream?: MediaStream,
  sampleRate: number = 16000
): Promise<[{ stop: () => void }, AudioContext, MediaStream]> {
  let stream: MediaStream | null = existingStream || null;

  if (!stream) {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1 },
    });
  }

  const AudioContextClass =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass({ sampleRate });
  const source = audioCtx.createMediaStreamSource(stream);
  const bufferSize = 2048;
  const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1);

  processor.onaudioprocess = (event: AudioProcessingEvent) => {
    const input = event.inputBuffer.getChannelData(0);
    const length = input.length;
    const arrayBuffer = new ArrayBuffer(length * 2);
    const view = new DataView(arrayBuffer);
    let offset = 0;

    for (let i = 0; i < length; i++, offset += 2) {
      let sample = Math.max(-1, Math.min(1, input[i]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, sample, true);
    }

    try {
      onDataCallback(arrayBuffer);
    } catch (error) {
      console.error("recorder callback error", error);
    }
  };

  source.connect(processor);

  try {
    processor.connect(audioCtx.destination);
  } catch (error) {
    // Ignore connection errors
  }

  const node = {
    stop: (): void => {
      try {
        processor.disconnect();
        source.disconnect();
      } catch (error) {
        // Ignore disconnection errors
      }

      try {
        stream?.getTracks().forEach((track) => track.stop());
      } catch (error) {
        // Ignore track stop errors
      }

      try {
        audioCtx.close();
      } catch (error) {
        // Ignore context close errors
      }
    },
  };

  return [node, audioCtx, stream] as const;
}

/**
 * Stops the microphone stream
 * @param stream - MediaStream to stop
 */
export function stopMicrophone(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
  console.log("Microphone stopped.");
}

/**
 * Converts Float32Array audio data to 16-bit PCM ArrayBuffer
 * @param inputData - Float32Array audio data
 * @returns ArrayBuffer containing 16-bit PCM data
 */
function convertFloat32ToPCM(inputData: Float32Array): ArrayBuffer {
  const pcm16 = new Int16Array(inputData.length);

  for (let i = 0; i < inputData.length; i++) {
    // Multiply by 0x7fff (32767) to scale the float value to 16-bit PCM range
    pcm16[i] = inputData[i] * 0x7fff;
  }

  return pcm16.buffer;
}
