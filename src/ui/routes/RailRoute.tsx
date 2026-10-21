import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../application/store";
import { FocusRail } from "../components/FocusRail";
import { SafeDetourBanner } from "../components/SafeDetourBanner";
import { AmbiguityGate } from "../components/AmbiguityGate";
import { ChangeImpactGuard } from "../components/ChangeImpactGuard";
import { ResumeCapsule } from "../components/ResumeCapsule";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const RailRoute: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const currentSession = useAppStore((state) => state.currentSession);
  const loadSession = useAppStore((state) => state.loadSession);
  const markStepDone = useAppStore((state) => state.markStepDone);
  const markStepBlocked = useAppStore((state) => state.markStepBlocked);
  const breakDownStep = useAppStore((state) => state.breakDownStep);
  const resolveAmbiguity = useAppStore((state) => state.resolveAmbiguity);
  const reviseSourceText = useAppStore((state) => state.reviseSourceText);
  const reviewAndConfirmStaleStep = useAppStore((state) => state.reviewAndConfirmStaleStep);
  const activateDetourStep = useAppStore((state) => state.activateDetourStep);
  const safeDetour = useAppStore((state) => state.safeDetour);
  const isLoading = useAppStore((state) => state.isLoading);

  useEffect(() => {
    if (sessionId && (!currentSession || currentSession.id !== sessionId)) {
      loadSession(sessionId);
    }
  }, [sessionId, currentSession, loadSession]);

  if (isLoading) {
    return (
      <main id="main-content" className="container" style={{ padding: "var(--space-12) var(--space-4)", textAlign: "center" }}>
        <p style={{ fontWeight: 600 }}>Loading Execution Rail...</p>
      </main>
    );
  }

  if (!currentSession) {
    return (
      <main id="main-content" className="container" style={{ padding: "var(--space-12) var(--space-4)", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "var(--space-4)" }}>Session Not Found</h1>
        <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
          The requested brief session could not be found in local browser storage.
        </p>
        <button type="button" className="button button-primary" onClick={() => navigate("/")}>
          <ArrowLeft size={16} aria-hidden="true" />
          Create or Load a Brief
        </button>
      </main>
    );
  }

  const activeStep =
    currentSession.steps.find((s) => s.id === currentSession.activeStepId) ||
    currentSession.steps.find((s) => s.state === "READY") ||
    currentSession.steps[0];

  const supportingClauses = activeStep
    ? currentSession.sourceClauses.filter((c) => activeStep.sourceClauseIds.includes(c.id))
    : [];

  const allCompleted = currentSession.steps.every((s) => s.state === "DONE" || s.state === "SKIPPED");

  return (
    <main id="main-content" className="container" style={{ padding: "var(--space-6) var(--space-4)" }}>
      {/* Session Title & Quick Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          marginBottom: "var(--space-5)",
        }}
      >
        <div>
          <span className="badge badge-direct" style={{ marginBottom: "4px" }}>
            Active Execution Rail
          </span>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800 }}>{currentSession.title}</h2>
        </div>

        <button
          type="button"
          className="button button-secondary"
          onClick={() => navigate(`/review/${currentSession.id}`)}
          style={{ minHeight: 38 }}
        >
          <CheckCircle2 size={16} aria-hidden="true" />
          View Full Plan &amp; Export Handoff
        </button>
      </div>

      {/* Completion Banner if all steps done */}
      {allCompleted ? (
        <section
          className="card"
          style={{
            textAlign: "center",
            padding: "var(--space-8)",
            backgroundColor: "var(--color-success-bg)",
            borderColor: "var(--color-success)",
            marginBottom: "var(--space-6)",
          }}
          role="status"
        >
          <div style={{ color: "var(--color-success)", marginBottom: "var(--space-2)" }}>
            <CheckCircle2 size={48} style={{ margin: "0 auto" }} aria-hidden="true" />
          </div>
          <h1 style={{ fontSize: "1.75rem", color: "var(--color-success)", marginBottom: "var(--space-2)" }}>
            All Planned Steps Completed!
          </h1>
          <p className="text-muted" style={{ marginBottom: "var(--space-4)" }}>
            You have executed every traceable action item from this brief. Generate your progress handoff capsule to summarize your completed deliverables.
          </p>
          <button
            type="button"
            className="button button-primary"
            onClick={() => navigate(`/review/${currentSession.id}`)}
          >
            Generate Handoff Capsule
          </button>
        </section>
      ) : activeStep ? (
        /* Focus Rail Hero Screen */
        <FocusRail
          session={currentSession}
          activeStep={activeStep}
          supportingClauses={supportingClauses}
          onMarkDone={markStepDone}
          onMarkBlocked={markStepBlocked}
          onBreakDown={breakDownStep}
        />
      ) : null}

      {/* Dependency-Safe Detour Banner (Appears when active step is BLOCKED) */}
      {activeStep?.state === "BLOCKED" && safeDetour && (
        <SafeDetourBanner
          detour={safeDetour}
          onActivate={activateDetourStep}
        />
      )}

      {/* Ambiguity Gate */}
      <AmbiguityGate
        ambiguities={currentSession.ambiguities}
        clauses={currentSession.sourceClauses}
        onResolve={resolveAmbiguity}
      />

      {/* Change Impact Guard (Revision diff & Stale step propagation) */}
      <ChangeImpactGuard
        session={currentSession}
        onReviseBrief={reviseSourceText}
        onConfirmStale={reviewAndConfirmStaleStep}
      />

      {/* Interruption Recovery Capsule */}
      <ResumeCapsule session={currentSession} />
    </main>
  );
};
