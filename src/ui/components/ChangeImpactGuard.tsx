import React, { useState } from "react";
import { PlanStep, RailSession } from "../../domain/types";
import { AlertTriangle, RefreshCw, CheckCircle, Edit3 } from "lucide-react";

interface ChangeImpactGuardProps {
  session: RailSession;
  onReviseBrief: (newText: string) => void;
  onConfirmStale: (stepId: string) => void;
}

export const ChangeImpactGuard: React.FC<ChangeImpactGuardProps> = ({
  session,
  onReviseBrief,
  onConfirmStale,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(session.sourceText);

  const staleSteps = session.steps.filter((s) => s.state === "STALE");
  const latestRevision = session.sourceRevisions[session.sourceRevisions.length - 1];

  const handleApplyRevision = () => {
    if (editText.trim() && editText.trim() !== session.sourceText.trim()) {
      onReviseBrief(editText.trim());
      setIsEditing(false);
    }
  };

  return (
    <section
      aria-label="Change Impact Guard"
      className="card"
      style={{
        margin: "var(--space-6) 0",
        borderLeft: `4px solid ${staleSteps.length > 0 ? "var(--color-stale-border)" : "var(--color-action)"}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          marginBottom: "var(--space-3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <RefreshCw size={20} color="var(--color-action)" aria-hidden="true" />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            Change Impact Guard (Revision {session.sourceRevisions.length})
          </h2>
        </div>

        <button
          type="button"
          className="button button-secondary"
          onClick={() => {
            setEditText(session.sourceText);
            setIsEditing(!isEditing);
          }}
          style={{ minHeight: 38 }}
          aria-expanded={isEditing}
          data-testid="edit-brief-button"
        >
          <Edit3 size={16} aria-hidden="true" />
          {isEditing ? "Close Revision Editor" : "Revise Source Brief"}
        </button>
      </div>

      <p className="text-muted" style={{ fontSize: "0.925rem", marginBottom: "var(--space-4)" }}>
        When instructions change mid-project, ClarityRail marks directly and transitively affected tasks as <strong>STALE</strong>.
        Obsolete work is halted until explicitly re-confirmed.
      </p>

      {/* Editor Form */}
      {isEditing && (
        <div
          style={{
            padding: "var(--space-4)",
            backgroundColor: "var(--color-surface-elevated)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            marginBottom: "var(--space-5)",
          }}
        >
          <label htmlFor="revise-brief-input" style={{ fontWeight: 700, fontSize: "0.9rem", display: "block", marginBottom: "var(--space-2)" }}>
            Edit Source Brief Text
          </label>
          <textarea
            id="revise-brief-input"
            rows={6}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{ marginBottom: "var(--space-3)" }}
            data-testid="revise-brief-textarea"
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={handleApplyRevision}
              disabled={editText.trim() === session.sourceText.trim()}
              data-testid="apply-revision-button"
            >
              Recompile &amp; Propagate Impact
            </button>
          </div>
        </div>
      )}

      {/* Stale Steps Notice */}
      {staleSteps.length > 0 ? (
        <div
          style={{
            padding: "var(--space-4)",
            backgroundColor: "var(--color-stale-bg)",
            border: "1.5px solid var(--color-stale-border)",
            borderRadius: "var(--radius-md)",
          }}
          role="alert"
          data-testid="stale-alert"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
            <AlertTriangle size={20} color="var(--color-stale)" aria-hidden="true" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-stale)" }}>
              {staleSteps.length} Step(s) Require Review Due to Source Revision
            </h3>
          </div>

          <p style={{ fontSize: "0.9rem", color: "var(--color-stale)", marginBottom: "var(--space-3)" }}>
            The brief was updated ({latestRevision?.changeSummary || "Source revision"}). The following tasks have been paused to prevent executing against obsolete instructions:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {staleSteps.map((step: PlanStep) => (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "var(--space-2)",
                  padding: "var(--space-3)",
                  backgroundColor: "var(--color-surface)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--color-stale-border)",
                }}
              >
                <div>
                  <span className="badge badge-stale" style={{ marginRight: "6px" }}>
                    STALE
                  </span>
                  <strong style={{ fontSize: "0.95rem" }}>{step.title}</strong>
                  {step.staleReason && (
                    <p className="text-muted" style={{ fontSize: "0.825rem", marginTop: "2px" }}>
                      {step.staleReason}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="button button-success"
                  onClick={() => onConfirmStale(step.id)}
                  style={{ minHeight: 38, padding: "var(--space-1) var(--space-4)", fontSize: "0.85rem" }}
                  data-testid={`confirm-stale-${step.id}`}
                >
                  <CheckCircle size={15} aria-hidden="true" />
                  Review &amp; Mark Ready
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted" style={{ fontSize: "0.9rem" }}>
          ✓ All active and queued steps are synchronized with revision {session.activeRevisionId}.
        </p>
      )}
    </section>
  );
};
