import { ReactNode } from "react";

interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  animate?: boolean;
}

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  title,
  description,
  children,
  className = "",
  padding = "md",
  hover = false,
  animate = false,
}: CardProps) {
  const hoverClasses = hover
    ? "transition-all duration-200 hover:shadow-md hover:border-gray-300 cursor-pointer"
    : "";
  
  const animateClasses = animate ? "animate-fade-in" : "";

  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200 shadow-sm 
        ${paddingClasses[padding]} 
        ${hoverClasses}
        ${animateClasses}
        ${className}
      `.replace(/\s+/g, " ").trim()}
    >
      {(title || description) && (
        <div className={`${padding === "none" ? "px-6 pt-6" : ""} ${title || description ? "mb-4" : ""}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

