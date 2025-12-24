"use client";

import Button from "@/components/ui/Button";
import type { ParsedModelResponse } from "@/types/excel";

type ReportType = "FOUR09A" | "FIFTY_NINE_SIXTY";

interface StepReviewProps {
  reportType: ReportType;
  parsedData: ParsedModelResponse;
  modelFileName: string;
  qualitativeContext: string;
  onGenerate: () => void;
  isGenerating: boolean;
}

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-green-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      className="w-5 h-5 text-amber-500"
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
  );
}

function InfoIcon() {
  return (
    <svg
      className="w-5 h-5 text-gray-400"
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
  );
}

export default function StepReview({
  reportType,
  parsedData,
  modelFileName,
  qualitativeContext,
  onGenerate,
  isGenerating,
}: StepReviewProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const reportTypeLabel = reportType === "FOUR09A" ? "409A Valuation" : "Gift & Estate (59-60)";

  const wordCount = qualitativeContext.trim()
    ? qualitativeContext.trim().split(/\s+/).length
    : 0;

  const hasWarnings =
    !parsedData.companyName ||
    !parsedData.valuationDate ||
    parsedData.warnings.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Review & Generate</h2>
        <p className="mt-2 text-gray-500">
          Review your selections before generating report sections
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200">
        {/* Report Type */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckIcon />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Report Type
              </p>
              <p className="text-gray-900 font-medium">{reportTypeLabel}</p>
            </div>
          </div>
        </div>

        {/* Company */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {parsedData.companyName ? <CheckIcon /> : <WarningIcon />}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </p>
              <p className="text-gray-900 font-medium">
                {parsedData.companyName || (
                  <span className="text-amber-600 italic">Not found - will need manual entry</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Valuation Date */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {parsedData.valuationDate ? <CheckIcon /> : <WarningIcon />}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valuation Date
              </p>
              <p className="text-gray-900 font-medium">
                {formatDate(parsedData.valuationDate) || (
                  <span className="text-amber-600 italic">Not found - will need manual entry</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Model File */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckIcon />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Model File
              </p>
              <p className="text-gray-900 font-medium">{modelFileName}</p>
            </div>
          </div>
        </div>

        {/* Context */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {wordCount > 0 ? <CheckIcon /> : <InfoIcon />}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qualitative Context
              </p>
              <p className="text-gray-900 font-medium">
                {wordCount > 0 ? (
                  `${wordCount} words`
                ) : (
                  <span className="text-gray-400 italic">None provided (optional)</span>
                )}
              </p>
            </div>
          </div>
          {wordCount > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer text-slate-600 hover:text-slate-800">
                View context
              </summary>
              <p className="mt-2 p-3 bg-white rounded border border-gray-200 text-gray-600 text-sm max-h-32 overflow-y-auto">
                {qualitativeContext}
              </p>
            </details>
          )}
        </div>
      </div>

      {/* Warnings */}
      {hasWarnings && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <WarningIcon />
            <div>
              <p className="font-medium text-amber-800">
                Some data may need review
              </p>
              <ul className="mt-2 text-sm text-amber-700 space-y-1">
                {!parsedData.companyName && (
                  <li>• Company name was not found in the model</li>
                )}
                {!parsedData.valuationDate && (
                  <li>• Valuation date was not found in the model</li>
                )}
                {parsedData.warnings.map((warning, index) => (
                  <li key={index}>• {warning}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-amber-600">
                The generated document will flag these areas for manual review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* What will be generated */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="font-medium text-blue-800 mb-2">Sections to be generated:</p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Company Overview</li>
          <li>• Industry Outlook (with citations)</li>
          <li>• Economic Outlook</li>
          <li>• Valuation Analysis for each approach used</li>
          <li>• Conclusion & Weighting Rationale</li>
          <li>• Flags & Review Notes</li>
        </ul>
      </div>

      {/* Generate Button */}
      <div className="text-center space-y-4">
        <Button
          size="lg"
          onClick={onGenerate}
          disabled={isGenerating}
          loading={isGenerating}
          className="min-w-[200px]"
        >
          {isGenerating ? "Generating..." : "Generate Sections"}
        </Button>

        <p className="text-sm text-gray-500">
          Generation may take 2-5 minutes. You&apos;ll receive an email when ready.
        </p>
      </div>
    </div>
  );
}
