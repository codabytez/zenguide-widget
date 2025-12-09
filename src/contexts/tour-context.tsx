import React, { useState, useCallback, useEffect } from "react";
import {
  tourStorage,
  createInitialState,
  analyticsTracker,
} from "../lib/tour-utils";
import { defaultTourSteps } from "../data/default-tour";
import { TourContext } from "./context";

interface TourProviderProps {
  children: React.ReactNode;
  config?: Partial<TourConfig>;
}

export const TourProvider: React.FC<TourProviderProps> = ({
  children,
  config: userConfig,
}) => {
  const config: TourConfig = React.useMemo(
    () => ({
      tourId: userConfig?.tourId || "default-tour",
      name: userConfig?.name || "Getting Started",
      steps: userConfig?.steps || defaultTourSteps,
      showAvatar: userConfig?.showAvatar ?? true,
      avatarPosition: userConfig?.avatarPosition || "left",
      theme: userConfig?.theme || "dark",
      onComplete: userConfig?.onComplete,
      onSkip: userConfig?.onSkip,
      onStepChange: userConfig?.onStepChange,
    }),
    [
      userConfig?.tourId,
      userConfig?.name,
      userConfig?.steps,
      userConfig?.showAvatar,
      userConfig?.avatarPosition,
      userConfig?.theme,
      userConfig?.onComplete,
      userConfig?.onSkip,
      userConfig?.onStepChange,
    ]
  );

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

  // Track step views
  useEffect(() => {
    if (state.isActive && currentStep) {
      analyticsTracker.track({
        type: "step_viewed",
        stepId: currentStep.id,
        stepIndex: state.currentStepIndex,
      });
    }
  }, [state.currentStepIndex, state.isActive, currentStep]);

  const nextStep = useCallback(() => {
    if (!isLastStep) {
      setState((prev) => {
        const newCompletedSteps = [...prev.completedSteps];
        if (currentStep && !newCompletedSteps.includes(currentStep.id)) {
          newCompletedSteps.push(currentStep.id);
        }

        analyticsTracker.track({
          type: "step_completed",
          stepId: currentStep?.id,
          stepIndex: prev.currentStepIndex,
        });

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
    analyticsTracker.track({
      type: "tour_skipped",
      stepId: currentStep?.id,
      stepIndex: state.currentStepIndex,
    });

    setState((prev) => ({
      ...prev,
      isActive: false,
    }));

    config.onSkip?.();
  }, [currentStep, state.currentStepIndex, config]);

  const completeTour = useCallback(() => {
    analyticsTracker.track({
      type: "tour_completed",
      stepId: currentStep?.id,
      stepIndex: state.currentStepIndex,
    });

    tourStorage.markTourCompleted(config.tourId);

    setState((prev) => ({
      ...prev,
      isActive: false,
      completedSteps: [...prev.completedSteps, currentStep?.id || ""],
    }));

    config.onComplete?.();
  }, [currentStep, state.currentStepIndex, config]);

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
    analyticsTracker.reset();
    analyticsTracker.track({ type: "tour_started" });

    setState(createInitialState());
  }, []);

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
