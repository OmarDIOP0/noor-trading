import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { applyTheme, useUiStore } from "@/stores/ui.store";

// Applique le thème persisté dès le premier rendu (évite le flash)
applyTheme(useUiStore.getState().theme);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
