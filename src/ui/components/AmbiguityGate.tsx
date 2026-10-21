import React, { useState } from "react";
import { Ambiguity, SourceClause } from "../../domain/types";
import { HelpCircle, Check, X, AlertTriangle } from "lucide-react";

interface AmbiguityGateProps {
  ambiguities: Ambiguity[];
  clauses: SourceClause[];
  onResolve: (id: string, status: "OPEN" | "ANSWERED" | "NOT_NEEDED" | "BLOCKER", answer?: string) => void;
}

export const AmbiguityGate: React.FC<AmbiguityGateProps> = ({
  ambiguities,
  clauses,
  onResolve,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (ambiguities.length === 0) {
    return (
      <div
        className="card"
        style={{
          backgroundColor: "var(--color-success-bg)",
          borderColor: "var(--color-success)",
          padding: "var(--space-4)",
          margin: "var(--space-4) 0",
        }}
      >
        <p style={{ fontWeight: 600, color: "var(--color-success)" }}>
          ✓ Ambiguity Gate Clear: All required deadlines, formats, and responsibilities are explicitly defined in the source.
        </p>
      </div>
    );
  }

  const handleInputChange = (id: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
  };

  const handleAnswerSubmit = (id: string) => {
    const val = (answers[id] || "").trim();
    if (val.length > 0) {
      onResolve(id, "ANSWERED", val);
    }
  };

  return (
    <section
      aria-label="Ambiguity Gate Decisions"
      className="card"
      style={{
        margin: "var(--space-6) 0",
        borderLeft: "4px solid var(--color-warning-border)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
        <HelpCircle size={22} color="var(--color-warning)" aria-hidden="true" />
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
          Ambiguity Gate ({ambiguities.filter((a) => a.status === "OPEN").length} Open Decisions)
        </h2>
      </div>

      <p className="text-muted" style={{ fontSize: "0.925rem", marginBottom: "var(--space-4)" }}>
        ClarityRail never silently guesses missing deadlines, unstated file formats, or unassigned team responsibilities.
        Provide a decision below, mark it not needed, or keep it as an explicit blocker.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        {ambiguities.map((amb) => {
          const supportingClause = clauses.find((c) => amb.sourceClauseIds.includes(c.id));
          const isResolved = amb.status === "ANSWERED" || amb.status === "NOT_NEEDED";

          return (
            <div
              key={amb.id}
              style={{
                padding: "var(--space-4)",
                backgroundColor: isResolved ? "var(--color-surface-elevated)" : "var(--color-surface)",
                border: `1px solid ${isResolved ? "var(--color-border-light)" : "var(--color-warning-border)"}`,
                borderRadius: "var(--radius-md)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-2)" }}>
                <span className={`badge ${isResolved ? "badge-confirmed" : "badge-uncertain"}`}>
                  {amb.kind} QUESTION · {amb.status}
                </span>

                {supportingClause && (
                  <span className="text-muted" style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
                    From Clause #{supportingClause.ordinal}
                  </span>
                )}
              </div>

              <p style={{ fontWeight: 600, fontSize: "1rem", margin: "var(--space-2) 0" }}>
                {amb.question}
              </p>

              {supportingClause && (
                <p className="text-muted" style={{ fontSize: "0.85rem", fontStyle: "italic", marginBottom: "var(--space-3)" }}>
                  &ldquo;{supportingClause.text.trim()}&rdquo;
                </p>
              )}

              {/* Resolution options */}
              {amb.status === "OPEN" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      placeholder="Type decision (e.g. PDF, 11:59 PM EST, Alex)..."
                      value={answers[amb.id] || ""}
                      onChange={(e) => handleInputChange(amb.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAnswerSubmit(amb.id);
                        }
                      }}
                      style={{ flex: 1, minWidth: "220px" }}
                      aria-label={`Answer for ${amb.kind} question`}
                    />
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={() => handleAnswerSubmit(amb.id)}
                      disabled={!(answers[amb.id] || "").trim()}
                    >
                      <Check size={16} aria-hidden="true" />
                      Confirm Decision
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => onResolve(amb.id, "NOT_NEEDED")}
                      style={{ fontSize: "0.85rem", minHeight: 38 }}
                    >
                      <X size={14} aria-hidden="true" />
                      Not Needed / Standard Assumption
                    </button>

                    <button
                      type="button"
                      className="button button-warning"
                      onClick={() => onResolve(amb.id, "BLOCKER")}
                      style={{ fontSize: "0.85rem", minHeight: 38 }}
                    >
                      <AlertTriangle size={14} aria-hidden="true" />
                      Mark as Hard Blocker
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                  <p style={{ fontSize: "0.9rem", color: "var(--color-success)", fontWeight: 600 }}>
                    Resolved: {amb.answer ? `"${amb.answer}"` : amb.status}
                  </p>
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={() => onResolve(amb.id, "OPEN")}
                    style={{ fontSize: "0.8rem", minHeight: 34 }}
                  >
                    Edit Decision
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
