"use client";

import Spinner from "./Spinner";

interface LoadingOverlayProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingOverlay({ 
  message = "Loading...", 
  fullScreen = false 
}: LoadingOverlayProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-50"
    : "absolute inset-0 z-10";

  return (
    <div className={`${containerClasses} bg-white/80 backdrop-blur-sm flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

// Inline loading state for buttons and small areas
export function LoadingInline({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Spinner size="sm" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
}

// Page-level loading state
export function LoadingPage({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

