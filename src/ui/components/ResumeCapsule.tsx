import React from "react";
import { RailSession } from "../../domain/types";
import { Clock, ShieldCheck, CheckCircle2, AlertCircle, FileText } from "lucide-react";

interface ResumeCapsuleProps {
  session: RailSession;
}

export const ResumeCapsule: React.FC<ResumeCapsuleProps> = ({ session }) => {
  const completedSteps = session.steps.filter((s) => s.state === "DONE");
  const lastCompleted = completedSteps[completedSteps.length - 1];
  const activeStep = session.steps.find((s) => s.id === session.activeStepId);
  const activeBlocker = session.ambiguities.find((a) => a.status === "BLOCKER" || a.status === "OPEN");

  // Get source sentence for active step
  const supportingClause = activeStep
    ? session.sourceClauses.find((c) => activeStep.sourceClauseIds.includes(c.id))
    : session.sourceClauses[0];

  const formattedSavedAt = new Date(session.updatedAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section
      aria-label="Resume Capsule"
      style={{
        marginTop: "var(--space-8)",
        padding: "var(--space-5)",
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-2)",
          marginBottom: "var(--space-4)",
          borderBottom: "1px solid var(--color-border-light)",
          paddingBottom: "var(--space-3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <Clock size={18} color="var(--color-muted)" aria-hidden="true" />
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>
            Interruption Recovery Capsule
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: "0.85rem" }}>
          <span className="text-muted">Saved at {formattedSavedAt}</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--color-success)",
              fontWeight: 600,
            }}
          >
            <ShieldCheck size={14} aria-hidden="true" />
            Local Device Only
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {/* Last Completed */}
        <div style={{ padding: "var(--space-3)", backgroundColor: "var(--color-surface-elevated)", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", color: "var(--color-success)", marginBottom: "4px" }}>
            <CheckCircle2 size={16} aria-hidden="true" />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
              Last Completed
            </span>
          </div>
          <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>
            {lastCompleted ? lastCompleted.title : "None yet — start with step 1"}
          </p>
        </div>

        {/* Current Focus */}
        <div style={{ padding: "var(--space-3)", backgroundColor: "var(--color-action-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-action)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", color: "var(--color-action)", marginBottom: "4px" }}>
            <Clock size={16} aria-hidden="true" />
            <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
              Current Focus
            </span>
          </div>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--color-ink)" }}>
            {activeStep ? activeStep.title : "All steps finished"}
          </p>
        </div>

        {/* Active Blocker if any */}
        {activeBlocker && (
          <div style={{ padding: "var(--space-3)", backgroundColor: "var(--color-warning-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-warning-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", color: "var(--color-warning)", marginBottom: "4px" }}>
              <AlertCircle size={16} aria-hidden="true" />
              <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase" }}>
                Unresolved Blocker
              </span>
            </div>
            <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-ink)" }}>
              {activeBlocker.question}
            </p>
          </div>
        )}
      </div>

      {/* Relevant Source Clause Context */}
      {supportingClause && (
        <div
          style={{
            marginTop: "var(--space-4)",
            padding: "var(--space-3)",
            backgroundColor: "var(--color-surface-elevated)",
            borderRadius: "var(--radius-md)",
            borderLeft: "3px solid var(--color-action)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", marginBottom: "2px" }}>
            <FileText size={14} color="var(--color-muted)" aria-hidden="true" />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-muted)" }}>
              Supporting Brief Clause (Clause #{supportingClause.ordinal})
            </span>
          </div>
          <blockquote style={{ fontSize: "0.9rem", fontStyle: "italic", color: "var(--color-ink)" }}>
            &ldquo;{supportingClause.text.trim()}&rdquo;
          </blockquote>
        </div>
      )}
    </section>
  );
};
