/**
 * Audio utilities index - exports all audio player and recorder functions
 */

// Re-export audio player functions
export {
  startAudioPlayerWorklet,
  startAudioPlayer,
  type AudioPlayerNode,
  type AudioPlayerResult,
} from "./audioPlayer";

// Re-export audio recorder functions
export {
  startAudioRecorderWorklet,
  startAudioRecorder,
  stopMicrophone,
  type AudioRecorderNode,
  type AudioRecorderResult,
  type AudioRecorderHandler,
} from "./audioRecorder";
