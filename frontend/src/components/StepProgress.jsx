import React from 'react';

const steps = [
  { label: 'Upload Photo' },
  { label: 'Choose Style' },
  { label: 'Your Result'  },
];

const StepProgress = ({ currentStep }) => {
  return (
    <div className="w-full flex items-center justify-center px-4 py-6">
      <div className="flex items-center w-full max-w-sm sm:max-w-md">
        {steps.map((step, idx) => {
          const stepNum   = idx + 1;
          const isActive  = stepNum === currentStep;
          const isDone    = stepNum < currentStep;
          const isUpcoming = stepNum > currentStep;

          return (
            <React.Fragment key={stepNum}>
              {/* Step node */}
              <div className="flex flex-col items-center gap-2 relative">
                {/* Pulse ring — only on active */}
                {isActive && (
                  <span className="absolute inset-0 flex items-center justify-center top-[-4px]">
                    <span className="block rounded-full animate-ping w-10 h-10 bg-purple-600 dark:bg-purple-500 opacity-25" />
                  </span>
                )}

                {/* Circle */}
                {isDone ? (
                  <div className="
                    bg-purple-600 dark:bg-purple-500
                    text-white rounded-full w-8 h-8
                    flex items-center justify-center font-bold text-sm
                    relative z-10 shrink-0 transition-colors
                  ">✓</div>
                ) : isActive ? (
                  <div className="
                    bg-purple-600 dark:bg-purple-500
                    text-white rounded-full w-8 h-8
                    ring-4 ring-purple-200 dark:ring-purple-900/50
                    flex items-center justify-center font-bold text-sm
                    relative z-10 shrink-0 transition-colors
                  ">{stepNum}</div>
                ) : (
                  <div className="
                    bg-white dark:bg-gray-800
                    border-2 border-gray-300 dark:border-gray-600
                    text-gray-400 dark:text-gray-500
                    rounded-full w-8 h-8
                    flex items-center justify-center font-bold text-sm
                    relative z-10 shrink-0 transition-colors
                  ">{stepNum}</div>
                )}

                {/* Label */}
                <span className={`
                  text-xs whitespace-nowrap transition-colors
                  ${isActive || isDone ? 'font-bold' : 'font-normal'}
                  ${isUpcoming ? 'text-gray-400 dark:text-gray-500' : 'text-purple-600 dark:text-purple-400'}
                `}>
                  {step.label}
                </span>
              </div>

              {/* Connector line between steps */}
              {idx < steps.length - 1 && (
                <div className={`
                  h-0.5 flex-1 mb-5 transition-colors
                  ${isDone ? 'bg-purple-600 dark:bg-purple-500' : 'bg-gray-200 dark:bg-gray-700'}
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress;
