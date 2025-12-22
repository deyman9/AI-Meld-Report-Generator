"use client";

import { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import type { EngagementListItem } from "@/types/engagement";

interface EngagementListProps {
  engagements: EngagementListItem[];
  onRefresh?: () => void;
}

export default function EngagementList({
  engagements,
  onRefresh,
}: EngagementListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const formatDate = (dateStr: Date | string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const getReportTypeLabel = (type: string) => {
    return type === "FOUR09A" ? "409A" : "59-60";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="default">Draft</Badge>;
      case "PROCESSING":
        return <Badge variant="processing">Processing...</Badge>;
      case "COMPLETE":
        return <Badge variant="success">Ready</Badge>;
      case "ERROR":
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleDownload = async (engagementId: string) => {
    setDownloadingId(engagementId);
    try {
      const response = await fetch(`/api/engagements/${engagementId}/download`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Download failed");
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = "report.docx";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      alert(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  if (engagements.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden">
      {/* Refresh button */}
      {onRefresh && (
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </Button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valuation Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {engagements.map((engagement) => (
              <tr key={engagement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {engagement.companyName || (
                      <span className="text-gray-400 italic">Unnamed</span>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">
                    {getReportTypeLabel(engagement.reportType)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">
                    {formatDate(engagement.valuationDate)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(engagement.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-500">
                    {formatDate(engagement.createdAt)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {engagement.status === "DRAFT" && (
                    <Link
                      href={`/dashboard/engagement/${engagement.id}`}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      Continue
                    </Link>
                  )}
                  {engagement.status === "COMPLETE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(engagement.id)}
                      loading={downloadingId === engagement.id}
                    >
                      Download
                    </Button>
                  )}
                  {engagement.status === "ERROR" && (
                    <span
                      className="text-red-600 cursor-help"
                      title={engagement.errorMessage || "Unknown error"}
                    >
                      View Error
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {engagements.map((engagement) => (
          <div
            key={engagement.id}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {engagement.companyName || (
                    <span className="text-gray-400 italic">Unnamed</span>
                  )}
                </p>
                <p className="text-sm text-gray-500">
                  {getReportTypeLabel(engagement.reportType)} •{" "}
                  {formatDate(engagement.valuationDate)}
                </p>
              </div>
              {getStatusBadge(engagement.status)}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Created {formatDate(engagement.createdAt)}
              </span>

              {engagement.status === "DRAFT" && (
                <Link href={`/dashboard/engagement/${engagement.id}`}>
                  <Button variant="outline" size="sm">
                    Continue
                  </Button>
                </Link>
              )}
              {engagement.status === "COMPLETE" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(engagement.id)}
                  loading={downloadingId === engagement.id}
                >
                  Download
                </Button>
              )}
              {engagement.status === "ERROR" && (
                <span className="text-sm text-red-600">Error</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

