"use client";

import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      isLoading,
      fullWidth = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const isLoadingState = loading || isLoading;
    
    const baseStyles = `
      inline-flex items-center justify-center font-medium 
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-[0.98] transform
    `.replace(/\s+/g, " ").trim();

    const variants = {
      primary:
        "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md focus:ring-slate-500 active:bg-slate-950",
      secondary:
        "bg-slate-100 text-slate-900 hover:bg-slate-200 hover:shadow-sm focus:ring-slate-400 active:bg-slate-300",
      outline:
        "border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-400 active:bg-slate-100",
      ghost:
        "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400 active:bg-slate-200",
      danger:
        "bg-red-600 text-white hover:bg-red-700 hover:shadow-md focus:ring-red-500 active:bg-red-800",
      success:
        "bg-green-600 text-white hover:bg-green-700 hover:shadow-md focus:ring-green-500 active:bg-green-800",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-md gap-1.5",
      md: "px-4 py-2 text-sm rounded-lg gap-2",
      lg: "px-6 py-3 text-base rounded-lg gap-2",
      icon: "p-2 rounded-lg",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
        disabled={disabled || isLoadingState}
        {...props}
      >
        {isLoadingState && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

