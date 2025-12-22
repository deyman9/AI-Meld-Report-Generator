"use client";

import type { ParsedModelResponse } from "@/types/excel";

interface ParsedDataPreviewProps {
  data: ParsedModelResponse;
}

function WarningIcon() {
  return (
    <svg
      className="w-4 h-4 text-amber-500"
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

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-green-500"
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

export default function ParsedDataPreview({ data }: ParsedDataPreviewProps) {
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

  const formatCurrency = (value: number | null) => {
    if (value === null) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">Extracted Data</h3>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Company Name */}
        <div className="flex items-start gap-2">
          {data.companyName ? <CheckIcon /> : <WarningIcon />}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </p>
            <p className="text-gray-900">
              {data.companyName || (
                <span className="text-amber-600 italic">Not found</span>
              )}
            </p>
          </div>
        </div>

        {/* Valuation Date */}
        <div className="flex items-start gap-2">
          {data.valuationDate ? <CheckIcon /> : <WarningIcon />}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valuation Date
            </p>
            <p className="text-gray-900">
              {formatDate(data.valuationDate) || (
                <span className="text-amber-600 italic">Not found</span>
              )}
            </p>
          </div>
        </div>

        {/* Exhibits */}
        <div className="flex items-start gap-2">
          {data.exhibitCount > 0 ? <CheckIcon /> : <WarningIcon />}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Exhibits
            </p>
            <p className="text-gray-900">
              {data.exhibitCount > 0 ? (
                `${data.exhibitCount} found`
              ) : (
                <span className="text-amber-600 italic">None found</span>
              )}
            </p>
          </div>
        </div>

        {/* Concluded Value */}
        <div className="flex items-start gap-2">
          {data.concludedValue ? <CheckIcon /> : <WarningIcon />}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Concluded Value
            </p>
            <p className="text-gray-900">
              {formatCurrency(data.concludedValue) || (
                <span className="text-amber-600 italic">Not found</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Approaches */}
      {data.approaches.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            Valuation Approaches
          </p>
          <div className="flex flex-wrap gap-2">
            {data.approaches.map((approach, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
              >
                {approach.name}
                {approach.weight !== null && (
                  <span className="ml-1 text-gray-400">
                    ({Math.round(approach.weight * 100)}%)
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* DLOM */}
      {data.dlom !== null && (
        <div className="flex items-start gap-2">
          <CheckIcon />
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              DLOM
            </p>
            <p className="text-gray-900">{Math.round(data.dlom * 100)}%</p>
          </div>
        </div>
      )}

      {/* Warnings */}
      {data.warnings.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-2">
            Warnings
          </p>
          <ul className="space-y-1">
            {data.warnings.map((warning, index) => (
              <li key={index} className="text-sm text-amber-600 flex items-start gap-2">
                <WarningIcon />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Errors */}
      {data.errors.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-red-600 uppercase tracking-wider mb-2">
            Errors
          </p>
          <ul className="space-y-1">
            {data.errors.map((error, index) => (
              <li key={index} className="text-sm text-red-600">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

