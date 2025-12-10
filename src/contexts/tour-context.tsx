// TourProvider.tsx - Fixed with better event tracking

import React, { useState, useCallback, useEffect } from "react";
import { tourStorage, createInitialState } from "../lib/tour-utils";
import { defaultTourSteps } from "../data/default-tour";
import { TourContext } from "./context";

// Convex client setup
const CONVEX_URL = "https://little-pelican-550.convex.cloud";

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
  const lastTrackedStepRef = React.useRef<string | null>(null);
  const hasTrackedViewRef = React.useRef(false);
  const hasTrackedStartRef = React.useRef(false);

  interface TourData {
    name?: string;
    steps: TourStep[];
  }

  const [loadedTourData, setLoadedTourData] = useState<TourData | null>(null);
  const [isLoadingTour, setIsLoadingTour] = useState(!!convexTourId);

  // Helper function to track events to Convex
  const trackEvent = async (
    eventType: "view" | "start" | "complete" | "skip" | "step_view",
    tourId: string,
    stepId?: string
  ) => {
    console.log(`[TRACKING] Event: ${eventType}, Tour: ${tourId}, Step: ${stepId || 'N/A'}`);

    try {
      const response = await fetch(`${CONVEX_URL}/api/mutation`, {
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

      if (!response.ok) {
        console.error(`[TRACKING ERROR] HTTP ${response.status}:`, await response.text());
        return;
      }

      const result = await response.json();
      console.log(`[TRACKING SUCCESS] ${eventType}:`, result);
    } catch (error) {
      console.error("[TRACKING ERROR]", error);
    }
  };

  // Fetch tour data from Convex if tourId is provided
  useEffect(() => {
    console.log("[FETCH] Effect running. Convex Tour ID:", convexTourId);
    if (!convexTourId) {
      setIsLoadingTour(false);
      return;
    }

    const fetchTour = async () => {
      console.log("[FETCH] Fetching tour from Convex...");
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
          throw new Error(`Failed to fetch tour: ${response.status}`);
        }

        const data = await response.json();
        console.log("[FETCH] Tour data received:", data);

        if (data.value) {
          setLoadedTourData(data.value);

          // Track tour view - only once per session
          if (!hasTrackedViewRef.current) {
            hasTrackedViewRef.current = true;
            await trackEvent("view", convexTourId);
          }
        } else {
          console.error("[FETCH] No tour data in response");
        }
      } catch (error) {
        console.error("[FETCH ERROR] Error loading tour:", error);
      } finally {
        setIsLoadingTour(false);
      }
    };

    fetchTour();
  }, [convexTourId]);

  // Merge loaded tour data with user config
  const config: TourConfig = React.useMemo(() => {
    const steps = loadedTourData?.steps || userConfig?.steps || defaultTourSteps;

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
  const stateRef = React.useRef(state);
  useEffect(() => {
    const stateChanged = JSON.stringify(stateRef.current) !== JSON.stringify(state);
    if (stateChanged) {
      stateRef.current = state;
      tourStorage.saveState(config.tourId, state);

      // Track "start" event when tour becomes active for the first time
      if (state.isActive && !hasTrackedStartRef.current && convexTourId) {
        hasTrackedStartRef.current = true;
        trackEvent("start", convexTourId, currentStep?.id);
        console.log("[STATE] Tour started, tracked 'start' event");
      }
    }
  }, [state, config.tourId, convexTourId, currentStep?.id]);

  // Track step views to Convex
  useEffect(() => {
    if (state.isActive && currentStep && convexTourId) {
      // Only track if it's a different step
      if (lastTrackedStepRef.current !== currentStep.id) {
        console.log("[STEP] Tracking step view:", currentStep.id);
        lastTrackedStepRef.current = currentStep.id;
        trackEvent("step_view", convexTourId, currentStep.id);
      }
    }
  }, [state.currentStepIndex, state.isActive, currentStep, convexTourId]);

  const nextStep = useCallback(() => {
    trackEvent("step_view", convexTourId || "", currentStep?.id);
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
    } else {
      // If last step, complete the tour
      console.log("[ACTION] Next step called on last step, completing tour");
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
      return;
    }
  }, [isLastStep, currentStep, config, convexTourId]);

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
    console.log("[ACTION] Skip tour");
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
    console.log("[ACTION] Complete tour");
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
    console.log("[ACTION] Restart tour");
    if (convexTourId) {
      // Reset tracking refs
      hasTrackedStartRef.current = false;
      lastTrackedStepRef.current = null;
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
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("tour_session_id", sessionId);
    console.log("[SESSION] Created new session ID:", sessionId);
  }
  return sessionId;
}

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem("tour_visitor_id");
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("tour_visitor_id", visitorId);
    console.log("[VISITOR] Created new visitor ID:", visitorId);
  }
  return visitorId;
}