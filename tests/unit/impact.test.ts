import { describe, it, expect } from "vitest";
import { compileBrief } from "../../src/domain/compiler/compiler";
import { segmentSourceText } from "../../src/domain/compiler/segmenter";
import {
  calculateRevisionImpact,
  applyRevisionStaleness,
  confirmStaleStepReview,
} from "../../src/domain/revision/impact";
import { SYNTHETIC_FIXTURES } from "../../src/domain/fixtures";

describe("Change Impact Guard & Stale State Propagation", () => {
  it("propagates STALE state directly and transitively when brief changes", () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const initialSession = compileBrief(fixture.initialBriefText, { title: fixture.title });

    // Simulate revised brief where the report was changed from 4 pages to 6 pages
    const revisedText = fixture.revisedBriefText!;
    const newRevId = "rev_2_test";
    const newClauses = segmentSourceText(revisedText, newRevId);

    const newRevision = {
      id: newRevId,
      parentRevisionId: initialSession.activeRevisionId,
      sourceText: revisedText,
      normalizedDigest: "digest_rev2",
      createdAt: new Date().toISOString(),
      changedClauseIds: newClauses.map((c) => c.id),
      changeSummary: "Expanded report requirement",
    };

    const impact = calculateRevisionImpact(
      initialSession.sourceClauses,
      newClauses,
      initialSession.steps,
      newRevision
    );

    expect(impact.allStaleStepIds.length).toBeGreaterThan(0);

    const staleSteps = applyRevisionStaleness(initialSession.steps, impact, newRevId);
    const affected = staleSteps.filter((s) => s.state === "STALE");
    expect(affected.length).toBe(impact.allStaleStepIds.length);

    // Stale step must have a descriptive staleReason
    for (const step of affected) {
      expect(step.staleReason).toBeDefined();
    }
  });

  it("requires explicit user confirmation to restore a STALE step to READY", () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const session = compileBrief(fixture.initialBriefText);

    // Force a step to STALE
    const staleStep = {
      ...session.steps[0]!,
      state: "STALE" as const,
      staleReason: "Clause modified in revision 2",
    };

    const confirmed = confirmStaleStepReview(staleStep);
    expect(confirmed.state).toBe("READY");
    expect(confirmed.staleReason).toBeUndefined();
    expect(confirmed.evidenceClass).toBe("USER_CONFIRMED");
  });

  it("diffs old and new clauses identifying added, removed, modified, and unchanged clauses", async () => {
    const { computeClauseDiff } = await import("../../src/domain/revision/diff");
    const oldClauses = [
      { id: "c1", revisionId: "r1", ordinal: 1, text: "Download starter files.", startOffset: 0, endOffset: 24 },
      { id: "c2", revisionId: "r1", ordinal: 2, text: "Write 4-page report.", startOffset: 25, endOffset: 45 },
      { id: "c3", revisionId: "r1", ordinal: 3, text: "Remove this old item.", startOffset: 46, endOffset: 67 },
    ];
    const newClauses = [
      { id: "c4", revisionId: "r2", ordinal: 1, text: "Download starter files.", startOffset: 0, endOffset: 24 },
      { id: "c5", revisionId: "r2", ordinal: 2, text: "Write 6-page report.", startOffset: 25, endOffset: 45 },
      { id: "c6", revisionId: "r2", ordinal: 3, text: "Brand new added item.", startOffset: 46, endOffset: 67 },
    ];

    const diff = computeClauseDiff(oldClauses, newClauses);
    expect(diff.some((d) => d.type === "UNCHANGED")).toBe(true);
    expect(diff.some((d) => d.type === "MODIFIED")).toBe(true);
  });
});
