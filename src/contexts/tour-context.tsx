// TourProvider.tsx - Updated to fetch from Convex

import React, { useState, useCallback, useEffect } from "react";
import { tourStorage, createInitialState } from "../lib/tour-utils";
import { defaultTourSteps } from "../data/default-tour";
import { TourContext } from "./context";

// Convex client setup
const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;

interface TourProviderProps {
  children: React.ReactNode;
  config?: Partial<TourConfig>;
  tourId?: string; // Convex tour ID
}

export const TourProvider: React.FC<TourProviderProps> = ({
  children,
  config: userConfig,
  tourId: convexTourId,
}) => {
  interface TourData {
    name?: string;
    steps: TourStep[];
    // Add other fields as needed
  }

  const [loadedTourData, setLoadedTourData] = useState<TourData | null>(null);
  const [isLoadingTour, setIsLoadingTour] = useState(!!convexTourId);

  // Fetch tour data from Convex if tourId is provided
  useEffect(() => {
    console.log("Convex Tour ID:", convexTourId);
    if (!convexTourId) {
      setIsLoadingTour(false);
      return;
    }

    const fetchTour = async () => {
      try {
        const response = await fetch(`${CONVEX_URL}/api/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: "publicTours:getTourById",
            args: { tourId: convexTourId },
            format: "json",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch tour");
        }

        const data = await response.json();

        if (data.value) {
          setLoadedTourData(data.value);

          // Track tour view
          trackEvent("view", convexTourId);
        }
      } catch (error) {
        console.error("Error loading tour:", error);
      } finally {
        setIsLoadingTour(false);
      }
    };

    fetchTour();
  }, [convexTourId]);

  // Helper function to track events to Convex
  const trackEvent = async (
    eventType: "view" | "start" | "complete" | "skip" | "step_view",
    tourId: string,
    stepId?: string
  ) => {
    try {
      await fetch(`${CONVEX_URL}/api/mutation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: "publicTours:trackWidgetEvent",
          args: {
            tourId,
            eventType,
            stepId,
            sessionId: getOrCreateSessionId(),
            visitorId: getOrCreateVisitorId(),
          },
          format: "json",
        }),
      });

      console.log(`Tracked event: ${eventType} for tour: ${tourId}`);
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  };

  // Merge loaded tour data with user config
  const config: TourConfig = React.useMemo(() => {
    const steps =
      loadedTourData?.steps || userConfig?.steps || defaultTourSteps;

    return {
      tourId: convexTourId || userConfig?.tourId || "default-tour",
      name: loadedTourData?.name || userConfig?.name || "Getting Started",
      steps: steps.map((step: TourStep) => ({
        id: step.id,
        title: step.title,
        description: step.description,
        target: step.target,
        placement: step.placement || "bottom",
        image: step.image,
        action: step.action,
      })),
      showAvatar: userConfig?.showAvatar ?? true,
      avatarPosition: userConfig?.avatarPosition || "left",
      theme: userConfig?.theme || "dark",
      onComplete: userConfig?.onComplete,
      onSkip: userConfig?.onSkip,
      onStepChange: userConfig?.onStepChange,
    };
  }, [loadedTourData, userConfig, convexTourId]);

  const [state, setState] = useState<TourState>(() => {
    const savedState = tourStorage.getState(config.tourId);
    if (savedState && savedState.isActive) {
      return savedState;
    }
    return createInitialState();
  });

  const currentStep = config.steps[state.currentStepIndex] || null;
  const isFirstStep = state.currentStepIndex === 0;
  const isLastStep = state.currentStepIndex === config.steps.length - 1;
  const progress = ((state.currentStepIndex + 1) / config.steps.length) * 100;

  // Save state on changes
  useEffect(() => {
    tourStorage.saveState(config.tourId, state);
  }, [state, config.tourId]);

  // Track step views to Convex
  useEffect(() => {
    if (state.isActive && currentStep && convexTourId) {
      trackEvent("step_view", convexTourId, currentStep.id);
    }
  }, [state.currentStepIndex, state.isActive, currentStep, convexTourId]);

  const nextStep = useCallback(() => {
    if (!isLastStep) {
      setState((prev) => {
        const newCompletedSteps = [...prev.completedSteps];
        if (currentStep && !newCompletedSteps.includes(currentStep.id)) {
          newCompletedSteps.push(currentStep.id);
        }

        const newIndex = prev.currentStepIndex + 1;
        config.onStepChange?.(config.steps[newIndex].id, newIndex);

        return {
          ...prev,
          currentStepIndex: newIndex,
          completedSteps: newCompletedSteps,
        };
      });
    }
  }, [isLastStep, currentStep, config]);

  const prevStep = useCallback(() => {
    if (!isFirstStep) {
      setState((prev) => {
        const newIndex = prev.currentStepIndex - 1;
        config.onStepChange?.(config.steps[newIndex].id, newIndex);
        return {
          ...prev,
          currentStepIndex: newIndex,
        };
      });
    }
  }, [isFirstStep, config]);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < config.steps.length) {
        setState((prev) => ({
          ...prev,
          currentStepIndex: index,
        }));
        config.onStepChange?.(config.steps[index].id, index);
      }
    },
    [config]
  );

  const skipTour = useCallback(() => {
    if (convexTourId) {
      trackEvent("skip", convexTourId, currentStep?.id);
    }

    setState((prev) => ({
      ...prev,
      isActive: false,
    }));

    config.onSkip?.();
  }, [currentStep, convexTourId, config]);

  const completeTour = useCallback(() => {
    if (convexTourId) {
      trackEvent("complete", convexTourId, currentStep?.id);
    }

    tourStorage.markTourCompleted(config.tourId);

    setState((prev) => ({
      ...prev,
      isActive: false,
      completedSteps: [...prev.completedSteps, currentStep?.id || ""],
    }));

    config.onComplete?.();
  }, [currentStep, convexTourId, config]);

  const pauseTour = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPaused: true,
    }));
  }, []);

  const resumeTour = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isPaused: false,
    }));
  }, []);

  const restartTour = useCallback(() => {
    if (convexTourId) {
      trackEvent("start", convexTourId);
    }

    setState(createInitialState());
  }, [convexTourId]);

  // Show loading state
  if (isLoadingTour) {
    return <div>Loading tour...</div>;
  }

  // Show error if tour not found
  if (convexTourId && !loadedTourData) {
    return <div>Tour not found or inactive</div>;
  }

  return (
    <TourContext.Provider
      value={{
        config,
        state,
        currentStep,
        isFirstStep,
        isLastStep,
        progress,
        nextStep,
        prevStep,
        goToStep,
        skipTour,
        completeTour,
        pauseTour,
        resumeTour,
        restartTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

// Helper functions for session/visitor tracking
function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem("tour_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    sessionStorage.setItem("tour_session_id", sessionId);
  }
  return sessionId;
}

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem("tour_visitor_id");
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("tour_visitor_id", visitorId);
  }
  return visitorId;
}
