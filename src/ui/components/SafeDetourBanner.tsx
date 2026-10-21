import React from "react";
import { SafeDetourResult } from "../../domain/types";
import { ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";

interface SafeDetourBannerProps {
  detour: SafeDetourResult;
  onActivate: (stepId: string) => void;
}

export const SafeDetourBanner: React.FC<SafeDetourBannerProps> = ({ detour, onActivate }) => {
  return (
    <aside
      aria-label="Dependency-Safe Detour Recommendation"
      style={{
        margin: "var(--space-6) 0",
        padding: "var(--space-5)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: detour.isEligible ? "var(--color-surface-elevated)" : "var(--color-warning-bg)",
        border: `1.5px solid ${detour.isEligible ? "var(--color-action)" : "var(--color-warning-border)"}`,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
        <div
          style={{
            color: detour.isEligible ? "var(--color-action)" : "var(--color-warning)",
            marginTop: "2px",
          }}
        >
          {detour.isEligible ? <ShieldCheck size={24} aria-hidden="true" /> : <AlertTriangle size={24} aria-hidden="true" />}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: detour.isEligible ? "var(--color-action)" : "var(--color-warning)",
              }}
            >
              {detour.isEligible ? "Dependency-Safe Detour Available" : "Detour Blocked"}
            </span>
          </div>

          <p style={{ marginTop: "var(--space-1)", fontWeight: 500 }}>
            {detour.explanation}
          </p>

          {detour.isEligible && detour.candidateStep && (
            <div
              style={{
                marginTop: "var(--space-4)",
                padding: "var(--space-3)",
                backgroundColor: "var(--color-surface)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "var(--space-3)",
              }}
            >
              <div>
                <span className="badge badge-direct" style={{ marginBottom: "4px" }}>
                  Eligible Independent Work
                </span>
                <p style={{ fontWeight: 700, fontSize: "1.05rem" }}>
                  {detour.candidateStep.title}
                </p>
                {detour.candidateStep.dueText && (
                  <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                    Target: {detour.candidateStep.dueText}
                  </p>
                )}
              </div>

              <button
                type="button"
                className="button button-primary"
                onClick={() => onActivate(detour.candidateStep!.id)}
                aria-label={`Switch focus to safe alternative: ${detour.candidateStep.title}`}
              >
                Switch to this step
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
