import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <div className="h-screen w-full bg-slate-900 text-slate-300">
      <App />
    </div>
  </StrictMode>,
);
