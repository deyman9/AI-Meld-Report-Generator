"use client";

import { ReactNode } from "react";

interface SelectionCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function SelectionCard({
  title,
  description,
  icon,
  selected = false,
  onClick,
  disabled = false,
}: SelectionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center w-full p-8 rounded-xl border-2 transition-all duration-200
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
        ${
          selected
            ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900/20"
            : "border-gray-200 bg-white hover:border-gray-300"
        }
      `}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
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
        </div>
      )}

      {/* Icon */}
      {icon && (
        <div
          className={`mb-4 p-4 rounded-xl ${
            selected ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          {icon}
        </div>
      )}

      {/* Title */}
      <h3
        className={`text-lg font-semibold ${
          selected ? "text-slate-900" : "text-gray-900"
        }`}
      >
        {title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-sm text-gray-500 text-center max-w-xs">
        {description}
      </p>
    </button>
  );
}

