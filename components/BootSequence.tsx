"use client";

import { useEffect, useState } from "react";

interface Step {
  label: string;
  status: "pending" | "active" | "completed";
}

interface Props {
  steps?: string[];
  currentStep?: number; // 0-indexed, -1 = all pending
  title?: string;
}

const DEFAULT_STEPS = [
  "Mounting Volume",
  "Verifying Models",
  "Starting ComfyUI",
  "Health Check",
];

export default function BootSequence({
  steps = DEFAULT_STEPS,
  currentStep = -1,
  title = "Booting Runtime...",
}: Props) {
  const [stepStates, setStepStates] = useState<Step[]>(
    steps.map((label) => ({ label, status: "pending" }))
  );

  useEffect(() => {
    setStepStates(
      steps.map((label, i) => ({
        label,
        status:
          i < currentStep ? "completed"
          : i === currentStep ? "active"
          : "pending",
      }))
    );
  }, [steps, currentStep]);

  const displayTitle = currentStep >= steps.length ? "Ready." : title;

  return (
    <div className="flex flex-col items-center max-w-md w-full px-6">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center">
          <svg
            className="w-6 h-6 text-neutral-900 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-medium tracking-tight text-neutral-900">
          {displayTitle}
        </h2>
      </div>

      <div className="w-full flex flex-col gap-6 font-geist-mono text-xs max-w-[280px]">
        {stepStates.map((step, i) => (
          <div
            key={i}
            className={`step-item flex items-center gap-4 ${
              step.status === "active" ? "active" : step.status === "completed" ? "completed" : ""
            }`}
          >
            <div className="w-2 h-2 rounded-full border border-neutral-300 step-dot transition-colors duration-300 relative flex-shrink-0">
              {step.status === "active" && (
                <span className="absolute inset-0 rounded-full animate-ping bg-neutral-400 opacity-40" />
              )}
            </div>
            <span className="text-neutral-600 tracking-wide step-label">{step.label}</span>
            {step.status === "completed" && (
              <svg className="w-3 h-3 text-emerald-500 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
