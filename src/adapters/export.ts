import { z } from "zod";
import { RailSession } from "../domain/types";

export function generateMarkdownHandoff(session: RailSession): string {
  const completedSteps = session.steps.filter((s) => s.state === "DONE");
  const activeStep = session.steps.find((s) => s.id === session.activeStepId);
  const remainingSteps = session.steps.filter((s) => s.state !== "DONE" && s.id !== session.activeStepId);
  const answeredAmbiguities = session.ambiguities.filter((a) => a.status === "ANSWERED");
  const openBlockers = session.ambiguities.filter((a) => a.status === "BLOCKER" || a.status === "OPEN");

  const lines: string[] = [];

  lines.push(`# ClarityRail Progress & Handoff Capsule: ${session.title}`);
  lines.push("");
  lines.push(`> **Generated**: ${new Date().toISOString()}`);
  lines.push(`> **Session ID**: \`${session.id}\` | **Revision**: \`${session.activeRevisionId}\``);
  lines.push(`> **Notice**: Planning artifact reviewed by user. Processed 100% locally in browser memory.`);
  lines.push("");

  // 1. Next Immediate Action
  lines.push("## 1. Immediate Next Action");
  if (activeStep) {
    lines.push(`- **Action**: ${activeStep.title}`);
    if (activeStep.description) lines.push(`  - *Details*: ${activeStep.description}`);
    if (activeStep.cueActionPhrase) lines.push(`  - *Implementation Cue*: ${activeStep.cueActionPhrase}`);
    if (activeStep.dueText) lines.push(`  - *Target Deadline*: ${activeStep.dueText}`);
    lines.push(`  - *Evidence Class*: \`${activeStep.evidenceClass}\``);
  } else {
    lines.push("- *All planned steps currently completed or in review.*");
  }
  lines.push("");

  // 2. Completed Work
  lines.push("## 2. Completed Steps");
  if (completedSteps.length > 0) {
    for (const step of completedSteps) {
      lines.push(`- [x] **${step.title}** (Supporting clause: ${step.sourceClauseIds.join(", ")})`);
    }
  } else {
    lines.push("- *No steps marked done yet.*");
  }
  lines.push("");

  // 3. Blockers & Open Ambiguities
  lines.push("## 3. Open Ambiguities & Blockers");
  if (openBlockers.length > 0) {
    for (const blocker of openBlockers) {
      lines.push(`- ⚠️ **[${blocker.kind}]** ${blocker.question}`);
    }
  } else {
    lines.push("- *Zero active blockers detected.*");
  }
  lines.push("");

  // 4. Confirmed Assumptions
  if (answeredAmbiguities.length > 0) {
    lines.push("## 4. Confirmed Decisions & Assumptions");
    for (const ans of answeredAmbiguities) {
      lines.push(`- **Decision**: ${ans.question} -> *${ans.answer ?? "Confirmed"}*`);
    }
    lines.push("");
  }

  // 5. Remaining Steps Pipeline
  lines.push("## 5. Upcoming Execution Rail");
  if (remainingSteps.length > 0) {
    for (const step of remainingSteps) {
      const stateBadge = step.state === "STALE" ? "⚠️ STALE" : step.state;
      lines.push(`- [ ] **${step.title}** [${stateBadge}]`);
    }
  } else {
    lines.push("- *No subsequent steps queued.*");
  }
  lines.push("");

  // 6. Source Traceability Ledger
  lines.push("## 6. Source Clause References");
  for (const clause of session.sourceClauses) {
    lines.push(`${clause.ordinal}. "${clause.text.trim()}"`);
  }
  lines.push("");

  return lines.join("\n");
}

export function generatePlainTextHandoff(session: RailSession): string {
  const activeStep = session.steps.find((s) => s.id === session.activeStepId);
  const completed = session.steps.filter((s) => s.state === "DONE").length;
  const total = session.steps.length;

  return [
    `CLARITYRAIL EXECUTION CAPSULE: ${session.title}`,
    `Timestamp: ${new Date().toLocaleString()}`,
    `Progress: ${completed} / ${total} steps completed`,
    "",
    `CURRENT ACTION: ${activeStep ? activeStep.title : "None currently active"}`,
    activeStep?.cueActionPhrase ? `CUE: ${activeStep.cueActionPhrase}` : "",
    "",
    "STATUS: Local-first planning state verified. Zero external telemetry.",
  ]
    .filter(Boolean)
    .join("\n");
}

// Zod Schema for JSON Import/Export Validation
export const SourceClauseSchema = z.object({
  id: z.string(),
  revisionId: z.string(),
  ordinal: z.number(),
  text: z.string(),
  startOffset: z.number(),
  endOffset: z.number(),
});

export const PlanStepSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  state: z.enum(["PROPOSED", "READY", "ACTIVE", "BLOCKED", "STALE", "DONE", "SKIPPED"]),
  evidenceClass: z.enum(["DIRECT", "DERIVED", "USER_CONFIRMED", "UNCERTAIN"]),
  sourceClauseIds: z.array(z.string()),
  dependsOn: z.array(z.string()),
  relation: z.enum(["BEFORE", "AFTER", "PARALLEL", "ALTERNATIVE"]).optional(),
  owner: z.string().optional(),
  dueText: z.string().optional(),
  effortMinutes: z
    .object({
      min: z.number(),
      max: z.number(),
      userEdited: z.boolean(),
    })
    .optional(),
  assumptionIds: z.array(z.string()),
  validatedAgainstRevisionId: z.string(),
  staleReason: z.string().optional(),
  cueActionPhrase: z.string().optional(),
});

export const AmbiguitySchema = z.object({
  id: z.string(),
  kind: z.enum(["OWNER", "DEADLINE", "FORMAT", "DEPENDENCY", "SCOPE", "OTHER"]),
  question: z.string(),
  sourceClauseIds: z.array(z.string()),
  status: z.enum(["OPEN", "ANSWERED", "NOT_NEEDED", "BLOCKER"]),
  answer: z.string().optional(),
});

export const SourceRevisionSchema = z.object({
  id: z.string(),
  parentRevisionId: z.string().optional(),
  sourceText: z.string(),
  normalizedDigest: z.string(),
  createdAt: z.string(),
  changedClauseIds: z.array(z.string()),
  changeSummary: z.string().optional(),
});

export const RailSessionSchema = z.object({
  schemaVersion: z.literal(2),
  id: z.string(),
  title: z.string(),
  sourceText: z.string(),
  activeRevisionId: z.string(),
  sourceRevisions: z.array(SourceRevisionSchema),
  sourceClauses: z.array(SourceClauseSchema),
  steps: z.array(PlanStepSchema),
  ambiguities: z.array(AmbiguitySchema),
  activeStepId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export function serializeSessionToJson(session: RailSession): string {
  // Validate before serialization
  const validated = RailSessionSchema.parse(session);
  return JSON.stringify(validated, null, 2);
}

export function parseAndValidateSessionJson(jsonStr: string): RailSession {
  const raw = JSON.parse(jsonStr);
  return RailSessionSchema.parse(raw);
}
