import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { PeriodProvider } from "./hooks/usePeriod.jsx";
import { PlatformsProvider } from "./hooks/usePlatforms.jsx";
import { TooltipProvider } from "./components/Tooltip.jsx";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <PeriodProvider>
        <PlatformsProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </PlatformsProvider>
      </PeriodProvider>
    </BrowserRouter>
  </StrictMode>
);
