import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import {
  analyticsTracker,
  TourCompletedOverlay,
  TourProvider,
  TourWidget,
} from "./widget-exports";

function App() {
  const [count, setCount] = useState(0);
  const [tourKey, setTourKey] = useState(0);
  // const [showAnalytics, setShowAnalytics] = useState(false);
  // const [analyticsEvents, setAnalyticsEvents] = useState(
  //   analyticsTracker.getEvents()
  // );

  const handleStartTour = () => {
    analyticsTracker.reset();
    analyticsTracker.track({ type: "tour_started" });
    setTourKey((prev) => prev + 1);
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setAnalyticsEvents([...analyticsTracker.getEvents()]);
  //   }, 500);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <TourProvider key={tourKey}>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      <button onClick={handleStartTour}>Start Tour</button>

      <TourWidget position="bottom-right" />
      <TourCompletedOverlay />
    </TourProvider>
  );
}

export default App;
