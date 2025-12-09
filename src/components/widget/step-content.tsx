import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTour } from "../../widget-exports";

const StepContent: React.FC = () => {
  const { currentStep } = useTour();

  if (!currentStep) return null;

  const contentVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.95 },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep.id}
        variants={contentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="text-center space-y-3"
      >
        {/* Step Title */}
        <motion.h3
          className="text-xl font-display font-semibold text-widget-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {currentStep.title}
        </motion.h3>

        {/* Step Description */}
        <motion.p
          className="text-sm text-widget-text-muted leading-relaxed max-w-sm mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {currentStep.description}
        </motion.p>

        {/* Optional Action Button */}
        {currentStep.action && (
          <motion.button
            className="mt-4 text-sm text-widget-accent hover:text-widget-accent-glow transition-colors underline underline-offset-4"
            onClick={currentStep.action.onClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {currentStep.action.label}
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default StepContent;
