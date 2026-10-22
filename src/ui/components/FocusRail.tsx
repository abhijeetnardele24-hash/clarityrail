import React, { useEffect, useRef, useState } from "react";
import { PlanStep, RailSession, SourceClause } from "../../domain/types";
import { CheckCircle2, ShieldAlert, Split, ChevronDown, ChevronUp, FileText, Clock } from "lucide-react";

interface FocusRailProps {
  session: RailSession;
  activeStep: PlanStep;
  supportingClauses: SourceClause[];
  onMarkDone: (stepId: string) => void;
  onMarkBlocked: (stepId: string) => void;
  onBreakDown: (stepId: string, subtasks: string[]) => void;
}

export const FocusRail: React.FC<FocusRailProps> = ({
  session,
  activeStep,
  supportingClauses,
  onMarkDone,
  onMarkBlocked,
  onBreakDown,
}) => {
  const [showEvidence, setShowEvidence] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [subtasksText, setSubtasksText] = useState("");
  const breakdownDialogRef = useRef<HTMLDivElement>(null);
  const breakdownTriggerRef = useRef<HTMLButtonElement>(null);
  const breakdownTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!showBreakdownModal) return;
    breakdownTextareaRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowBreakdownModal(false);
      if (event.key !== "Tab" || !breakdownDialogRef.current) return;
      const focusable = Array.from(breakdownDialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])'
      ));
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      breakdownTriggerRef.current?.focus();
    };
  }, [showBreakdownModal]);

  const totalSteps = session.steps.length;
  const currentIndex = session.steps.findIndex((s) => s.id === activeStep.id);
  const stepNumber = currentIndex >= 0 ? currentIndex + 1 : 1;
  const completedCount = session.steps.filter((s) => s.state === "DONE").length;

  const handleBreakdownSubmit = () => {
    const lines = subtasksText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length > 0) {
      onBreakDown(activeStep.id, lines);
      setShowBreakdownModal(false);
      setSubtasksText("");
    }
  };

  return (
    <div
      className="card"
      style={{
        padding: "var(--space-8)",
        borderRadius: "var(--radius-xl)",
        border: activeStep.state === "STALE"
          ? "2px solid var(--color-stale-border)"
          : activeStep.state === "BLOCKED"
          ? "2px solid var(--color-warning-border)"
          : "2px solid var(--color-action)",
        backgroundColor: "var(--color-surface)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {/* Quiet Header / Progress Pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-2)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "var(--color-action)",
              backgroundColor: "var(--color-action-subtle)",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
            }}
          >
            STEP {stepNumber} OF {totalSteps}
          </span>
          <span className="text-muted" style={{ fontSize: "0.85rem" }}>
            ({completedCount} completed)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span
            className={`badge ${
              activeStep.state === "STALE"
                ? "badge-stale"
                : activeStep.state === "BLOCKED"
                ? "badge-uncertain"
                : "badge-direct"
            }`}
          >
            {activeStep.state}
          </span>
          <span className="badge badge-confirmed">
            {activeStep.evidenceClass}
          </span>
        </div>
      </div>

      {/* Hero Large Action Statement */}
      <div style={{ margin: "var(--space-4) 0 var(--space-6) 0" }}>
        <h1
          style={{
            fontSize: "clamp(1.6rem, 3.5vw, 2.35rem)",
            lineHeight: 1.25,
            color: "var(--color-ink)",
            marginBottom: "var(--space-3)",
          }}
          data-testid="focus-step-title"
        >
          {activeStep.title}
        </h1>

        {activeStep.description && (
          <p className="text-muted" style={{ fontSize: "1.05rem", marginBottom: "var(--space-3)" }}>
            {activeStep.description}
          </p>
        )}

        {/* Cue-Action Implementation Intention */}
        {activeStep.cueActionPhrase && (
          <div
            style={{
              padding: "var(--space-3) var(--space-4)",
              backgroundColor: "var(--color-surface-elevated)",
              borderLeft: "3px solid var(--color-action)",
              borderRadius: "var(--radius-sm)",
              margin: "var(--space-4) 0",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--color-muted)",
                display: "block",
                marginBottom: "2px",
              }}
            >
              Action Cue (Implementation Intention)
            </span>
            <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--color-ink)" }}>
              {activeStep.cueActionPhrase}
            </p>
          </div>
        )}

        {/* Estimated Effort & Target Deadline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-4)",
            flexWrap: "wrap",
            fontSize: "0.875rem",
            color: "var(--color-muted)",
            margin: "var(--space-3) 0",
          }}
        >
          {activeStep.effortMinutes && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Clock size={15} aria-hidden="true" />
              Est. effort: {activeStep.effortMinutes.min}–{activeStep.effortMinutes.max} min
            </span>
          )}

          {activeStep.dueText && (
            <span>
              Target: <strong>{activeStep.dueText}</strong>
            </span>
          )}

          {activeStep.owner && (
            <span>
              Owner: <strong>{activeStep.owner}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Expandable "Why this step?" Source Evidence Disclosure */}
      <div style={{ margin: "var(--space-5) 0" }}>
        <button
          ref={breakdownTriggerRef}
          type="button"
          onClick={() => setShowEvidence(!showEvidence)}
          className="button button-ghost"
          style={{
            padding: "var(--space-2) 0",
            color: "var(--color-action)",
            fontSize: "0.925rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
          aria-expanded={showEvidence}
        >
          <FileText size={16} aria-hidden="true" />
          <span>Why this step? (Inspect source clause lineage)</span>
          {showEvidence ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
        </button>

        {showEvidence && (
          <div
            style={{
              marginTop: "var(--space-3)",
              padding: "var(--space-4)",
              backgroundColor: "var(--color-surface-elevated)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border-light)",
            }}
          >
            <p style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-muted)", marginBottom: "var(--space-2)" }}>
              Direct Source Evidence
            </p>
            {supportingClauses.map((clause) => (
              <div key={clause.id} style={{ marginBottom: "var(--space-2)" }}>
                <span className="badge badge-direct" style={{ marginRight: "6px" }}>
                  Clause #{clause.ordinal}
                </span>
                <span className="text-muted" style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)", marginRight: "8px" }}>
                  (chars {clause.startOffset}–{clause.endOffset})
                </span>
                <blockquote style={{ marginTop: "4px", fontStyle: "italic", color: "var(--color-ink)" }}>
                  &ldquo;{clause.text.trim()}&rdquo;
                </blockquote>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Primary Action Buttons (Min 44x44px touch targets) */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          flexWrap: "wrap",
          alignItems: "center",
          marginTop: "var(--space-6)",
          paddingTop: "var(--space-5)",
          borderTop: "1px solid var(--color-border-light)",
        }}
      >
        <button
          type="button"
          className="button button-primary"
          style={{ padding: "var(--space-3) var(--space-6)", fontSize: "1.05rem" }}
          onClick={() => onMarkDone(activeStep.id)}
          data-testid="mark-done-button"
        >
          <CheckCircle2 size={20} aria-hidden="true" />
          Mark Done &amp; Next
        </button>

        <button
          type="button"
          className="button button-warning"
          style={{ padding: "var(--space-3) var(--space-5)" }}
          onClick={() => onMarkBlocked(activeStep.id)}
          data-testid="mark-blocked-button"
        >
          <ShieldAlert size={18} aria-hidden="true" />
          I&apos;m Blocked
        </button>

        <button
          type="button"
          className="button button-secondary"
          style={{ padding: "var(--space-3) var(--space-5)" }}
          onClick={() => setShowBreakdownModal(true)}
        >
          <Split size={18} aria-hidden="true" />
          Break this down
        </button>
      </div>

      {/* Subtask Breakdown Modal */}
      {showBreakdownModal && (
        <div
          ref={breakdownDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="breakdown-title"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(23, 33, 43, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-4)",
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 500,
              backgroundColor: "var(--color-surface)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <h2 id="breakdown-title" style={{ fontSize: "1.25rem", marginBottom: "var(--space-2)" }}>
              Break Down into Micro-Steps
            </h2>
            <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "var(--space-4)" }}>
              Type 2 to 3 smaller subtasks (one per line) to make this action easier to begin.
            </p>

            <textarea
              ref={breakdownTextareaRef}
              rows={4}
              placeholder={`1. Open repository link in browser\n2. Download starter ZIP\n3. Unzip into project folder`}
              value={subtasksText}
              onChange={(e) => setSubtasksText(e.target.value)}
              aria-label="Subtask lines"
              style={{ marginBottom: "var(--space-4)" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-2)" }}>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => setShowBreakdownModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={handleBreakdownSubmit}
                disabled={!subtasksText.trim()}
              >
                Split Step
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
