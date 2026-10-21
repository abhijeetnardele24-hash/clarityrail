import { describe, it, expect } from "vitest";
import { compileBrief } from "../../src/domain/compiler/compiler";
import { SYNTHETIC_FIXTURES } from "../../src/domain/fixtures";

describe("Pure Deterministic Compiler", () => {
  it("compiles academic CS 401 fixture into structured session", () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const session = compileBrief(fixture.initialBriefText, { title: fixture.title });

    expect(session.steps.length).toBeGreaterThanOrEqual(4);
    expect(session.sourceClauses.length).toBeGreaterThanOrEqual(5);
    expect(session.schemaVersion).toBe(2);

    // First unblocked step should be READY
    const readySteps = session.steps.filter((s) => s.state === "READY");
    expect(readySteps.length).toBeGreaterThanOrEqual(1);

    // Active step ID should be assigned
    expect(session.activeStepId).toBe(readySteps[0]!.id);

    // Every step must have a non-empty sourceClauseIds array
    for (const step of session.steps) {
      expect(step.sourceClauseIds.length).toBeGreaterThan(0);
      expect(step.validatedAgainstRevisionId).toBe(session.activeRevisionId);
    }
  });

  it("assigns cue-action phrases to steps", () => {
    const brief = "Download the assignment files. Draft your research essay.";
    const session = compileBrief(brief);

    expect(session.steps[0]!.cueActionPhrase).toContain("When I open");
    expect(session.steps[1]!.cueActionPhrase).toContain("When my outline");
  });
});
