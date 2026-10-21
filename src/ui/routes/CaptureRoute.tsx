import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../application/store";
import { SYNTHETIC_FIXTURES } from "../../domain/fixtures";
import { ArrowRight, Compass, ShieldCheck, Sparkles, BookOpen, Users, FileCheck } from "lucide-react";

export const CaptureRoute: React.FC = () => {
  const navigate = useNavigate();
  const createSession = useAppStore((state) => state.createSession);
  const isLoading = useAppStore((state) => state.isLoading);
  const error = useAppStore((state) => state.error);

  const [briefText, setBriefText] = useState("");
  const [briefTitle, setBriefTitle] = useState("");

  const handleCompile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!briefText.trim()) return;

    try {
      const session = await createSession(briefText.trim(), briefTitle.trim() || undefined);
      navigate(`/rail/${session.id}`);
    } catch {
      // error handled in store
    }
  };

  const handleSelectFixture = async (fixtureId: string) => {
    const fixture = SYNTHETIC_FIXTURES.find((f) => f.id === fixtureId);
    if (!fixture) return;

    setBriefTitle(fixture.title);
    setBriefText(fixture.initialBriefText);

    try {
      const session = await createSession(fixture.initialBriefText, fixture.title);
      navigate(`/rail/${session.id}`);
    } catch {
      // error handled in store
    }
  };

  return (
    <main id="main-content" className="container" style={{ padding: "var(--space-8) var(--space-4)" }}>
      {/* Hero Header */}
      <section style={{ maxWidth: 840, margin: "0 auto var(--space-8) auto", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            padding: "4px 14px",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "var(--color-action)",
            marginBottom: "var(--space-4)",
          }}
        >
          <Compass size={16} aria-hidden="true" />
          Taskforge 2026 Challenge Entry
        </div>

        <h1 style={{ marginBottom: "var(--space-4)", fontWeight: 800 }}>
          From messy instructions to one clear, traceable next step.
        </h1>

        <p
          className="text-muted"
          style={{
            fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)",
            lineHeight: 1.5,
            marginBottom: "var(--space-6)",
          }}
        >
          A local-first cognitive-accessibility workspace for students experiencing task paralysis.
          Paste an overwhelming assignment or project brief—ClarityRail isolates your immediate next action,
          preserves source evidence, and halts work if instructions change.
        </p>

        {/* Framing Banner (One User, One Barrier, Meaningful Change) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-3)",
            textAlign: "left",
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-action)" }}>
              The Intended User
            </span>
            <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>
              University student facing multi-clause, dense instructions.
            </p>
          </div>

          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-warning)" }}>
              The Specific Barrier
            </span>
            <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>
              Working-memory overload trying to reconcile competing details before starting.
            </p>
          </div>

          <div>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-success)" }}>
              The Meaningful Change
            </span>
            <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>
              One auditable next step, transparent ambiguity handling, and stale-work invalidation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Input Form */}
      <section className="card" style={{ maxWidth: 840, margin: "0 auto var(--space-8) auto" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "var(--space-3)" }}>
          Paste Your Brief or Assignment
        </h2>

        {error && (
          <div
            role="alert"
            style={{
              padding: "var(--space-3)",
              backgroundColor: "var(--color-error-bg)",
              color: "var(--color-error)",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--space-3)",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleCompile}>
          <div style={{ marginBottom: "var(--space-3)" }}>
            <label htmlFor="brief-title" style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", marginBottom: "4px" }}>
              Project or Assignment Title (Optional)
            </label>
            <input
              id="brief-title"
              type="text"
              placeholder="e.g. Distributed Systems Lab 3..."
              value={briefTitle}
              onChange={(e) => setBriefTitle(e.target.value)}
              aria-label="Project title"
            />
          </div>

          <div style={{ marginBottom: "var(--space-4)" }}>
            <label htmlFor="brief-text" style={{ display: "block", fontWeight: 600, fontSize: "0.9rem", marginBottom: "4px" }}>
              Full Instructions / Email / Brief Text
            </label>
            <textarea
              id="brief-text"
              rows={8}
              placeholder="Paste raw assignment text, professor requirements, or team handoff notes here..."
              value={briefText}
              onChange={(e) => setBriefText(e.target.value)}
              required
              aria-required="true"
              aria-label="Brief text content"
              data-testid="brief-textarea"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", color: "var(--color-success)", fontSize: "0.85rem", fontWeight: 600 }}>
              <ShieldCheck size={16} aria-hidden="true" />
              100% Client-Side Processing · Never leaves this browser
            </div>

            <button
              type="submit"
              className="button button-primary"
              disabled={isLoading || !briefText.trim()}
              data-testid="compile-button"
            >
              {isLoading ? "Compiling Execution Rail..." : "Compile to Next Action"}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </form>
      </section>

      {/* 60-Second Judge Quick-Start & Synthetic Fixtures */}
      <section style={{ maxWidth: 840, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
          <Sparkles size={20} color="var(--color-action)" aria-hidden="true" />
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            Judge Quick-Start (1-Click Synthetic Demonstrations)
          </h2>
        </div>

        <p className="text-muted" style={{ fontSize: "0.925rem", marginBottom: "var(--space-4)" }}>
          Test the four-part Clarity Contract (Evidence Thread, Ambiguity Gate, Change Impact Guard, and Dependency-Safe Detour)
          instantly with pre-annotated synthetic fixtures:
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {SYNTHETIC_FIXTURES.map((fixture) => {
            const Icon =
              fixture.category === "ACADEMIC"
                ? BookOpen
                : fixture.category === "COLLABORATIVE"
                ? Users
                : FileCheck;

            return (
              <div
                key={fixture.id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  backgroundColor: "var(--color-surface)",
                  padding: "var(--space-4)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
                    <div style={{ color: "var(--color-action)" }}>
                      <Icon size={18} aria-hidden="true" />
                    </div>
                    <span className="badge badge-direct">
                      {fixture.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "var(--space-2)" }}>
                    {fixture.title}
                  </h3>

                  <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "var(--space-4)" }}>
                    {fixture.description}
                  </p>
                </div>

                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => handleSelectFixture(fixture.id)}
                  style={{ width: "100%", justifyContent: "center" }}
                  aria-label={`Load & Compile: ${fixture.title}`}
                  data-testid={`load-fixture-${fixture.id}`}
                >
                  Load &amp; Compile
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
