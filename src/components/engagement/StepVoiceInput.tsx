"use client";

import { useState } from "react";
import VoiceRecorder from "./VoiceRecorder";
import TextArea from "@/components/ui/TextArea";

interface StepVoiceInputProps {
  transcript: string;
  onTranscriptChange: (transcript: string) => void;
}

export default function StepVoiceInput({
  transcript,
  onTranscriptChange,
}: StepVoiceInputProps) {
  const [showManualInput, setShowManualInput] = useState(false);

  const wordCount = transcript.trim()
    ? transcript.trim().split(/\s+/).length
    : 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Voice Input</h2>
        <p className="mt-2 text-gray-500">
          Record a brain dump about this engagement (optional)
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-slate-50 rounded-lg p-4">
        <p className="text-sm font-medium text-slate-700 mb-2">
          What to cover in your recording:
        </p>
        <ul className="text-sm text-slate-600 space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            Comp selection rationale and why certain companies were chosen
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            Weighting decisions between approaches
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            Client-specific context that affects the valuation
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            Any unusual circumstances or considerations
          </li>
        </ul>
      </div>

      {/* Voice Recorder */}
      <VoiceRecorder
        onTranscriptChange={onTranscriptChange}
        initialTranscript={showManualInput ? "" : transcript}
      />

      {/* Toggle for manual input */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-sm text-slate-600 hover:text-slate-900 underline"
        >
          {showManualInput ? "Use voice recording" : "Or type your notes manually"}
        </button>
      </div>

      {/* Manual text input */}
      {showManualInput && (
        <TextArea
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          placeholder="Type your notes about this engagement here..."
          rows={6}
        />
      )}

      {/* Word count */}
      {transcript && (
        <div className="text-center">
          <span className="text-sm text-gray-500">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
        </div>
      )}

      {/* Skip note */}
      <div className="text-center">
        <p className="text-sm text-gray-400">
          This step is optional. Click Skip or Next to continue without voice
          input.
        </p>
      </div>
    </div>
  );
}

