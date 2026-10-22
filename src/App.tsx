import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, HashRouter } from "react-router-dom";
import { useAppStore } from "./application/store";
import { Header } from "./ui/components/Header";
import { LiveAnnouncer } from "./ui/components/LiveAnnouncer";
const CaptureRoute = lazy(() => import("./ui/routes/CaptureRoute").then((module) => ({ default: module.CaptureRoute })));
const RailRoute = lazy(() => import("./ui/routes/RailRoute").then((module) => ({ default: module.RailRoute })));
const ReviewRoute = lazy(() => import("./ui/routes/ReviewRoute").then((module) => ({ default: module.ReviewRoute })));
const EvidenceRoute = lazy(() => import("./ui/routes/EvidenceRoute").then((module) => ({ default: module.EvidenceRoute })));
const SettingsRoute = lazy(() => import("./ui/routes/SettingsRoute").then((module) => ({ default: module.SettingsRoute })));

export const AppContent: React.FC = () => {
  const preferences = useAppStore((state) => state.preferences);
  const initialize = useAppStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // Apply theme, text scale, and density attributes to html root
    const root = document.documentElement;
    root.setAttribute("data-theme", preferences.theme);
    root.setAttribute("data-text-scale", preferences.textScale);
    root.setAttribute("data-density", preferences.density);
  }, [preferences]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Skip Navigation for screen-reader & keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Screen-reader live region */}
      <LiveAnnouncer />

      {/* Primary Header */}
      <Header />

      {/* Route Views */}
      <div className="app-main">
        <Suspense fallback={<main id="main-content" className="route-loading" role="status">Loading workspace…</main>}>
          <Routes>
            <Route path="/" element={<CaptureRoute />} />
            <Route path="/rail/:sessionId" element={<RailRoute />} />
            <Route path="/compile/:sessionId" element={<RailRoute />} />
            <Route path="/review/:sessionId" element={<ReviewRoute />} />
            <Route path="/evidence" element={<EvidenceRoute />} />
            <Route path="/settings" element={<SettingsRoute />} />
            <Route path="*" element={<CaptureRoute />} />
          </Routes>
        </Suspense>
      </div>

      {/* Footer */}
      <footer
        role="contentinfo"
        style={{
          backgroundColor: "var(--color-surface)",
          borderTop: "1px solid var(--color-border)",
          padding: "var(--space-6) var(--space-4)",
          marginTop: "var(--space-10)",
          textAlign: "center",
          fontSize: "0.85rem",
          color: "var(--color-muted)",
        }}
      >
        <div className="container" style={{ padding: 0 }}>
          <p style={{ fontWeight: 600, color: "var(--color-ink)", marginBottom: "4px" }}>
            ClarityRail — From messy instructions to one clear, traceable next step.
          </p>
          <p style={{ marginBottom: "var(--space-2)" }}>
            Built for the <strong>Taskforge Hackathon 2026</strong> (<a href="https://taskforge.devpost.com/" target="_blank" rel="noreferrer" style={{ color: "var(--color-action)" }}>taskforge.devpost.com</a>).
          </p>
          <p style={{ fontSize: "0.8rem" }}>
            Local-first cognitive-accessibility prototype &middot; Open source under MIT &middot; No analytics or telemetry code
          </p>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};
