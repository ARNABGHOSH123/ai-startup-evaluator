/**
 * TypeScript declarations for audio utilities
 */

// Audio Player types and functions
export interface AudioPlayerNode {
  port: MessagePort;
  connect(destination: AudioNode): void;
  disconnect(): void;
}

export interface AudioPlayerResult {
  node: AudioWorkletNode;
  context: AudioContext;
}

export declare function startAudioPlayerWorklet(
  sampleRate?: number
): Promise<[AudioWorkletNode, AudioContext]>;

export declare function startAudioPlayer(
  defaultSourceSampleRate?: number
): Promise<
  [{ port: MessagePort; ctx: AudioContext; close: () => void }, AudioContext]
>;

// Audio Recorder types and functions
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

export declare function startAudioRecorderWorklet(
  audioRecorderHandler: AudioRecorderHandler,
  sampleRate?: number
): Promise<[AudioWorkletNode, AudioContext, MediaStream]>;

export declare function startAudioRecorder(
  onDataCallback: AudioRecorderHandler,
  existingStream?: MediaStream,
  sampleRate?: number
): Promise<[{ stop: () => void }, AudioContext, MediaStream]>;

export declare function stopMicrophone(stream: MediaStream): void;
