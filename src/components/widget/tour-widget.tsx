import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import TourAvatar from "./tour-avatar";
import StepContent from "./step-content";
import ProgressIndicator from "./progress-indicator";
import NavigationControls from "./navigation-control";
import { useTour } from "../../hooks/use-tour";

interface TourWidgetProps {
  position?: "bottom-right" | "bottom-left" | "center";
}

const TourWidget: React.FC<TourWidgetProps> = ({
  position = "bottom-right",
}) => {
  const { state, config } = useTour();

  if (!state.isActive || state.isPaused) {
    return null;
  }

  const positionClasses = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
    center: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  const widgetVariants = {
    initial: {
      opacity: 0,
      scale: 0.9,
      y: 20,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`${positionClasses[position]} z-50`}
        variants={widgetVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Main Widget Container */}
        <div className="widget-container widget-glow rounded-2xl p-6 w-[380px] max-w-[calc(100vw-3rem)]">
          {/* Avatar Section */}
          {config.showAvatar && (
            <motion.div
              className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <TourAvatar isActive={state.isActive} size={100} />
            </motion.div>
          )}

          {/* Content Section */}
          <div className="space-y-5">
            <StepContent />

            {/* Progress Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <ProgressIndicator variant="both" />
            </motion.div>

            {/* Navigation Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <NavigationControls />
            </motion.div>
          </div>
        </div>

        {/* Decorative glow effect */}
        <div
          className="absolute -inset-4 rounded-3xl pointer-events-none opacity-50"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, hsl(174 80% 50% / 0.1), transparent 60%)",
            filter: "blur(20px)",
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default TourWidget;
