"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import EngagementList from "./EngagementList";
import type { EngagementListItem } from "@/types/engagement";

// Document icon for empty state
function DocumentIcon() {
  return (
    <svg
      className="w-12 h-12"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

interface DashboardContentProps {
  userName?: string | null;
}

export default function DashboardContent({ userName }: DashboardContentProps) {
  const [engagements, setEngagements] = useState<EngagementListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEngagements = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/engagements");
      
      if (!response.ok) {
        throw new Error("Failed to fetch engagements");
      }
      
      const data = await response.json();
      
      if (data.success) {
        setEngagements(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch engagements");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEngagements();
  }, [fetchEngagements]);

  // Auto-refresh for processing engagements
  useEffect(() => {
    const hasProcessing = engagements.some((e) => e.status === "PROCESSING");
    
    if (hasProcessing) {
      const interval = setInterval(fetchEngagements, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [engagements, fetchEngagements]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back{userName ? `, ${userName.split(" ")[0]}` : ""}!
        </h1>
        <p className="mt-1 text-gray-500">
          Generate AI-powered valuation reports in minutes.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Link href="/new">
          <Button size="lg">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Report
          </Button>
        </Link>
        <Link href="/dashboard/settings">
          <Button variant="secondary" size="lg">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Settings
          </Button>
        </Link>
      </div>

      {/* Recent Engagements */}
      <Card
        title="Recent Engagements"
        description="Your most recent valuation reports"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchEngagements}>
                Retry
              </Button>
            </div>
          </div>
        ) : engagements.length === 0 ? (
          <EmptyState
            icon={<DocumentIcon />}
            title="No reports yet"
            description="Create your first valuation report to get started. Upload your Excel model and let AI do the heavy lifting."
            action={
              <Link href="/new">
                <Button>Create First Report</Button>
              </Link>
            }
          />
        ) : (
          <EngagementList
            engagements={engagements}
            onRefresh={fetchEngagements}
          />
        )}
      </Card>
    </div>
  );
}

