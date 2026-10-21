import React, { useState } from "react";
import { useAppStore } from "../../application/store";
import { Settings, Eye, Sliders, Trash2 } from "lucide-react";

export const SettingsRoute: React.FC = () => {
  const preferences = useAppStore((state) => state.preferences);
  const setPreferences = useAppStore((state) => state.setPreferences);
  const resetAllData = useAppStore((state) => state.resetAllData);
  const currentSession = useAppStore((state) => state.currentSession);

  const [confirmReset, setConfirmReset] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    await resetAllData();
    setConfirmReset(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <main id="main-content" className="container" style={{ padding: "var(--space-8) var(--space-4)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
          <Settings size={24} color="var(--color-action)" aria-hidden="true" />
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Display &amp; Accessibility Preferences</h1>
        </div>

        <p className="text-muted" style={{ fontSize: "1rem", marginBottom: "var(--space-6)" }}>
          Preferences are persisted in local browser storage so your workspace opens with your preferred sensory settings.
        </p>

        {resetSuccess && (
          <div
            role="status"
            style={{
              padding: "var(--space-3)",
              backgroundColor: "var(--color-success-bg)",
              color: "var(--color-success)",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--space-4)",
              fontWeight: 600,
            }}
          >
            ✓ All local sessions and preferences have been cleared.
          </div>
        )}

        {/* Sensory & Visual Settings */}
        <section className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            <Eye size={20} color="var(--color-action)" aria-hidden="true" />
            <h2 style={{ fontSize: "1.2rem" }}>Visual Contrast &amp; Palette</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            {/* Theme Toggle */}
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: "0.95rem", marginBottom: "var(--space-2)" }}>
                Color Theme
              </label>
              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`button ${preferences.theme === "warm-paper" ? "button-primary" : "button-secondary"}`}
                  onClick={() => setPreferences({ theme: "warm-paper" })}
                  aria-pressed={preferences.theme === "warm-paper"}
                >
                  Warm Paper (Default Editorial)
                </button>
                <button
                  type="button"
                  className={`button ${preferences.theme === "high-contrast" ? "button-primary" : "button-secondary"}`}
                  onClick={() => setPreferences({ theme: "high-contrast" })}
                  aria-pressed={preferences.theme === "high-contrast"}
                >
                  High Contrast (Dark &amp; Vivid)
                </button>
              </div>
            </div>

            {/* Text Scale */}
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: "0.95rem", marginBottom: "var(--space-2)" }}>
                Text Scale
              </label>
              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`button ${preferences.textScale === "normal" ? "button-primary" : "button-secondary"}`}
                  onClick={() => setPreferences({ textScale: "normal" })}
                  aria-pressed={preferences.textScale === "normal"}
                >
                  Normal (100%)
                </button>
                <button
                  type="button"
                  className={`button ${preferences.textScale === "large" ? "button-primary" : "button-secondary"}`}
                  onClick={() => setPreferences({ textScale: "large" })}
                  aria-pressed={preferences.textScale === "large"}
                >
                  Large (112.5%)
                </button>
                <button
                  type="button"
                  className={`button ${preferences.textScale === "x-large" ? "button-primary" : "button-secondary"}`}
                  onClick={() => setPreferences({ textScale: "x-large" })}
                  aria-pressed={preferences.textScale === "x-large"}
                >
                  Extra Large (125%)
                </button>
              </div>
            </div>

            {/* Layout Density */}
            <div>
              <label style={{ display: "block", fontWeight: 700, fontSize: "0.95rem", marginBottom: "var(--space-2)" }}>
                Interface Density
              </label>
              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className={`button ${preferences.density === "comfortable" ? "button-primary" : "button-secondary"}`}
                  onClick={() => setPreferences({ density: "comfortable" })}
                  aria-pressed={preferences.density === "comfortable"}
                >
                  Comfortable Spacing
                </button>
                <button
                  type="button"
                  className={`button ${preferences.density === "compact" ? "button-primary" : "button-secondary"}`}
                  onClick={() => setPreferences({ density: "compact" })}
                  aria-pressed={preferences.density === "compact"}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Cognitive Features */}
        <section className="card" style={{ marginBottom: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            <Sliders size={20} color="var(--color-action)" aria-hidden="true" />
            <h2 style={{ fontSize: "1.2rem" }}>Cognitive &amp; Motion Support</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(e) => setPreferences({ reducedMotion: e.target.checked })}
                style={{ width: 22, height: 22, minHeight: 22 }}
              />
              <div>
                <strong>Reduce Interface Motion</strong>
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                  Disables pulse animations and transitions for users sensitive to motion.
                </p>
              </div>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={preferences.cuePhrasesEnabled}
                onChange={(e) => setPreferences({ cuePhrasesEnabled: e.target.checked })}
                style={{ width: 22, height: 22, minHeight: 22 }}
              />
              <div>
                <strong>Action Cues (Implementation Intentions)</strong>
                <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                  Formats action titles with &ldquo;When situation X occurs, I will...&rdquo; cues.
                </p>
              </div>
            </label>
          </div>
        </section>

        {/* Local Storage & Data Management */}
        <section className="card" style={{ borderColor: "var(--color-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
            <Trash2 size={20} color="var(--color-error)" aria-hidden="true" />
            <h2 style={{ fontSize: "1.2rem", color: "var(--color-error)" }}>
              Local Workspace Data Management
            </h2>
          </div>

          <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "var(--space-4)" }}>
            All project brief sessions, revisions, and decisions reside exclusively on your machine.
            Clearing local data permanently removes all stored rails.
          </p>

          {currentSession && (
            <p style={{ fontSize: "0.85rem", marginBottom: "var(--space-4)" }}>
              Active Session: <strong>{currentSession.title}</strong> ({currentSession.steps.length} steps)
            </p>
          )}

          {confirmReset ? (
            <div
              style={{
                padding: "var(--space-4)",
                backgroundColor: "var(--color-error-bg)",
                border: "1.5px solid var(--color-error)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <p style={{ fontWeight: 700, color: "var(--color-error)", marginBottom: "var(--space-3)" }}>
                Are you sure you want to delete all local sessions and reset settings? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setConfirmReset(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button"
                  style={{ backgroundColor: "var(--color-error)", color: "#FFFFFF" }}
                  onClick={handleReset}
                  data-testid="confirm-reset-button"
                >
                  Yes, Delete All Data
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="button button-secondary"
              style={{ color: "var(--color-error)", borderColor: "var(--color-error)" }}
              onClick={() => setConfirmReset(true)}
              data-testid="reset-data-button"
            >
              <Trash2 size={16} aria-hidden="true" />
              Reset All Local Workspace Data
            </button>
          )}
        </section>
      </div>
    </main>
  );
};
