interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for element to highlight
  placement?: "top" | "bottom" | "left" | "right" | "center";
  image?: string;
  action?: {
    label: string;
    onClick?: () => void;
  };
}

interface TourConfig {
  tourId: string;
  name: string;
  steps: TourStep[];
  showAvatar?: boolean;
  avatarPosition?: "left" | "right";
  theme?: "dark" | "light";
  onComplete?: () => void;
  onSkip?: () => void;
  onStepChange?: (stepId: string, stepIndex: number) => void;
}

interface TourAnalytics {
  tourId: string;
  sessionId: string;
  events: AnalyticsEvent[];
}

interface AnalyticsEvent {
  type:
    | "tour_started"
    | "step_viewed"
    | "step_completed"
    | "step_skipped"
    | "tour_completed"
    | "tour_skipped"
    | "tour_stopped";
  stepId?: string;
  stepIndex?: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface TourState {
  currentStepIndex: number;
  completedSteps: string[];
  isActive: boolean;
  isPaused: boolean;
  startedAt: number | null;
}
