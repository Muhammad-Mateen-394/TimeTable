import { Check } from "lucide-react";

export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center flex-wrap gap-1 mb-6">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isDone = stepNum < current;
        const isActive = stepNum === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0
                  ${isDone ? "bg-forest text-white" : isActive ? "bg-forest text-white" : "bg-black/[0.06] text-ink-900/40"}`}
              >
                {isDone ? <Check size={13} /> : stepNum}
              </div>
              <span className={`text-sm whitespace-nowrap ${isActive ? "text-ink-900 font-medium" : isDone ? "text-ink-900/60" : "text-ink-900/35"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <div className="w-6 md:w-10 h-px bg-black/10 mx-2" />}
          </div>
        );
      })}
    </div>
  );
}
