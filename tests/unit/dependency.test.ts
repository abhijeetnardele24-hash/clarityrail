import { describe, it, expect } from "vitest";
import { buildDependencyGraph } from "../../src/domain/compiler/dependency";
import { ActionCandidate } from "../../src/domain/compiler/extractor";

describe("Dependency Graph Builder & Cycle Detector", () => {
  it("establishes natural progression edges between prep and write verbs", () => {
    const candidates: ActionCandidate[] = [
      {
        clauseId: "c1",
        actionText: "Download the lab starter repository",
        normalizedTitle: "Download the lab starter repository",
        imperativeVerb: "download",
        isImperative: true,
        effortMin: 10,
        effortMax: 20,
      },
      {
        clauseId: "c2",
        actionText: "Draft the experimental report",
        normalizedTitle: "Draft the experimental report",
        imperativeVerb: "draft",
        isImperative: true,
        effortMin: 30,
        effortMax: 60,
      },
    ];

    const result = buildDependencyGraph(candidates, []);
    expect(result.hasCycle).toBe(false);
    expect(result.edges.length).toBeGreaterThanOrEqual(1);
    expect(result.stepDependencies.get(1)).toContain(0); // Step 2 depends on Step 1
  });

  it("detects circular dependencies and produces human-readable explanation", () => {
    const candidates: ActionCandidate[] = [
      {
        clauseId: "c1",
        actionText: "Step 1 after Step 2",
        normalizedTitle: "Step 1",
        imperativeVerb: "implement",
        isImperative: true,
        effortMin: 10,
        effortMax: 20,
      },
      {
        clauseId: "c2",
        actionText: "Step 2 after Step 1",
        normalizedTitle: "Step 2",
        imperativeVerb: "test",
        isImperative: true,
        effortMin: 10,
        effortMax: 20,
      },
    ];

    const rawClauses = [
      "Task 1 must be done before Task 2",
      "Task 2 must be done before Task 1",
    ];

    const result = buildDependencyGraph(candidates, rawClauses);
    expect(result.hasCycle).toBe(true);
    expect(result.cycleExplanation).toContain("Circular dependency detected");
  });
});
