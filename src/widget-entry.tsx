/* eslint-disable react-refresh/only-export-components */
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  TourProvider,
  TourWidget,
  TourCompletedOverlay,
  analyticsTracker,
  TourRestartButton,
} from "./widget-exports";

// Expose the widget to the window object
declare global {
  interface Window {
    TourGuideWidget: {
      mount: (container: HTMLElement, config: WidgetConfig) => WidgetAPI;
    };
    TourGuide: {
      config?: WidgetConfig;
      _app?: WidgetAPI;
      init: (options: WidgetConfig) => void;
      start: () => void;
      stop: () => void;
    };
  }
}

interface WidgetConfig {
  tourId: string;
  autoStart?: boolean;
  theme?: "light" | "dark";
  position?: "bottom-right" | "bottom-left" | "center";
  showAvatar?: boolean;
  avatarPosition?: "left" | "right";
  convexUrl?: string;
}

interface WidgetAPI {
  start: () => void;
  stop: () => void;
  destroy: () => void;
}

// Widget App Component - FIXED VERSION
const WidgetApp: React.FC<{ config: WidgetConfig }> = ({ config }) => {
  return (
    <TourProvider
      tourId={config.tourId}
      config={{
        theme: config.theme || "dark",
        showAvatar: config.showAvatar,
        avatarPosition: config.avatarPosition,
      }}
    >
      <TourWidget position={config.position || "bottom-right"} />
      <TourCompletedOverlay />
      <TourRestartButton />
    </TourProvider>
  );
};

// Mount function - FIXED VERSION
function mount(container: HTMLElement, config: WidgetConfig): WidgetAPI {
  let root: ReactDOM.Root | null = null;
  let hasStarted = false;

  const start = () => {
    if (hasStarted) return; // Prevent multiple starts
    hasStarted = true;

    analyticsTracker.reset();
    analyticsTracker.track({ type: "tour_started" });
    render();
  };

  const stop = () => {
    analyticsTracker.track({ type: "tour_stopped" });
    if (root) {
      root.unmount();
      root = null;
    }
    hasStarted = false;
  };

  const destroy = () => {
    stop();
    container.remove();
  };

  const render = () => {
    if (!root) {
      root = ReactDOM.createRoot(container);
    }
    root.render(
      <React.StrictMode>
        <WidgetApp config={config} />
      </React.StrictMode>
    );
  };

  // Initial render if autoStart is true
  if (config.autoStart) {
    start();
  }

  return { start, stop, destroy };
}

// Expose to window
window.TourGuideWidget = { mount };

// Auto-initialize - FIXED VERSION
const currentScript = document.currentScript as HTMLScriptElement;
if (currentScript) {
  const tourId = currentScript.getAttribute("data-tour-id");
  const autoStart = currentScript.getAttribute("data-auto-start") !== "false";
  const position = currentScript.getAttribute("data-position") as
    | "bottom-right"
    | "bottom-left"
    | "center"
    | null;
  const theme = currentScript.getAttribute("data-theme") as
    | "light"
    | "dark"
    | null;
  const showAvatar = currentScript.getAttribute("data-show-avatar") !== "false";
  const avatarPosition = currentScript.getAttribute("data-avatar-position") as
    | "left"
    | "right"
    | null;

  if (tourId) {
    // Create container only once
    let container = document.getElementById("tourguide-widget-root");
    if (!container) {
      container = document.createElement("div");
      container.id = "tourguide-widget-root";
      document.body.appendChild(container);
    }

    // Mount widget once
    const widget = mount(container, {
      tourId,
      autoStart,
      position: position || "bottom-right",
      theme: theme || "dark",
      showAvatar,
      avatarPosition: avatarPosition || "left",
    });

    // Store reference
    window.TourGuide = window.TourGuide || {};
    window.TourGuide._app = widget;
    window.TourGuide.config = {
      tourId,
      autoStart,
      position: position || "bottom-right",
      theme: theme || "dark",
      showAvatar,
      avatarPosition: avatarPosition || "left",
    };

    window.TourGuide.start = () => widget.start();
    window.TourGuide.stop = () => widget.stop();
  }
}
