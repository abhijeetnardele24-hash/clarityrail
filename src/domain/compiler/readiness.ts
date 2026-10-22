import { PlanStep, AmbiguityFlag, StepState } from "../types";

/**
 * Checks whether a given step is blocked by any open or blocking ambiguity.
 */
export function hasBlockingAmbiguity(step: PlanStep, ambiguities: AmbiguityFlag[]): boolean {
  return ambiguities.some(
    (a) =>
      step.sourceClauseIds.some((cid) => a.sourceClauseIds.includes(cid)) &&
      (a.status === "OPEN" || a.status === "BLOCKER")
  );
}

/**
 * Checks whether all prerequisite dependencies for a step are completed (state === "DONE").
 */
export function areDependenciesSatisfied(step: PlanStep, allSteps: PlanStep[]): boolean {
  if (!step.dependsOn || step.dependsOn.length === 0) return true;
  const stepMap = new Map(allSteps.map((s) => [s.id, s]));
  return step.dependsOn.every((depId) => {
    const dep = stepMap.get(depId);
    return dep?.state === "DONE";
  });
}

/**
 * Centralized evaluation of a step's state when dependencies, ambiguities, or reviews change.
 *
 * Invariants:
 * 1. Terminal states (DONE, SKIPPED) remain unchanged.
 * 2. STALE steps require explicit user review against the active revision and NEVER automatically become READY.
 * 3. An action is BLOCKED if it has open/blocking ambiguities OR if any prerequisite dependency is not DONE.
 * 4. An action is READY if it is neither STALE, DONE, SKIPPED, nor BLOCKED, and all dependencies are DONE with zero open ambiguities.
 */
export function evaluateStepState(
  step: PlanStep,
  allSteps: PlanStep[],
  ambiguities: AmbiguityFlag[]
): StepState {
  if (step.state === "DONE" || step.state === "SKIPPED") {
    return step.state;
  }

  if (step.state === "STALE") {
    return "STALE";
  }

  const isAmbiguityBlocked = hasBlockingAmbiguity(step, ambiguities);
  const isDepBlocked = !areDependenciesSatisfied(step, allSteps);

  if (isAmbiguityBlocked || isDepBlocked) {
    return "BLOCKED";
  }

  return "READY";
}
