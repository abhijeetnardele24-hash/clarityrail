import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../application/store";
import { HandoffExportModal } from "../components/HandoffExportModal";
import { ArrowLeft, Download, History, FileText } from "lucide-react";

export const ReviewRoute: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const currentSession = useAppStore((state) => state.currentSession);
  const loadSession = useAppStore((state) => state.loadSession);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    if (sessionId && (!currentSession || currentSession.id !== sessionId)) {
      loadSession(sessionId);
    }
  }, [sessionId, currentSession, loadSession]);

  if (!currentSession) {
    return (
      <main id="main-content" className="container" style={{ padding: "var(--space-12) var(--space-4)", textAlign: "center" }}>
        <p>Loading session...</p>
      </main>
    );
  }

  const completedCount = currentSession.steps.filter((s) => s.state === "DONE").length;
  const totalCount = currentSession.steps.length;

  return (
    <main id="main-content" className="container" style={{ padding: "var(--space-6) var(--space-4)" }}>
      {/* Header & Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => navigate(`/rail/${currentSession.id}`)}
            style={{ padding: 0, minHeight: 32, marginBottom: "var(--space-1)", color: "var(--color-action)" }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Focus Rail
          </button>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>
            {currentSession.title} — Plan &amp; Lineage Review
          </h1>
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>
            Progress: {completedCount} of {totalCount} steps completed ({Math.round((completedCount / totalCount) * 100)}%)
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <button
            type="button"
            className="button button-primary"
            onClick={() => setExportOpen(true)}
            data-testid="open-export-modal-button"
          >
            <Download size={16} aria-hidden="true" />
            Export Handoff Capsule
          </button>
        </div>
      </div>

      {/* Complete Step Lineage Table */}
      <section className="card" style={{ marginBottom: "var(--space-6)" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "var(--space-4)" }}>
          Step Execution Pipeline &amp; Evidence Lineage
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {currentSession.steps.map((step, idx) => {
            const supporting = currentSession.sourceClauses.filter((c) =>
              step.sourceClauseIds.includes(c.id)
            );

            return (
              <div
                key={step.id}
                style={{
                  padding: "var(--space-4)",
                  backgroundColor: step.id === currentSession.activeStepId ? "var(--color-action-subtle)" : "var(--color-surface)",
                  borderRadius: "var(--radius-md)",
                  border: `1.5px solid ${
                    step.state === "STALE"
                      ? "var(--color-stale-border)"
                      : step.id === currentSession.activeStepId
                      ? "var(--color-action)"
                      : "var(--color-border)"
                  }`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "var(--color-muted)",
                      }}
                    >
                      #{idx + 1}
                    </span>
                    <strong style={{ fontSize: "1.05rem", color: "var(--color-ink)" }}>
                      {step.title}
                    </strong>
                    {step.id === currentSession.activeStepId && (
                      <span className="badge badge-direct">
                        CURRENT FOCUS
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <span
                      className={`badge ${
                        step.state === "DONE"
                          ? "badge-confirmed"
                          : step.state === "STALE"
                          ? "badge-stale"
                          : step.state === "BLOCKED"
                          ? "badge-uncertain"
                          : "badge-direct"
                      }`}
                    >
                      {step.state}
                    </span>
                    <span className="badge badge-confirmed">
                      {step.evidenceClass}
                    </span>
                  </div>
                </div>

                {step.description && (
                  <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "var(--space-2)" }}>
                    {step.description}
                  </p>
                )}

                {/* Evidence Lineage Quotes */}
                <div style={{ marginTop: "var(--space-2)", paddingTop: "var(--space-2)", borderTop: "1px solid var(--color-border-light)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", fontSize: "0.8rem", color: "var(--color-muted)", marginBottom: "4px" }}>
                    <FileText size={13} aria-hidden="true" />
                    <span>Supporting Source Clauses:</span>
                  </div>
                  {supporting.map((c) => (
                    <blockquote
                      key={c.id}
                      style={{
                        fontSize: "0.85rem",
                        fontStyle: "italic",
                        color: "var(--color-muted)",
                        paddingLeft: "var(--space-3)",
                        borderLeft: "2px solid var(--color-border)",
                        marginBottom: "4px",
                      }}
                    >
                      Clause #{c.ordinal}: &ldquo;{c.text.trim()}&rdquo;
                    </blockquote>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Revision History Log */}
      <section className="card">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
          <History size={18} color="var(--color-muted)" aria-hidden="true" />
          <h2 style={{ fontSize: "1.2rem" }}>
            Source Revision History ({currentSession.sourceRevisions.length})
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {currentSession.sourceRevisions.map((rev, revIdx) => (
            <div
              key={rev.id}
              style={{
                padding: "var(--space-3)",
                backgroundColor: "var(--color-surface-elevated)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", fontSize: "0.85rem" }}>
                <strong>Revision {revIdx + 1} ({rev.id})</strong>
                <span className="text-muted">{new Date(rev.createdAt).toLocaleString()}</span>
              </div>
              <p style={{ fontSize: "0.9rem", marginTop: "4px" }}>
                {rev.changeSummary || "Source brief revision"}
              </p>
              <span className="text-muted" style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)" }}>
                SHA Digest: {rev.normalizedDigest}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Export Modal */}
      <HandoffExportModal
        session={currentSession}
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
      />
    </main>
  );
};
