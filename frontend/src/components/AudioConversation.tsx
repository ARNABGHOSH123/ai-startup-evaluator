import { useState, useEffect, useCallback, useRef } from "react";
import { Mic, MicOff, Phone, User, Bot } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import {
  startAudioPlayerWorklet,
  startAudioRecorderWorklet,
  stopMicrophone,
} from "../utils/audio";

// Types
interface ConversationMessage {
  sender: "user" | "assistant";
  text: string;
  timestamp: number;
  id: string;
}

interface AudioConversationProps {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  setCallEnded: (open: boolean) => void;
}

// Generate session id and WebSocket URL
const sessionId = Math.random().toString().substring(10);
// Use secure WebSocket (wss) when page is served over https to avoid mixed content
const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
// Allow the env var to be either a bare host or a full URL; normalize to host
const wsHost = (import.meta.env.VITE_CLOUD_RUN_AUDIO_AGENT_URL || "")
  .replace(/^https?:\/\//i, "")
  .replace(/^wss?:\/\//i, "")
  .replace(/\/$/, "");
const wsBaseUrl = `${wsProtocol}://${wsHost}/ws/${sessionId}`;

// Helper functions
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Farewell detection helper (case-insensitive, matches "goodbye" or "good bye")
function isFarewell(text: string): boolean {
  return /\bgood\s*bye\b/i.test(text);
}

export default function AudioConversation({
  isOpen,
  onChange,
  setCallEnded,
}: AudioConversationProps) {
  // State management
  const [status, setStatus] = useState("Ready to connect");
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [conversationLog, setConversationLog] = useState<ConversationMessage[]>(
    [
      {
        id: "welcome",
        sender: "assistant",
        text: "Hello! I'm your AI startup risk assessor. Click the microphone and say hello to start our conversation.",
        timestamp: Date.now(),
      },
    ]
  );
  const [callDuration, setCallDuration] = useState(0);
  const [connecting, setConnecting] = useState(false);
  const [startingMic, setStartingMic] = useState(false);

  // Refs
  const websocketRef = useRef<WebSocket | null>(null);
  const currentMessageIdRef = useRef<string | null>(null);
  const audioPlayerRef = useRef<any>(null);
  const audioPlayerCtxRef = useRef<AudioContext | null>(null);
  const audioRecorderRef = useRef<any>(null);
  const audioRecorderCtxRef = useRef<AudioContext | null>(null);
  const audioRecorderStreamRef = useRef<MediaStream | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  const callStartTimeRef = useRef<number>(0);
  const connectionCounterRef = useRef(0);
  const isAudioModeRef = useRef(false);
  const shouldReconnectRef = useRef(true);
  const pendingEndRef = useRef(false);
  const audioBufferRef = useRef<Uint8Array[]>([]);
  const bufferTimerRef = useRef<number | null>(null);

  const [audioLevel, setAudioLevel] = useState(0);
  const [endingCall, setEndingCall] = useState(false);

  // Call timer
  useEffect(() => {
    if (isConnected) {
      callStartTimeRef.current = Date.now();
      const timer = setInterval(() => {
        setCallDuration(
          Math.floor((Date.now() - callStartTimeRef.current) / 1000)
        );
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isConnected]);

  // Auto-scroll to latest message
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationLog]);

  // Add message to conversation log
  const addMessageToLog = useCallback(
    (text: string, sender: "user" | "assistant") => {
      const message: ConversationMessage = {
        id: Math.random().toString(36).substring(7),
        sender,
        text,
        timestamp: Date.now(),
      };
      setConversationLog((prev) => [...prev, message]);
    },
    []
  );

  // WebSocket connection management
  const connectWebSocket = useCallback(
    (is_audio = false): Promise<void> => {
      // Avoid redundant reconnects
      if (isAudioModeRef.current === is_audio && websocketRef.current) {
        // If already open, resolve immediately
        if (websocketRef.current.readyState === WebSocket.OPEN) {
          return Promise.resolve();
        }
      }

      // Close existing socket if any
      try {
        websocketRef.current?.close();
      } catch {}
      websocketRef.current = null;

      connectionCounterRef.current++;
      const thisConnectionId = connectionCounterRef.current;
      isAudioModeRef.current = is_audio;

      const url = `${wsBaseUrl}?is_audio=${is_audio}&company_doc_id=abcde&founder_name=Sumalata`;
      const ws = new WebSocket(url);
      websocketRef.current = ws;
      setConnecting(true);
      setStatus(is_audio ? "Switching to audio..." : "Connecting...");

      return new Promise<void>((resolve) => {
        ws.onopen = () => {
          if (thisConnectionId !== connectionCounterRef.current) return;
          console.log("WebSocket connection opened.");
          setStatus("Connected");
          setIsConnected(true);
          setConnecting(false);
          resolve();
        };

        ws.onmessage = (event: MessageEvent) => {
          if (thisConnectionId !== connectionCounterRef.current) return;
          try {
            const message_from_server = JSON.parse(event.data as string);

            if (message_from_server.turn_complete) {
              // If we scheduled end of call based on farewell text, finish after audio turn completes
              if (pendingEndRef.current) {
                // Signal player to flush, then end after a brief delay to allow final samples to play
                try {
                  if (audioPlayerRef.current?.port) {
                    audioPlayerRef.current.port.postMessage({
                      command: "endOfAudio",
                    });
                  }
                } catch {}
                scheduleEndCall(600);
                pendingEndRef.current = false;
              }
              currentMessageIdRef.current = null;
              return;
            }

            if (message_from_server.interrupted) {
              if (audioPlayerRef.current?.port) {
                audioPlayerRef.current.port.postMessage({
                  command: "endOfAudio",
                });
              }
              return;
            }

            if (message_from_server.mime_type === "audio/pcm") {
              const ab = base64ToArrayBuffer(message_from_server.data);
              if (!audioPlayerRef.current) {
                // Lazy init player worklet and then play
                startAudioPlayerWorklet()
                  .then(([node]) => {
                    audioPlayerRef.current = node;
                    node.port.postMessage(ab);
                  })
                  .catch((e) => console.warn("player worklet init error", e));
              } else if (audioPlayerRef.current?.port) {
                // Worklet expects raw ArrayBuffer (Int16 PCM)
                audioPlayerRef.current.port.postMessage(ab);
              }
              return;
            }

            if (message_from_server.mime_type === "text/plain") {
              if (currentMessageIdRef.current == null) {
                currentMessageIdRef.current = Math.random()
                  .toString(36)
                  .substring(7);
                addMessageToLog("", "assistant");
              }
              setConversationLog((prev) => {
                const lastIdx = prev.length - 1;
                if (lastIdx >= 0 && prev[lastIdx].sender === "assistant") {
                  const updated = [...prev];
                  updated[lastIdx] = {
                    ...updated[lastIdx],
                    text: updated[lastIdx].text + message_from_server.data,
                  };
                  // Detect farewell phrase to schedule end (wait for turn_complete to actually end)
                  if (isFarewell(updated[lastIdx].text || "")) {
                    pendingEndRef.current = true;
                  }
                  return updated;
                }
                return prev;
              });
            }
          } catch (err) {
            console.error("Failed to parse WebSocket message:", err);
          }
        };

        ws.onclose = () => {
          if (thisConnectionId !== connectionCounterRef.current) return;
          setStatus("Connection lost");
          setIsConnected(false);
          websocketRef.current = null;
          setConnecting(true);
          if (shouldReconnectRef.current) {
            setTimeout(() => {
              setStatus("Reconnecting...");
              connectWebSocket(isAudioModeRef.current);
            }, 3000);
          } else {
            setConnecting(false);
          }
        };

        ws.onerror = (e) => {
          console.error("WebSocket error:", e);
        };
      });
    },
    [addMessageToLog]
  );

  // Audio functions
  const sendJsonOverWS = (payload: any) => {
    const ws = websocketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  };

  const audioRecorderHandler = (pcmArrayBuffer: ArrayBuffer) => {
    audioBufferRef.current.push(new Uint8Array(pcmArrayBuffer));
    if (!bufferTimerRef.current) {
      bufferTimerRef.current = window.setInterval(
        sendBufferedAudio,
        200
      ) as unknown as number;
    }

    // Compute audio level (RMS) for mic animation
    try {
      const view = new Int16Array(pcmArrayBuffer);
      if (view.length > 0) {
        let sumSquares = 0;
        for (let i = 0; i < view.length; i++) {
          const sample = view[i] / 32768; // normalize to [-1, 1]
          sumSquares += sample * sample;
        }
        const rms = Math.sqrt(sumSquares / view.length);
        // Smooth and clamp
        const smoothed = Math.min(1, Math.max(0, rms));
        setAudioLevel((prev) => prev * 0.7 + smoothed * 0.3);
      }
    } catch (e) {
      // ignore level computation errors
    }
  };

  const sendBufferedAudio = () => {
    if (!audioBufferRef.current || audioBufferRef.current.length === 0) return;

    let totalLength = 0;
    for (const chunk of audioBufferRef.current) totalLength += chunk.length;
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of audioBufferRef.current) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    const base64 = arrayBufferToBase64(combined.buffer);
    sendJsonOverWS({ mime_type: "audio/pcm", data: base64 });

    audioBufferRef.current = [];
  };

  const startAudioRecording = async () => {
    if (startingMic || isListening) return;
    setStartingMic(true);
    try {
      if (!audioPlayerRef.current) {
        const [playerNode, playerCtx] = await startAudioPlayerWorklet();
        audioPlayerRef.current = playerNode;
        audioPlayerCtxRef.current = playerCtx;
      }

      if (!audioRecorderRef.current) {
        const [rec, recCtx, recStream] = await startAudioRecorderWorklet(
          audioRecorderHandler
        );
        audioRecorderRef.current = rec;
        audioRecorderCtxRef.current = recCtx;
        audioRecorderStreamRef.current = recStream;
      }

      // Ensure WebSocket is in audio mode and open before enabling listening
      if (
        !(
          websocketRef.current &&
          websocketRef.current.readyState === WebSocket.OPEN &&
          isAudioModeRef.current === true
        )
      ) {
        try {
          websocketRef.current?.close();
        } catch (e) {}
        await connectWebSocket(true);
      }

      setIsListening(true);
      setStatus("Listening...");
      setStartingMic(false);
    } catch (e) {
      console.warn("startAudio error", e);
      setStatus("Error starting audio");
      setStartingMic(false);
    }
  };

  const stopAudioRecording = () => {
    if (bufferTimerRef.current) {
      clearInterval(bufferTimerRef.current);
      bufferTimerRef.current = null;
    }
    if (audioBufferRef.current && audioBufferRef.current.length > 0) {
      sendBufferedAudio();
    }
    try {
      // Disconnect worklet node if present
      audioRecorderRef.current?.disconnect?.();
    } catch (e) {}
    try {
      // Stop microphone tracks
      if (audioRecorderStreamRef.current) {
        stopMicrophone(audioRecorderStreamRef.current);
      }
    } catch (e) {}
    try {
      // Close audio context
      audioRecorderCtxRef.current?.close?.();
    } catch (e) {}
    audioRecorderRef.current = null;
    audioRecorderCtxRef.current = null;
    audioRecorderStreamRef.current = null;
    setIsListening(false);
    setStatus("Connected");
  };

  // Play short call-end tone and end sequence
  const playCallEndTone = async () => {
    try {
      const ctx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 440; // A4 beep
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      // quick ramp up and down like phone end-tone
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => ctx.close().catch(() => {}), 400);
    } catch {}
  };

  const scheduleEndCall = (delayMs = 300) => {
    if (endingCall) return;
    setEndingCall(true);
    playCallEndTone();
    // Stop mic if active
    stopAudioRecording();
    // Prevent reconnects and close socket now
    shouldReconnectRef.current = false;
    try {
      websocketRef.current?.close();
    } catch {}
    websocketRef.current = null;
    // Close player context to release audio
    try {
      audioPlayerCtxRef.current?.close();
    } catch {}
    audioPlayerCtxRef.current = null;
    audioPlayerRef.current = null;

    // Small animation window then close dialog
    setTimeout(() => {
      setIsConnected(false);
      setIsListening(false);
      setEndingCall(false);
      onChange(false);
      setCallEnded(true);
    }, delayMs);
  };

  const toggleMicrophone = () => {
    if (startingMic || connecting) return;
    if (isListening) {
      setIsMuted(true);
      stopAudioRecording();
    } else {
      setIsMuted(false);
      startAudioRecording();
    }
  };

  const endCall = () => {
    setCallDuration(0);
    scheduleEndCall(500);
  };

  // Initialize WebSocket connection
  useEffect(() => {
    if (isOpen) {
      connectWebSocket(false);
    }
    return () => {
      stopAudioRecording();
      try {
        websocketRef.current?.close();
      } catch (e) {}
    };
  }, [isOpen, connectWebSocket]);

  useEffect(() => {
    const last = conversationLog.at?.(-1)?.text || "";
    if (isFarewell(last)) {
      // Mark to end after the speaking turn actually completes
      pendingEndRef.current = true;
    }
  }, [conversationLog.at?.(-1)?.text]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onChange}>
      <DialogContent className="sm:max-w-4xl h-[600px] p-0" dismissible={false}>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden h-full flex flex-col">
          {endingCall && (
            <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-4 shadow-lg flex items-center gap-3 animate-[fade-in_150ms_ease-out]">
                <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-800 dark:text-gray-100 font-medium">
                  Ending call…
                </span>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI Startup Advisor</h3>
                  <p className="text-blue-100 text-sm flex items-center gap-2">
                    {isConnected
                      ? `Connected • ${formatDuration(callDuration)}`
                      : status}
                    {!isConnected && connecting && (
                      <span className="inline-block w-3 h-3 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected
                      ? "bg-green-400"
                      : connecting
                      ? "bg-yellow-400"
                      : "bg-red-400"
                  }`}
                />
                <span className="text-sm">
                  {isConnected ? "Live" : connecting ? "Connecting" : "Offline"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Left side - Controls */}
            <div className="w-80 bg-gray-50 dark:bg-gray-800 p-6 flex flex-col items-center justify-center border-r">
              {/* Microphone with animation */}
              <div className="relative mb-8 flex flex-col items-center">
                {/* Subtle pulse ring based on audio level when listening */}
                {isListening && (
                  <div
                    className="absolute rounded-full border-2 border-red-400/60 transition-all duration-100 ease-linear"
                    style={{
                      width: `${88 + audioLevel * 24}px`,
                      height: `${88 + audioLevel * 24}px`,
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      opacity: 0.8,
                    }}
                  />
                )}

                {/* Microphone button */}
                <button
                  onClick={toggleMicrophone}
                  disabled={!isConnected || startingMic || connecting}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : isConnected
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  style={{
                    boxShadow: isListening
                      ? `0 0 ${6 + audioLevel * 12}px ${Math.max(
                          0.2,
                          Math.min(0.6, 0.2 + audioLevel * 0.4)
                        )}rem rgba(239,68,68,0.35)`
                      : undefined,
                  }}
                >
                  {startingMic || connecting ? (
                    <span className="inline-block w-6 h-6 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                  ) : isMuted || !isListening ? (
                    <MicOff size={28} />
                  ) : (
                    <Mic size={28} />
                  )}
                </button>
              </div>

              {/* Status and controls */}
              <div className="text-center space-y-4">
                <p
                  className={`text-sm font-medium ${
                    isListening
                      ? "text-red-600"
                      : isConnected
                      ? "text-blue-600"
                      : "text-gray-500"
                  }`}
                >
                  {isListening ? "Listening..." : status}
                </p>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={toggleMicrophone}
                    disabled={!isConnected || startingMic || connecting}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isListening
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400"
                    }`}
                  >
                    {startingMic
                      ? "Starting..."
                      : isListening
                      ? "Stop Speaking"
                      : "Start Speaking"}
                  </button>

                  <button
                    onClick={endCall}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone size={16} />
                    End Call
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - Conversation */}
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  Conversation
                </h4>
                <p className="text-sm text-gray-500">
                  Real-time Founder - AI Risk Assessor conversation
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationLog.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.sender === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Bot size={16} className="text-blue-600" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <p
                        className={`text-xs mt-2 opacity-70 ${
                          message.sender === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    {message.sender === "user" && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <User size={16} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={conversationEndRef} />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
