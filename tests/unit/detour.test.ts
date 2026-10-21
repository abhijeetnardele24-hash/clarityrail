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
        state: "PROPOSED",
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c3"],
        dependsOn: ["step_2"], // Depends on blocked step_2
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

  it("returns isEligible: false when all remaining steps depend on the blocked action", () => {
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
        state: "PROPOSED",
        evidenceClass: "DIRECT",
        sourceClauseIds: ["c2"],
        dependsOn: ["step_1"],
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
