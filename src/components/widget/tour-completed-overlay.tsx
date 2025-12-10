import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, CheckCircle2, X } from "lucide-react";
import { useTour } from "../../widget-exports";

const TourCompletedOverlay: React.FC = () => {
  const { state, restartTour } = useTour();
  const [isVisible, setIsVisible] = React.useState(false);
  const hasCompletedRef = React.useRef(false);

  // Show overlay when tour becomes inactive AND all steps are completed
  React.useEffect(() => {
    const allStepsCompleted =
      state.completedSteps.length > 0 && !state.isActive;

    if (allStepsCompleted && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      setIsVisible(true);
    }

    // Reset when tour becomes active again
    if (state.isActive) {
      hasCompletedRef.current = false;
      setIsVisible(false);
    }
  }, [state.isActive, state.completedSteps.length]);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleRestart = () => {
    setIsVisible(false);
    hasCompletedRef.current = false;
    restartTour();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-widget-bg/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="widget-container rounded-2xl p-8 text-center max-w-md mx-4 relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-widget-text-muted hover:text-widget-text transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{
              background:
                "linear-gradient(135deg, hsl(174 72% 40%), hsl(160 70% 45%))",
              boxShadow: "0 0 30px hsl(174 80% 50% / 0.4)",
            }}
          >
            <CheckCircle2 className="w-8 h-8 text-white" />
          </motion.div>

          <motion.h2
            className="text-2xl font-display font-bold text-widget-text mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Tour Completed!
          </motion.h2>

          <motion.p
            className="text-widget-text-muted mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            You're all set to explore. Need a refresher? Start the tour again
            anytime.
          </motion.p>

          <motion.button
            onClick={handleRestart}
            className="btn-widget-primary inline-flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-4 h-4" />
            Restart Tour
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TourCompletedOverlay;
