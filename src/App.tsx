import { useState } from "react";
import "./App.css";
import {
  analyticsTracker,
  TourCompletedOverlay,
  TourProvider,
  TourRestartButton,
  TourWidget,
} from "./widget-exports";

function App() {
  const [tourKey, setTourKey] = useState(0);

  const handleStartTour = () => {
    analyticsTracker.reset();
    analyticsTracker.track({ type: "tour_started" });
    setTourKey((prev) => prev + 1);
  };

  return (
    <TourProvider key={tourKey} tourId="kh7dw5smxjrbw7epxskr37xzd97wy72e">
      <button onClick={handleStartTour}>Start Tour</button>

      <TourWidget position="bottom-right" />
      <TourCompletedOverlay />
      <TourRestartButton />
    </TourProvider>
  );
}

export default App;
