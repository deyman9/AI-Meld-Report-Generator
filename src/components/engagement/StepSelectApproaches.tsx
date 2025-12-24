"use client";

import type { ApproachSelection } from "@/types/narrative";

const APPROACHES = [
  {
    id: "guidelinePublicCompany" as const,
    label: "Guideline Public Company Method",
    description: "Valuation based on publicly traded comparable companies",
  },
  {
    id: "guidelineTransaction" as const,
    label: "Guideline Comparable Transaction Method",
    description: "Valuation based on M&A transactions involving comparable companies",
  },
  {
    id: "incomeApproach" as const,
    label: "Income Approach (DCF)",
    description: "Discounted cash flow analysis based on projected financial performance",
  },
];

interface StepSelectApproachesProps {
  value: ApproachSelection;
  onChange: (value: ApproachSelection) => void;
}

export default function StepSelectApproaches({
  value,
  onChange,
}: StepSelectApproachesProps) {
  const handleToggle = (id: keyof ApproachSelection) => {
    onChange({
      ...value,
      [id]: !value[id],
    });
  };

  const selectedCount = Object.values(value).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Select Valuation Approaches
        </h2>
        <p className="mt-2 text-gray-500">
          Choose which approaches were used in your valuation model
        </p>
      </div>

      {/* Info note */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
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
          <div className="text-sm text-blue-700">
            <p className="font-medium">Note about Backsolve/OPM</p>
            <p className="mt-1">
              The Backsolve/OPM section uses standard templated methodology
              language and does not require AI-generated narrative.
            </p>
          </div>
        </div>
      </div>

      {/* Approach checkboxes */}
      <div className="space-y-4">
        {APPROACHES.map((approach) => (
          <label
            key={approach.id}
            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
              value[approach.id]
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <div className="flex items-center h-6">
              <input
                type="checkbox"
                checked={value[approach.id]}
                onChange={() => handleToggle(approach.id)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
            <div className="ml-4">
              <span
                className={`block text-base font-medium ${
                  value[approach.id] ? "text-blue-900" : "text-gray-900"
                }`}
              >
                {approach.label}
              </span>
              <span
                className={`block text-sm mt-1 ${
                  value[approach.id] ? "text-blue-700" : "text-gray-500"
                }`}
              >
                {approach.description}
              </span>
            </div>
          </label>
        ))}
      </div>

      {/* Selection summary */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center">
          {selectedCount === 0 ? (
            <span className="text-amber-600">
              Please select at least one approach to generate narratives
            </span>
          ) : (
            <span>
              {selectedCount} approach{selectedCount !== 1 ? "es" : ""} selected
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

