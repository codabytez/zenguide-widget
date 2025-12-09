import { createContext } from "react";

interface TourContextType {
  config: TourConfig;
  state: TourState;
  currentStep: TourStep | null;
  isFirstStep: boolean;
  isLastStep: boolean;
  progress: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  skipTour: () => void;
  completeTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  restartTour: () => void;
}

export const TourContext = createContext<TourContextType | null>(null);
