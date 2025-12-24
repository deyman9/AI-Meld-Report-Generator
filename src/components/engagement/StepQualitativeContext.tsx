"use client";

import { useState, useEffect } from "react";

interface StepQualitativeContextProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StepQualitativeContext({
  value,
  onChange,
}: StepQualitativeContextProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const wordCount = localValue.trim() ? localValue.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Qualitative Context</h2>
        <p className="mt-2 text-gray-500">
          Add any additional context to help the AI generate better narratives (optional)
        </p>
      </div>

      {/* Context Textarea */}
      <div className="space-y-2">
        <label htmlFor="context" className="block text-sm font-medium text-gray-700">
          Context for AI Generation
        </label>
        <textarea
          id="context"
          rows={8}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Add any context about comp selection rationale, weighting decisions, client-specific considerations, or unusual circumstances...

For example:
• Why certain guideline companies were selected or excluded
• Rationale for weighting approaches differently
• Recent funding rounds or transactions to consider
• Industry-specific factors affecting valuation
• Client-specific circumstances the AI should know about"
        />
        <div className="flex justify-between text-sm text-gray-500">
          <span>This information helps the AI tailor the narrative to your specific engagement.</span>
          <span>{wordCount} words</span>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Tips for better results:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Mention why you weighted approaches the way you did</li>
              <li>Note any unusual company circumstances</li>
              <li>Explain comp selection if it&apos;s not obvious</li>
              <li>Flag any data limitations the AI should acknowledge</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Skip note */}
      <p className="text-center text-sm text-gray-500">
        This step is optional. You can skip it and the AI will generate narratives based solely on the model data.
      </p>
    </div>
  );
}

