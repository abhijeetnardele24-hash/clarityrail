/**
 * ClarityRail Core Domain Types
 * Adheres strictly to Section 7 of the TASKFORGE_CLARITYRAIL_PROJECT_SPEC.md
 */

export type EvidenceClass = "DIRECT" | "DERIVED" | "USER_CONFIRMED" | "UNCERTAIN";

export type StepState =
  | "PROPOSED"
  | "READY"
  | "ACTIVE"
  | "BLOCKED"
  | "STALE"
  | "DONE"
  | "SKIPPED";

export type RelationKind = "BEFORE" | "AFTER" | "PARALLEL" | "ALTERNATIVE";

export interface SourceClause {
  id: string;
  revisionId: string;
  ordinal: number;
  text: string;
  startOffset: number;
  endOffset: number;
}

export interface PlanStep {
  id: string;
  title: string;
  description?: string;
  state: StepState;
  evidenceClass: EvidenceClass;
  sourceClauseIds: string[];
  dependsOn: string[];
  relation?: RelationKind;
  owner?: string;
  dueText?: string;
  effortMinutes?: {
    min: number;
    max: number;
    userEdited: boolean;
  };
  assumptionIds: string[];
  validatedAgainstRevisionId: string;
  staleReason?: string;
  cueActionPhrase?: string; // e.g. "When situation X occurs, I will execute action Y"
}

export interface SourceRevision {
  id: string;
  parentRevisionId?: string;
  sourceText: string;
  normalizedDigest: string;
  createdAt: string;
  changedClauseIds: string[];
  changeSummary?: string;
}

export type AmbiguityKind =
  | "OWNER"
  | "DEADLINE"
  | "FORMAT"
  | "DEPENDENCY"
  | "SCOPE"
  | "OTHER";

export type AmbiguityStatus = "OPEN" | "ANSWERED" | "NOT_NEEDED" | "BLOCKER";

export interface Ambiguity {
  id: string;
  kind: AmbiguityKind;
  question: string;
  sourceClauseIds: string[];
  status: AmbiguityStatus;
  answer?: string;
}

export type AmbiguityFlag = Ambiguity;

export interface ResumeCapsuleData {
  sessionId: string;
  lastCompletedStepTitle?: string;
  currentActiveStepTitle?: string;
  activeBlockerQuestion?: string;
  sourceContextSentence: string;
  savedAt: string;
  isLocalOnly: true;
}

export interface RailSession {
  schemaVersion: 2;
  id: string;
  title: string;
  sourceText: string;
  activeRevisionId: string;
  sourceRevisions: SourceRevision[];
  sourceClauses: SourceClause[];
  steps: PlanStep[];
  ambiguities: Ambiguity[];
  activeStepId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClauseDiff {
  type: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
  oldClause?: SourceClause;
  newClause?: SourceClause;
  clauseId: string;
  text: string;
}

export interface RevisionImpact {
  revisionId: string;
  previousRevisionId?: string;
  clauseDiffs: ClauseDiff[];
  directlyAffectedStepIds: string[];
  transitivelyAffectedStepIds: string[];
  allStaleStepIds: string[];
}

export interface SafeDetourResult {
  candidateStep: PlanStep | null;
  isEligible: boolean;
  explanation: string;
  alternateCandidatesCount: number;
}
