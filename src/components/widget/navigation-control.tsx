import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, RotateCcw } from "lucide-react";
import { useTour } from "../../widget-exports";

const NavigationControls: React.FC = () => {
  const {
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
  } = useTour();

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Left side - Back button */}
      <AnimatePresence mode="wait">
        {!isFirstStep ? (
          <motion.button
            key="back"
            onClick={prevStep}
            className="btn-widget-secondary flex items-center gap-1.5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </motion.button>
        ) : (
          <motion.button
            key="skip"
            onClick={skipTour}
            className="btn-widget-ghost flex items-center gap-1.5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <X className="w-4 h-4" />
            <span>Skip Tour</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Right side - Next/Complete button */}
      <AnimatePresence mode="wait">
        {!isLastStep ? (
          <motion.button
            key="next"
            onClick={nextStep}
            className="btn-widget-primary flex items-center gap-1.5"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.button
            key="complete"
            onClick={completeTour}
            className="btn-widget-primary flex items-center gap-1.5"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Get Started</span>
            <RotateCcw className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavigationControls;
