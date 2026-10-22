import { describe, it, expect } from "vitest";
import { compileBrief } from "../../src/domain/compiler/compiler";
import { segmentSourceText } from "../../src/domain/compiler/segmenter";
import {
  calculateRevisionImpact,
  applyRevisionStaleness,
  confirmStaleStepReview,
} from "../../src/domain/revision/impact";
import { computeClauseDiff } from "../../src/domain/revision/diff";
import { evaluateStepState, hasBlockingAmbiguity, areDependenciesSatisfied } from "../../src/domain/compiler/readiness";
import { AmbiguityFlag, PlanStep, SourceClause } from "../../src/domain/types";
import { SYNTHETIC_FIXTURES } from "../../src/domain/fixtures";

describe("Change Impact Guard & Stale State Propagation", () => {
  it("propagates STALE state directly and transitively while retaining original validation revision", () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const initialSession = compileBrief(fixture.initialBriefText, { title: fixture.title });
    const originalRevId = initialSession.activeRevisionId;

    // Verify all steps originally validated against originalRevId
    for (const step of initialSession.steps) {
      expect(step.validatedAgainstRevisionId).toBe(originalRevId);
    }

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

    // CRITICAL INVARIANT: Direct and transitive stale steps MUST retain their old validation revision until confirmation!
    for (const step of affected) {
      expect(step.staleReason).toBeDefined();
      expect(step.validatedAgainstRevisionId).toBe(originalRevId);
      expect(step.validatedAgainstRevisionId).not.toBe(newRevId);
    }
  });

  it("requires explicit user confirmation to restore a STALE step and updates validatedAgainstRevisionId", () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const session = compileBrief(fixture.initialBriefText);
    const initialRevId = session.activeRevisionId;
    const activeRevId = "rev_2_confirmed";

    // Force a step to STALE with old validation revision
    const staleStep: PlanStep = {
      ...session.steps[0]!,
      state: "STALE",
      staleReason: "Clause modified in revision 2",
      validatedAgainstRevisionId: initialRevId,
    };

    const confirmed = confirmStaleStepReview(staleStep, activeRevId);
    expect(confirmed.state).toBe("READY");
    expect(confirmed.staleReason).toBeUndefined();
    expect(confirmed.evidenceClass).toBe("USER_CONFIRMED");
    expect(confirmed.validatedAgainstRevisionId).toBe(activeRevId);
  });

  it("diffs old and new clauses identifying added, removed, modified, and unchanged clauses", () => {
    const oldClauses: SourceClause[] = [
      { id: "c1", revisionId: "r1", ordinal: 1, text: "Download starter files.", startOffset: 0, endOffset: 24 },
      { id: "c2", revisionId: "r1", ordinal: 2, text: "Write 4-page report.", startOffset: 25, endOffset: 45 },
      { id: "c3", revisionId: "r1", ordinal: 3, text: "Old clause to remove.", startOffset: 46, endOffset: 67 },
    ];
    const newClauses: SourceClause[] = [
      { id: "c4", revisionId: "r2", ordinal: 1, text: "Download starter files.", startOffset: 0, endOffset: 24 }, // UNCHANGED
      { id: "c5", revisionId: "r2", ordinal: 2, text: "Write 6-page report.", startOffset: 25, endOffset: 45 }, // MODIFIED
      { id: "c6", revisionId: "r2", ordinal: 3, text: "Brand new added item.", startOffset: 46, endOffset: 67 }, // MODIFIED (in-place replacement)
      { id: "c7", revisionId: "r2", ordinal: 4, text: "Appended fourth item.", startOffset: 68, endOffset: 89 }, // ADDED
    ];

    const diff = computeClauseDiff(oldClauses, newClauses);
    const unchanged = diff.filter((d) => d.type === "UNCHANGED");
    const modified = diff.filter((d) => d.type === "MODIFIED");
    const added = diff.filter((d) => d.type === "ADDED");

    expect(unchanged.length).toBe(1);
    expect(unchanged[0]?.clauseId).toBe("c4");

    expect(modified.length).toBe(2);
    expect(added.length).toBe(1);
    expect(added[0]?.clauseId).toBe("c7");

    // Genuinely changed or added clause IDs in the new revision
    const changedClauseIds = diff
      .filter((d) => d.type === "ADDED" || d.type === "MODIFIED")
      .map((d) => d.clauseId);

    expect(changedClauseIds).toContain("c5");
    expect(changedClauseIds).toContain("c6");
    expect(changedClauseIds).toContain("c7");
    expect(changedClauseIds).not.toContain("c4"); // c4 was UNCHANGED!
  });

  it("evaluates state-transition invariants: ambiguous + dependency-blocked combinations", () => {
    const parentStep: PlanStep = {
      id: "parent_1",
      title: "Prerequisite setup",
      state: "ACTIVE", // Not yet DONE!
      evidenceClass: "DIRECT",
      sourceClauseIds: ["c1"],
      dependsOn: [],
      assumptionIds: [],
      validatedAgainstRevisionId: "r1",
    };

    const dependentStep: PlanStep = {
      id: "child_1",
      title: "Execute experiment",
      state: "BLOCKED",
      evidenceClass: "DIRECT",
      sourceClauseIds: ["c2"],
      dependsOn: ["parent_1"],
      assumptionIds: [],
      validatedAgainstRevisionId: "r1",
    };

    const ambiguity: AmbiguityFlag = {
      id: "amb_1",
      kind: "SCOPE",
      question: "Which dataset split should be used?",
      sourceClauseIds: ["c2"],
      status: "OPEN",
    };

    // Both ambiguity and dependency are unresolved
    expect(hasBlockingAmbiguity(dependentStep, [ambiguity])).toBe(true);
    expect(areDependenciesSatisfied(dependentStep, [parentStep, dependentStep])).toBe(false);
    expect(evaluateStepState(dependentStep, [parentStep, dependentStep], [ambiguity])).toBe("BLOCKED");

    // User resolves the ambiguity
    const resolvedAmbiguity: AmbiguityFlag = {
      ...ambiguity,
      status: "ANSWERED",
      answer: "Use standard 80/20 train/test split",
    };
    expect(hasBlockingAmbiguity(dependentStep, [resolvedAmbiguity])).toBe(false);

    // CRITICAL: Step must NOT automatically become READY because parent_1 is still ACTIVE (not DONE)!
    const stateAfterAmbiguityResolution = evaluateStepState(
      dependentStep,
      [parentStep, dependentStep],
      [resolvedAmbiguity]
    );
    expect(stateAfterAmbiguityResolution).toBe("BLOCKED");

    // Now parent finishes (DONE)
    const completedParent: PlanStep = { ...parentStep, state: "DONE" };
    const finalState = evaluateStepState(
      dependentStep,
      [completedParent, dependentStep],
      [resolvedAmbiguity]
    );
    expect(finalState).toBe("READY");
  });

  it("evaluates state-transition invariants: ambiguous + stale combinations", () => {
    const staleStep: PlanStep = {
      id: "step_stale",
      title: "Write analysis section",
      state: "STALE",
      staleReason: "Source brief revised",
      evidenceClass: "DIRECT",
      sourceClauseIds: ["c_analysis"],
      dependsOn: [],
      assumptionIds: [],
      validatedAgainstRevisionId: "r1",
    };

    const ambiguity: AmbiguityFlag = {
      id: "amb_format",
      kind: "FORMAT",
      question: "Is IEEE or APA citation style required?",
      sourceClauseIds: ["c_analysis"],
      status: "OPEN",
    };

    // When ambiguity is resolved, STALE step MUST REMAIN STALE until explicit review!
    const answeredAmb: AmbiguityFlag = { ...ambiguity, status: "ANSWERED", answer: "IEEE" };
    const evaluated = evaluateStepState(staleStep, [staleStep], [answeredAmb]);
    expect(evaluated).toBe("STALE");

    // Explicit confirmation with active revision
    const confirmed = confirmStaleStepReview(staleStep, "r2", [staleStep], [answeredAmb]);
    expect(confirmed.state).toBe("READY");
    expect(confirmed.validatedAgainstRevisionId).toBe("r2");
  });
});
