"use client";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Mobile: Simple step counter */}
      <div className="sm:hidden flex items-center justify-center mb-6">
        <span className="text-sm font-medium text-gray-500">
          Step {currentStep} of {steps.length}
        </span>
        <span className="mx-2 text-gray-300">•</span>
        <span className="text-sm font-semibold text-slate-900">
          {steps[currentStep - 1]}
        </span>
      </div>

      {/* Desktop: Full step indicator */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isUpcoming = stepNumber > currentStep;

            return (
              <div key={step} className="flex items-center flex-1">
                {/* Step circle and label */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                      transition-all duration-200
                      ${
                        isCompleted
                          ? "bg-slate-900 text-white"
                          : isCurrent
                          ? "bg-slate-900 text-white ring-4 ring-slate-200"
                          : "bg-gray-100 text-gray-400"
                      }
                    `}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-5 h-5"
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
                    ) : (
                      stepNumber
                    )}
                  </div>
                  <span
                    className={`
                      mt-2 text-xs font-medium text-center max-w-[100px]
                      ${isUpcoming ? "text-gray-400" : "text-gray-700"}
                    `}
                  >
                    {step}
                  </span>
                </div>

                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 h-0.5 mt-[-24px]">
                    <div
                      className={`
                        h-full transition-all duration-300
                        ${isCompleted ? "bg-slate-900" : "bg-gray-200"}
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

