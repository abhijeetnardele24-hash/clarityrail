import { AmbiguityFlag, PlanStep, RevisionImpact, SourceClause, SourceRevision, StepState } from "../types";
import { computeClauseDiff } from "./diff";
import { areDependenciesSatisfied, hasBlockingAmbiguity } from "../compiler/readiness";

/**
 * Propagates source clause changes through the PlanStep dependency graph.
 *
 * Invariants:
 * 1. Directly affected steps whose supporting clauses were modified/removed become STALE.
 * 2. Downstream dependent steps become STALE transitively.
 * 3. Stale steps retain their old validation revision ID until explicit user confirmation.
 * 4. Stale steps cannot return to READY/ACTIVE without explicit user review.
 */
export function calculateRevisionImpact(
  previousClauses: SourceClause[],
  currentClauses: SourceClause[],
  currentSteps: PlanStep[],
  newRevision: SourceRevision
): RevisionImpact {
  const clauseDiffs = computeClauseDiff(previousClauses, currentClauses);

  // Find all clause IDs that were added, removed, or modified
  const alteredClauseOrdinals = new Set<number>();
  for (const diff of clauseDiffs) {
    if (diff.type === "ADDED" || diff.type === "MODIFIED" || diff.type === "REMOVED") {
      const ord = diff.newClause?.ordinal ?? diff.oldClause?.ordinal;
      if (ord !== undefined) alteredClauseOrdinals.add(ord);
    }
  }

  // 1. Identify directly affected steps
  // A step is directly affected if its original supporting clause was altered
  const directlyAffectedStepIds = new Set<string>();

  for (const step of currentSteps) {
    for (const clauseId of step.sourceClauseIds) {
      // Find clause ordinal
      const clause = previousClauses.find((c) => c.id === clauseId);
      if (clause && alteredClauseOrdinals.has(clause.ordinal)) {
        directlyAffectedStepIds.add(step.id);
        break;
      }
    }
  }

  // 2. Identify transitively affected steps using breadth-first traversal
  const transitivelyAffectedStepIds = new Set<string>();
  const queue = [...directlyAffectedStepIds];
  const allStaleSet = new Set<string>(directlyAffectedStepIds);

  // Build forward graph: stepId -> childStepIds that depend on stepId
  const forwardGraph = new Map<string, string[]>();
  for (const step of currentSteps) {
    for (const depId of step.dependsOn) {
      const children = forwardGraph.get(depId) ?? [];
      children.push(step.id);
      forwardGraph.set(depId, children);
    }
  }

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const dependents = forwardGraph.get(currentId) ?? [];

    for (const depId of dependents) {
      if (!allStaleSet.has(depId)) {
        allStaleSet.add(depId);
        transitivelyAffectedStepIds.add(depId);
        queue.push(depId);
      }
    }
  }

  return {
    revisionId: newRevision.id,
    previousRevisionId: newRevision.parentRevisionId,
    clauseDiffs,
    directlyAffectedStepIds: Array.from(directlyAffectedStepIds),
    transitivelyAffectedStepIds: Array.from(transitivelyAffectedStepIds),
    allStaleStepIds: Array.from(allStaleSet),
  };
}
/**
 * Applies revision impact to the steps, marking affected items as STALE.
 *
 * CRITICAL INVARIANT:
 * Does NOT set validatedAgainstRevisionId to the new revision while marking a step STALE.
 * The field continues identifying the last revision the step was genuinely validated against.
 */
export function applyRevisionStaleness(
  steps: PlanStep[],
  impact: RevisionImpact,
  _newRevisionId?: string
): PlanStep[] {
  const directSet = new Set(impact.directlyAffectedStepIds);
  const transitiveSet = new Set(impact.transitivelyAffectedStepIds);

  return steps.map((step) => {
    if (directSet.has(step.id)) {
      return {
        ...step,
        state: "STALE",
        staleReason: "Direct source clause revised. Requires review against updated brief.",
      };
    }

    if (transitiveSet.has(step.id)) {
      return {
        ...step,
        state: "STALE",
        staleReason: "Prerequisite action was invalidated by source revision. Requires review.",
      };
    }

    return step;
  });
}

/**
 * Explicit review: allows the user to re-confirm a stale step after reviewing changes.
 * Updates validatedAgainstRevisionId to the active revision ID upon confirmation.
 * Evaluates readiness: transitions to READY if dependencies and ambiguities are resolved; BLOCKED otherwise.
 */
export function confirmStaleStepReview(
  step: PlanStep,
  activeRevisionId: string,
  allSteps?: PlanStep[],
  ambiguities?: AmbiguityFlag[]
): PlanStep {
  if (step.state !== "STALE") {
    return step;
  }

  let nextState: StepState = "READY";
  if (allSteps && ambiguities) {
    const isAmbiguityBlocked = hasBlockingAmbiguity(step, ambiguities);
    const isDepBlocked = !areDependenciesSatisfied(step, allSteps);
    nextState = isAmbiguityBlocked || isDepBlocked ? "BLOCKED" : "READY";
  }

  return {
    ...step,
    state: nextState,
    staleReason: undefined,
    evidenceClass: "USER_CONFIRMED",
    validatedAgainstRevisionId: activeRevisionId,
  };
}
