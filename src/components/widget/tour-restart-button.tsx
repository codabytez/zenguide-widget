import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useTour } from "../../widget-exports";

const TourRestartButton: React.FC = () => {
  const { state, restartTour } = useTour();

  // Only show when tour is not active
  if (state.isActive) return null;

  return (
    <motion.button
      onClick={restartTour}
      className="fixed bottom-2 right-2 z-50 w-10 h-10 rounded-full bg-linear-to-br from-widget-primary to-widget-accent text-white shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      title="Restart Tour"
      style={{
        boxShadow: "0 4px 20px hsl(174 80% 50% / 0.3)",
      }}
    >
      <Play className="w-6 h-6 transition-transform group-hover:scale-110" />

      {/* Pulse animation ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-widget-primary"
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    </motion.button>
  );
};

export default TourRestartButton;
