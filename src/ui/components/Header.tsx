import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppStore } from "../../application/store";
import { Compass, CheckCircle2, ShieldCheck, Settings, BookOpen } from "lucide-react";

export const Header: React.FC = () => {
  const location = useLocation();
  const currentSession = useAppStore((state) => state.currentSession);
  const preferences = useAppStore((state) => state.preferences);
  const setPreferences = useAppStore((state) => state.setPreferences);

  const toggleTheme = () => {
    const next = preferences.theme === "warm-paper" ? "high-contrast" : "warm-paper";
    setPreferences({ theme: next });
  };

  const sessionId = currentSession?.id;

  return (
    <header
      role="banner"
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "var(--space-3) var(--space-4)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          padding: 0,
        }}
      >
        {/* Brand / Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              textDecoration: "none",
              color: "var(--color-ink)",
            }}
            aria-label="ClarityRail Home"
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-action)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
              }}
            >
              <Compass size={22} aria-hidden="true" />
            </div>
            <div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  letterSpacing: "-0.02em",
                }}
              >
                ClarityRail
              </span>
              <span
                className="sr-only"
              >
                — From messy instructions to one clear, traceable next step
              </span>
            </div>
          </Link>

          {/* Privacy & Offline Local Indicator */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "0.8rem",
              fontWeight: 600,
              padding: "2px 8px",
              backgroundColor: "var(--color-success-bg)",
              color: "var(--color-success)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-success)",
            }}
            title="Local browser storage verified. Zero external telemetry or third-party trackers."
          >
            <ShieldCheck size={14} aria-hidden="true" />
            Local &amp; Offline
          </span>
        </div>

        {/* Primary Navigation */}
        <nav role="navigation" aria-label="Main Navigation">
          <ul
            style={{
              display: "flex",
              alignItems: "center",
              listStyle: "none",
              gap: "var(--space-2)",
              flexWrap: "wrap",
            }}
          >
            <li>
              <Link
                to="/"
                className={`button button-ghost ${location.pathname === "/" ? "button-secondary" : ""}`}
                style={{ minHeight: 38, padding: "var(--space-1) var(--space-3)" }}
              >
                New Brief
              </Link>
            </li>

            {sessionId && (
              <>
                <li>
                  <Link
                    to={`/rail/${sessionId}`}
                    className={`button ${location.pathname.startsWith("/rail") ? "button-primary" : "button-ghost"}`}
                    style={{ minHeight: 38, padding: "var(--space-1) var(--space-3)" }}
                  >
                    <Compass size={16} aria-hidden="true" />
                    Focus Rail
                  </Link>
                </li>
                <li>
                  <Link
                    to={`/review/${sessionId}`}
                    className={`button ${location.pathname.startsWith("/review") ? "button-secondary" : "button-ghost"}`}
                    style={{ minHeight: 38, padding: "var(--space-1) var(--space-3)" }}
                  >
                    <CheckCircle2 size={16} aria-hidden="true" />
                    Review &amp; Handoff
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link
                to="/evidence"
                className={`button button-ghost ${location.pathname === "/evidence" ? "button-secondary" : ""}`}
                style={{ minHeight: 38, padding: "var(--space-1) var(--space-3)" }}
              >
                <BookOpen size={16} aria-hidden="true" />
                Evidence
              </Link>
            </li>

            <li>
              <Link
                to="/settings"
                className={`button button-ghost ${location.pathname === "/settings" ? "button-secondary" : ""}`}
                style={{ minHeight: 38, padding: "var(--space-1) var(--space-3)" }}
                aria-label="Accessibility & Display Settings"
              >
                <Settings size={16} aria-hidden="true" />
                Settings
              </Link>
            </li>

            {/* Quick Contrast Toggle Button */}
            <li>
              <button
                type="button"
                onClick={toggleTheme}
                className="button button-ghost"
                style={{
                  minHeight: 38,
                  padding: "var(--space-1) var(--space-3)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  border: "1px solid var(--color-border)",
                }}
                aria-label={`${preferences.theme === "warm-paper" ? "High Contrast" : "Warm Paper"} theme`}
              >
                {preferences.theme === "warm-paper" ? "High Contrast" : "Warm Paper"}
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
