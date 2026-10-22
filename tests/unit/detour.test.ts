import { describe, it, expect } from "vitest";
import { findDependencySafeDetour } from "../../src/domain/detour/selector";
import { PlanStep } from "../../src/domain/types";

describe("Dependency-Safe Detour Selector", () => {
  it("selects an independent READY step when the active step is BLOCKED", () => {
    const steps: PlanStep[] = [
      {
        id: "step_1",
        title: "Download lab starter",
        state: "DONE",
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c1"],
        dependsOn: [],
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
      {
        id: "step_2",
        title: "Waiting on hardware access",
        state: "BLOCKED",
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c2"],
        dependsOn: ["step_1"],
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
      {
        id: "step_3",
        title: "Run hardware test",
        state: "READY",
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c3"],
        dependsOn: ["step_2"], // Depends on blocked step_2 -> must be excluded!
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
      {
        id: "step_4",
        title: "Draft background theory section",
        state: "READY",
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c4"],
        dependsOn: ["step_1"], // Only depends on completed step_1!
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
    ];

    const result = findDependencySafeDetour("step_2", steps);
    expect(result.isEligible).toBe(true);
    expect(result.candidateStep?.id).toBe("step_4");
    expect(result.explanation).toContain("Safe alternative");
  });

  it("skips PROPOSED steps that appear before a valid READY step", () => {
    const steps: PlanStep[] = [
      {
        id: "step_blocked",
        title: "Acquire dataset license",
        state: "BLOCKED",
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c1"],
        dependsOn: [],
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
      {
        id: "step_proposed",
        title: "Proposed future clean-up",
        state: "PROPOSED", // Not READY! Must be rejected
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c2"],
        dependsOn: [],
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
      {
        id: "step_ready",
        title: "Read background papers",
        state: "READY", // Truly READY! Must be selected
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c3"],
        dependsOn: [],
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
    ];

    const result = findDependencySafeDetour("step_blocked", steps);
    expect(result.isEligible).toBe(true);
    expect(result.candidateStep?.id).toBe("step_ready");
  });

  it("rejects STALE, BLOCKED, ACTIVE, DONE, SKIPPED, and UNCERTAIN steps", () => {
    const steps: PlanStep[] = [
      {
        id: "blocked_target",
        title: "Blocked target",
        state: "BLOCKED",
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c1"],
        dependsOn: [],
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
      {
        id: "stale_step",
        title: "Stale step",
        state: "STALE",
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c2"],
        dependsOn: [],
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
      {
        id: "active_step",
        title: "Active step",
        state: "ACTIVE",
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c3"],
        dependsOn: [],
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
      {
        id: "uncertain_step",
        title: "Uncertain step",
        state: "READY",
        evidenceClass: "UNCERTAIN",
        sourceClauseIds: ["c4"],
        dependsOn: [],
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
    ];

    const result = findDependencySafeDetour("blocked_target", steps);
    expect(result.isEligible).toBe(false);
    expect(result.candidateStep).toBeNull();
  });

  it("returns isEligible: false with plain explanation when no safe detour exists", () => {
    const steps: PlanStep[] = [
      {
        id: "step_1",
        title: "Download lab starter",
        state: "BLOCKED",
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c1"],
        dependsOn: [],
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
      {
        id: "step_2",
        title: "Review spec",
        state: "READY",
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c2"],
        dependsOn: ["step_1"], // Blocked by step_1!
        assumptionIds: [],
        validatedAgainstRevisionId: "r1",
      },
    ];

    const result = findDependencySafeDetour("step_1", steps);
    expect(result.isEligible).toBe(false);
    expect(result.candidateStep).toBeNull();
    expect(result.explanation).toContain("No safe detour exists");
  });
});
