"use client";

import { useEffect, useState } from "react";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import Button from "@/components/ui/Button";

interface VoiceRecorderProps {
  onTranscriptChange: (transcript: string) => void;
  initialTranscript?: string;
}

export default function VoiceRecorder({
  onTranscriptChange,
  initialTranscript = "",
}: VoiceRecorderProps) {
  const {
    isListening,
    transcript,
    interimTranscript,
    start,
    stop,
    reset,
    isSupported,
    error,
  } = useSpeechRecognition();

  const [recordingDuration, setRecordingDuration] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize with existing transcript
  useEffect(() => {
    if (!hasInitialized && initialTranscript) {
      setHasInitialized(true);
    }
  }, [initialTranscript, hasInitialized]);

  // Update parent when transcript changes
  useEffect(() => {
    const fullTranscript = initialTranscript
      ? `${initialTranscript} ${transcript}`.trim()
      : transcript;
    onTranscriptChange(fullTranscript);
  }, [transcript, initialTranscript, onTranscriptChange]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isListening) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggle = () => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  };

  const handleReset = () => {
    reset();
    onTranscriptChange("");
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="font-medium text-amber-800">
              Voice recording not supported
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Your browser doesn&apos;t support speech recognition. Please use
              Chrome, Edge, or Safari, or type your notes manually below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recording controls */}
      <div className="flex flex-col items-center gap-4">
        {/* Main record button */}
        <button
          type="button"
          onClick={handleToggle}
          className={`
            relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
            ${
              isListening
                ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200"
                : "bg-slate-900 hover:bg-slate-800 shadow-lg"
            }
          `}
        >
          {/* Pulsing ring when recording */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
              <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse opacity-50" />
            </>
          )}

          {/* Microphone icon */}
          <svg
            className="w-8 h-8 text-white relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isListening ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            )}
          </svg>
        </button>

        {/* Recording status */}
        <div className="text-center">
          {isListening ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-600 font-medium">
                Recording {formatDuration(recordingDuration)}
              </span>
            </div>
          ) : (
            <p className="text-gray-500">Click to start recording</p>
          )}
        </div>
      </div>

      {/* Live transcript preview */}
      {(transcript || interimTranscript) && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-400 italic"> {interimTranscript}</span>
            )}
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Clear button */}
      {transcript && !isListening && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Clear Recording
          </Button>
        </div>
      )}
    </div>
  );
}

