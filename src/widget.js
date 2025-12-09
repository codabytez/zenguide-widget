// widget.js - Entry point for customers to embed

(function () {
  "use strict";

  // Create TourGuide namespace
  window.TourGuide = window.TourGuide || {};

  /**
   * Initialize the tour widget
   * @param {Object} options
   * @param {string} options.tourId - The Convex tour ID
   * @param {boolean} options.autoStart - Whether to start tour automatically
   * @param {string} options.theme - 'light' or 'dark'
   */
  window.TourGuide.init = function (options) {
    if (!options || !options.tourId) {
      console.error("TourGuide: tourId is required");
      return;
    }

    // Store configuration
    window.TourGuide.config = {
      tourId: options.tourId,
      autoStart: options.autoStart !== false, // Default true
      theme: options.theme || "dark",
      convexUrl: options.convexUrl || import.meta.env.VITE_CONVEX_URL,
    };

    // Load the widget React app
    loadWidget();
  };

  /**
   * Manually start the tour
   */
  window.TourGuide.start = function () {
    if (window.TourGuide._app && window.TourGuide._app.start) {
      window.TourGuide._app.start();
    }
  };

  /**
   * Manually stop the tour
   */
  window.TourGuide.stop = function () {
    if (window.TourGuide._app && window.TourGuide._app.stop) {
      window.TourGuide._app.stop();
    }
  };

  /**
   * Load the widget bundle
   */
  function loadWidget() {
    // Check if already loaded
    if (document.getElementById("tourguide-widget-root")) {
      return;
    }

    // Create container
    const container = document.createElement("div");
    container.id = "tourguide-widget-root";
    document.body.appendChild(container);

    // Load React bundle (you'll need to build and host this)
    const script = document.createElement("script");
    script.src = "https://cdn.tourguide.app/widget-bundle.js"; // Your CDN URL
    script.async = true;
    script.onload = function () {
      console.log("TourGuide widget loaded successfully");

      // The bundle should expose a mount function
      if (window.TourGuideWidget && window.TourGuideWidget.mount) {
        window.TourGuide._app = window.TourGuideWidget.mount(
          container,
          window.TourGuide.config
        );
      }
    };
    script.onerror = function () {
      console.error("TourGuide: Failed to load widget bundle");
    };

    document.head.appendChild(script);
  }

  // Auto-initialize if data-tour-id attribute is present
  const scriptTag = document.currentScript;
  if (scriptTag) {
    const tourId = scriptTag.getAttribute("data-tour-id");
    const autoStart = scriptTag.getAttribute("data-auto-start") !== "false";

    if (tourId) {
      window.TourGuide.init({
        tourId: tourId,
        autoStart: autoStart,
      });
    }
  }
})();
