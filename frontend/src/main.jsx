import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";


/* =========================================================
   REDIRECT TO HOME WHEN BROWSER IS REFRESHED
========================================================= */

const navigationEntry =
  performance.getEntriesByType("navigation")[0];

const isReload =
  navigationEntry &&
  navigationEntry.type === "reload";

if (
  isReload &&
  window.location.pathname !== "/"
) {
  window.history.replaceState(
    {},
    "",
    "/"
  );
}


/* =========================================================
   RENDER APPLICATION
========================================================= */

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);