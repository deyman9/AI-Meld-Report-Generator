"use client";

import SelectionCard from "@/components/ui/SelectionCard";

type ReportType = "FOUR09A" | "FIFTY_NINE_SIXTY";

interface StepReportTypeProps {
  value: ReportType | null;
  onChange: (value: ReportType) => void;
}

// 409A icon
function Icon409A() {
  return (
    <svg
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

// 59-60 icon
function Icon5960() {
  return (
    <svg
      className="w-8 h-8"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default function StepReportType({ value, onChange }: StepReportTypeProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Select Report Type</h2>
        <p className="mt-2 text-gray-500">
          Choose the type of valuation report you need to generate
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <SelectionCard
          title="409A Valuation"
          description="Common stock valuation for equity compensation purposes. Required for stock option grants."
          icon={<Icon409A />}
          selected={value === "FOUR09A"}
          onClick={() => onChange("FOUR09A")}
        />

        <SelectionCard
          title="Gift & Estate (59-60)"
          description="Business valuation for gift tax, estate planning, or ownership transfers. Revenue Ruling 59-60 compliant."
          icon={<Icon5960 />}
          selected={value === "FIFTY_NINE_SIXTY"}
          onClick={() => onChange("FIFTY_NINE_SIXTY")}
        />
      </div>
    </div>
  );
}

