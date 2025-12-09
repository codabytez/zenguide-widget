import React from "react";
import { motion } from "framer-motion";
import { useTour } from "../../widget-exports";

interface ProgressIndicatorProps {
  variant?: "dots" | "bar" | "both";
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  variant = "both",
}) => {
  const { config, state, progress, goToStep } = useTour();

  return (
    <div className="flex flex-col gap-3">
      {/* Progress Bar */}
      {(variant === "bar" || variant === "both") && (
        <div className="w-full h-1 bg-widget-border rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, hsl(174 72% 40%), hsl(180 70% 50%))",
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Step Dots */}
      {(variant === "dots" || variant === "both") && (
        <div className="flex items-center justify-center gap-2">
          {config.steps.map((step, index) => {
            const isCompleted = state.completedSteps.includes(step.id);
            const isCurrent = index === state.currentStepIndex;
            const isClickable = index <= state.currentStepIndex || isCompleted;

            return (
              <motion.button
                key={step.id}
                onClick={() => isClickable && goToStep(index)}
                className={`
                  progress-dot relative
                  ${isCurrent ? "progress-dot-active" : ""}
                  ${isCompleted && !isCurrent ? "progress-dot-completed" : ""}
                  ${!isCurrent && !isCompleted ? "progress-dot-inactive" : ""}
                  ${isClickable ? "cursor-pointer" : "cursor-default"}
                `}
                whileHover={isClickable ? { scale: 1.3 } : {}}
                whileTap={isClickable ? { scale: 0.9 } : {}}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                aria-label={`Go to step ${index + 1}: ${step.title}`}
              >
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "hsl(174 80% 50% / 0.3)",
                    }}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.8, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Step Counter */}
      <div className="text-center text-xs text-widget-text-muted">
        Step {state.currentStepIndex + 1} of {config.steps.length}
      </div>
    </div>
  );
};

export default ProgressIndicator;
