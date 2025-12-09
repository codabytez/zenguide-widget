const STORAGE_KEY_PREFIX = "onboarding_tour_";

export const tourStorage = {
  getState: (tourId: string): TourState | null => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tourId}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  saveState: (tourId: string, state: TourState): void => {
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${tourId}`,
        JSON.stringify(state)
      );
    } catch (e) {
      console.warn("Failed to save tour state:", e);
    }
  },

  clearState: (tourId: string): void => {
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${tourId}`);
    } catch (e) {
      console.warn("Failed to clear tour state:", e);
    }
  },

  getCompletedTours: (): string[] => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}completed`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  markTourCompleted: (tourId: string): void => {
    try {
      const completed = tourStorage.getCompletedTours();
      if (!completed.includes(tourId)) {
        completed.push(tourId);
        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}completed`,
          JSON.stringify(completed)
        );
      }
    } catch (e) {
      console.warn("Failed to mark tour completed:", e);
    }
  },
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createInitialState = (): TourState => ({
  currentStepIndex: 0,
  completedSteps: [],
  isActive: true,
  isPaused: false,
  startedAt: Date.now(),
});

export const analyticsTracker = {
  events: [] as AnalyticsEvent[],
  sessionId: generateSessionId(),

  track: (event: Omit<AnalyticsEvent, "timestamp">): void => {
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
    };
    analyticsTracker.events.push(fullEvent);

    // Log for demo purposes - in production, send to analytics service
    console.log("[Tour Analytics]", fullEvent);
  },

  getEvents: (): AnalyticsEvent[] => {
    return [...analyticsTracker.events];
  },

  reset: (): void => {
    analyticsTracker.events = [];
    analyticsTracker.sessionId = generateSessionId();
  },
};
