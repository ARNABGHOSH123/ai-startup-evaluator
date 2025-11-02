export declare function startAudioRecorderWorklet(
  handler: (pcmData: ArrayBuffer) => void
): Promise<[any, any, MediaStream]>;
export declare function startAudioPlayer(): Promise<[any]>;
export declare function startAudioRecorder(
  handler: (pcmData: ArrayBuffer) => void,
  existingStream?: MediaStream
): Promise<[any, any, MediaStream]>;
