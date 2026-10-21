import { PlanStep, SafeDetourResult } from "../types";

/**
 * Dependency-Safe Detour Selector.
 *
 * Invariant:
 * When a step is blocked, offers only currently valid independent work.
 * Explains eligibility in one sentence.
 * If no safe detour exists, states that plainly.
 */
export function findDependencySafeDetour(
  blockedStepId: string,
  allSteps: PlanStep[]
): SafeDetourResult {
  const stepMap = new Map<string, PlanStep>();
  for (const s of allSteps) {
    stepMap.set(s.id, s);
  }

  const blockedStep = stepMap.get(blockedStepId);
  if (!blockedStep) {
    return {
      candidateStep: null,
      isEligible: false,
      explanation: "No active blocked step specified.",
      alternateCandidatesCount: 0,
    };
  }

  // Build the set of all steps that depend on the blocked step (directly or transitively)
  const downstreamOfBlocked = new Set<string>();
  const queue = [blockedStepId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    for (const step of allSteps) {
      if (step.dependsOn.includes(currentId) && !downstreamOfBlocked.has(step.id)) {
        downstreamOfBlocked.add(step.id);
        queue.push(step.id);
      }
    }
  }

  // Find eligible candidate steps
  const eligibleCandidates: PlanStep[] = [];

  for (const step of allSteps) {
    // 1. Cannot be the blocked step itself
    if (step.id === blockedStepId) continue;

    // 2. Cannot already be finished
    if (step.state === "DONE" || step.state === "SKIPPED") continue;

    // 3. Cannot be STALE or BLOCKED
    if (step.state === "STALE" || step.state === "BLOCKED") continue;

    // 4. Cannot depend on the blocked step (directly or transitively)
    if (downstreamOfBlocked.has(step.id)) continue;

    // 5. All prerequisites must be DONE
    const allPrereqsDone = step.dependsOn.every((depId) => {
      const dep = stepMap.get(depId);
      return dep?.state === "DONE";
    });

    if (!allPrereqsDone) continue;

    // 6. Cannot have UNCERTAIN evidence class
    if (step.evidenceClass === "UNCERTAIN") continue;

    eligibleCandidates.push(step);
  }

  if (eligibleCandidates.length === 0) {
    return {
      candidateStep: null,
      isEligible: false,
      explanation:
        "No safe detour exists. All remaining steps depend on the currently blocked action or require unresolved prerequisites.",
      alternateCandidatesCount: 0,
    };
  }

  const candidate = eligibleCandidates[0]!;
  const explanation = `Safe alternative: '${candidate.title}' has all prerequisites satisfied and operates independently of '${blockedStep.title}'.`;

  return {
    candidateStep: candidate,
    isEligible: true,
    explanation,
    alternateCandidatesCount: eligibleCandidates.length,
  };
}
