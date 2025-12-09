/* eslint-disable react-refresh/only-export-components */
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  TourProvider,
  TourWidget,
  TourCompletedOverlay,
  analyticsTracker,
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
  convexUrl?: string;
}

interface WidgetAPI {
  start: () => void;
  stop: () => void;
  destroy: () => void;
}

// Widget App Component
const WidgetApp: React.FC<{ config: WidgetConfig; onStart: () => void }> = ({
  config,
  onStart,
}) => {
  React.useEffect(() => {
    if (config.autoStart) {
      onStart();
    }
  }, [config.autoStart, onStart]);

  return (
    <TourProvider tourId={config.tourId}>
      <TourWidget position={config.position || "bottom-right"} />
      <TourCompletedOverlay />
    </TourProvider>
  );
};

// Mount function
function mount(container: HTMLElement, config: WidgetConfig): WidgetAPI {
  let root: ReactDOM.Root | null = null;
  let tourKey = 0;

  const start = () => {
    analyticsTracker.reset();
    analyticsTracker.track({ type: "tour_started" });
    tourKey++;
    render();
  };

  const stop = () => {
    analyticsTracker.track({ type: "tour_stopped" });
    if (root) {
      root.unmount();
      root = null;
    }
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
        <WidgetApp key={tourKey} config={config} onStart={start} />
      </React.StrictMode>
    );
  };

  // Initial render if autoStart is true
  if (config.autoStart) {
    render();
  }

  return { start, stop, destroy };
}

// Expose to window
window.TourGuideWidget = { mount };

// Auto-initialize if script has data attributes
const currentScript = document.currentScript as HTMLScriptElement;
if (currentScript) {
  const tourId = currentScript.getAttribute("data-tour-id");
  const autoStart = currentScript.getAttribute("data-auto-start") !== "false";
  const position = currentScript.getAttribute("data-position") as
    | "bottom-right"
    | "bottom-left"
    | "center"
    | null;

  if (tourId) {
    // Create container
    const container = document.createElement("div");
    container.id = "tourguide-widget-root";
    document.body.appendChild(container);

    // Mount widget
    const widget = mount(container, {
      tourId,
      autoStart,
      position: position || "bottom-right",
    });

    // Store reference for manual control
    window.TourGuide = window.TourGuide || {};
    window.TourGuide._app = widget;
    window.TourGuide.config = {
      tourId,
      autoStart,
      position: position || "bottom-right",
    };

    // Expose control methods
    window.TourGuide.start = () => widget.start();
    window.TourGuide.stop = () => widget.stop();
  }
}
