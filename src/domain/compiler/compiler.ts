import {
  EvidenceClass,
  PlanStep,
  RailSession,
  SourceClause,
  SourceRevision,
  StepState,
} from "../types";
import { segmentSourceText } from "./segmenter";
import { extractActionCandidates } from "./extractor";
import { buildDependencyGraph } from "./dependency";
import { detectAmbiguities } from "./ambiguityRules";

export interface CompileOptions {
  sessionId?: string;
  revisionId?: string;
  parentRevisionId?: string;
  title?: string;
}

/**
 * Pure Deterministic Compiler Pipeline.
 * Converts raw instructions into an evidence-linked execution rail session.
 */
export function compileBrief(rawText: string, options: CompileOptions = {}): RailSession {
  const sessionId = options.sessionId || `session_${Date.now()}`;
  const revisionId = options.revisionId || `rev_1_${Date.now()}`;
  const now = new Date().toISOString();

  // 1. Normalize whitespace without changing source meaning
  const normalizedText = rawText.replace(/\r\n/g, "\n").trim();

  // 2. Sentence and clause segmentation with exact offsets
  const sourceClauses: SourceClause[] = segmentSourceText(normalizedText, revisionId);

  // 3. Action candidate extraction
  const candidates = extractActionCandidates(sourceClauses);

  // 4. Dependency graph construction and cycle detection
  const clauseTexts = sourceClauses.map((c) => c.text);
  const depGraph = buildDependencyGraph(candidates, clauseTexts);

  // 5. Ambiguity rules
  const ambiguities = detectAmbiguities(sourceClauses, candidates, revisionId);

  // 6. Construct PlanSteps
  const stepIdPrefix = `step_${revisionId}`;
  const stepIds: string[] = candidates.map((_, idx) => `${stepIdPrefix}_${idx + 1}`);

  const steps: PlanStep[] = candidates.map((cand, idx) => {
    const stepId = stepIds[idx]!;
    const prereqIndices = depGraph.stepDependencies.get(idx) ?? [];
    const dependsOnIds = prereqIndices
      .map((pIdx) => stepIds[pIdx])
      .filter((id): id is string => Boolean(id));

    // Check if any open ambiguity attaches to this clause
    const relatedAmbiguities = ambiguities.filter((a) =>
      a.sourceClauseIds.includes(cand.clauseId)
    );
    const hasOpenBlocker = relatedAmbiguities.some((a) => a.status === "OPEN" || a.status === "BLOCKER");

    // Assign evidence class
    let evidenceClass: EvidenceClass = "DIRECT";
    if (hasOpenBlocker) {
      evidenceClass = "UNCERTAIN";
    } else if (!cand.isImperative) {
      evidenceClass = "DERIVED";
    }

    // Determine initial state
    let state: StepState = "PROPOSED";
    if (depGraph.hasCycle) {
      state = "BLOCKED";
    } else if (dependsOnIds.length === 0 && !hasOpenBlocker) {
      // First unblocked step is ready to act upon
      state = idx === 0 ? "READY" : "PROPOSED";
    } else if (hasOpenBlocker) {
      state = "BLOCKED";
    }

    // Create cue-action intention phrase (Gollwitzer implementation intention)
    const cueActionPhrase = createCueActionPhrase(cand.imperativeVerb, cand.normalizedTitle);

    return {
      id: stepId,
      title: cand.normalizedTitle,
      description: cand.actionText !== cand.normalizedTitle ? cand.actionText : undefined,
      state,
      evidenceClass,
      sourceClauseIds: [cand.clauseId],
      dependsOn: dependsOnIds,
      owner: cand.owner,
      dueText: cand.dueText,
      effortMinutes: {
        min: cand.effortMin,
        max: cand.effortMax,
        userEdited: false,
      },
      assumptionIds: [],
      validatedAgainstRevisionId: revisionId,
      cueActionPhrase,
    };
  });

  // Make sure at least one step without dependencies is READY if no cycles
  if (!depGraph.hasCycle && steps.length > 0) {
    const readyStep = steps.find((s) => s.state === "READY");
    if (!readyStep) {
      const firstEligible = steps.find((s) => s.dependsOn.length === 0 && s.state !== "BLOCKED");
      if (firstEligible) {
        firstEligible.state = "READY";
      }
    }
  }

  // Active step is the first READY step
  const activeStep = steps.find((s) => s.state === "READY") || steps[0];

  // 7. Create SourceRevision record
  const initialRevision: SourceRevision = {
    id: revisionId,
    parentRevisionId: options.parentRevisionId,
    sourceText: normalizedText,
    normalizedDigest: computeSimpleDigest(normalizedText),
    createdAt: now,
    changedClauseIds: sourceClauses.map((c) => c.id),
    changeSummary: options.parentRevisionId ? "Revised brief input" : "Initial compilation",
  };

  // Derive title from options, first clause, or fallback
  const sessionTitle =
    options.title ||
    (sourceClauses[0]
      ? sourceClauses[0].text.substring(0, 45).replace(/[#*_-]/g, "").trim()
      : "Untitled Project Brief");

  return {
    schemaVersion: 2,
    id: sessionId,
    title: sessionTitle,
    sourceText: normalizedText,
    activeRevisionId: revisionId,
    sourceRevisions: [initialRevision],
    sourceClauses,
    steps,
    ambiguities,
    activeStepId: activeStep?.id,
    createdAt: now,
    updatedAt: now,
  };
}

function createCueActionPhrase(verb: string, title: string): string {
  const v = verb.toLowerCase();
  if (v === "download" || v === "read") {
    return `When I open the assignment portal or files, I will ${title.toLowerCase()}.`;
  }
  if (v === "write" || v === "draft") {
    return `When my outline and notes are open, I will begin to ${title.toLowerCase()}.`;
  }
  if (v === "submit" || v === "upload") {
    return `When my final file is exported and checked, I will ${title.toLowerCase()}.`;
  }
  return `When I begin my work session, I will ${title.toLowerCase()}.`;
}

function computeSimpleDigest(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `digest_${Math.abs(hash).toString(16)}`;
}
