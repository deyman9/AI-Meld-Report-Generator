"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface GenerationStatusProps {
  jobId: string;
  engagementId?: string;
  companyName?: string;
}

interface JobStatus {
  id: string;
  engagementId: string;
  status: "pending" | "running" | "complete" | "failed";
  stage: string;
  progress: number;
  message: string;
  error?: string;
  warnings?: string[];
}

const STAGE_LABELS: Record<string, string> = {
  queued: "Queued",
  parsing_model: "Parsing Model",
  loading_template: "Loading Template",
  researching_company: "Researching Company",
  researching_industry: "Analyzing Industry",
  generating_narratives: "Generating Narratives",
  assembling_document: "Assembling Document",
  saving_report: "Saving Report",
  complete: "Complete",
  failed: "Failed",
};

export default function GenerationStatus({
  jobId,
  companyName,
}: GenerationStatusProps) {
  const router = useRouter();
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();

      if (data.success && data.job) {
        setStatus(data.job);
        setError(null);

        // If complete or failed, stop polling
        if (data.job.status === "complete" || data.job.status === "failed") {
          return true; // Signal to stop polling
        }
      } else {
        setError(data.error || "Failed to fetch job status");
      }
    } catch {
      setError("Failed to connect to server");
    }
    return false;
  }, [jobId]);

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Poll every 3 seconds
    const interval = setInterval(async () => {
      const shouldStop = await fetchStatus();
      setPollCount((prev) => prev + 1);

      if (shouldStop) {
        clearInterval(interval);
      }

      // Stop polling after 10 minutes (200 polls at 3s intervals)
      if (pollCount > 200) {
        clearInterval(interval);
        setError("Generation is taking longer than expected. Check dashboard for status.");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchStatus, pollCount]);

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const isComplete = status?.status === "complete";
  const isFailed = status?.status === "failed";
  const isRunning = status?.status === "running" || status?.status === "pending";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card padding="lg">
        <div className="text-center space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isComplete
                ? "Report Generated!"
                : isFailed
                ? "Generation Failed"
                : "Generating Report"}
            </h2>
            {companyName && (
              <p className="text-gray-500 mt-1">{companyName}</p>
            )}
          </div>

          {/* Status Icon */}
          <div className="flex justify-center">
            {isComplete ? (
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-600"
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
              </div>
            ) : isFailed ? (
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-600 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isRunning && status && (
            <div className="w-full">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{STAGE_LABELS[status.stage] || status.stage}</span>
                <span>{status.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{status.message}</p>
            </div>
          )}

          {/* Error Message */}
          {(isFailed || error) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-800">Error</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {status?.error || error || "An unknown error occurred"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isComplete && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Your report has been generated successfully and is ready for download.
              </p>
              {status?.warnings && status.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">
                    Notes for Review ({status.warnings.length})
                  </h4>
                  <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                    {status.warnings.slice(0, 5).map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                    {status.warnings.length > 5 && (
                      <li className="text-yellow-600">
                        ...and {status.warnings.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Info Message */}
          {isRunning && (
            <p className="text-sm text-gray-500">
              This may take 2-5 minutes. You can wait here or go to the dashboard —
              we&apos;ll email you when it&apos;s ready.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 pt-2">
            <Button onClick={handleGoToDashboard} variant={isComplete ? "primary" : "secondary"}>
              {isComplete ? "Go to Dashboard" : "View in Dashboard"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

