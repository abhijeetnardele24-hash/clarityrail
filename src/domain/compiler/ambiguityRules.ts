import { Ambiguity, SourceClause } from "../types";
import { ActionCandidate } from "./extractor";

/**
 * Deterministic Ambiguity Detector.
 * Flags missing facts, ambiguous deadlines, unassigned team responsibilities,
 * and unspecified deliverable formats without guessing.
 */
export function detectAmbiguities(
  clauses: SourceClause[],
  candidates: ActionCandidate[],
  revisionId: string
): Ambiguity[] {
  const ambiguities: Ambiguity[] = [];
  let counter = 1;

  const fullTextLower = clauses.map((c) => c.text.toLowerCase()).join(" ");
  const isCollaborative =
    fullTextLower.includes("team") ||
    fullTextLower.includes("group") ||
    fullTextLower.includes("partner") ||
    fullTextLower.includes("collaborat");

  for (const candidate of candidates) {
    const textLower = candidate.actionText.toLowerCase();

    // 1. Missing Deliverable Format
    if (
      (candidate.imperativeVerb === "submit" ||
        candidate.imperativeVerb === "upload" ||
        candidate.imperativeVerb === "send" ||
        candidate.imperativeVerb === "deliver" ||
        candidate.imperativeVerb === "share" ||
        candidate.imperativeVerb === "provide") &&
      !candidate.deliverable
    ) {
      ambiguities.push({
        id: `amb_${revisionId}_${counter++}`,
        kind: "FORMAT",
        question: `The brief requests submission ('${candidate.normalizedTitle}'), but does not specify the required deliverable format (e.g., PDF, ZIP archive, or GitHub link). What format should be prepared?`,
        sourceClauseIds: [candidate.clauseId],
        status: "OPEN",
      });
    }

    // 2. Ambiguous Deadline (Day specified, but no exact time or time zone)
    if (candidate.dueText) {
      const hasTime = /\b(?:\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)|midnight|noon|end\s+of\s+day)\b/i.test(
        candidate.dueText
      );
      const hasTimeZone = /\b(?:EST|EDT|PST|PDT|CST|CDT|IST|GMT|UTC)\b/i.test(candidate.actionText);

      if (!hasTime) {
        ambiguities.push({
          id: `amb_${revisionId}_${counter++}`,
          kind: "DEADLINE",
          question: `The deadline for '${candidate.normalizedTitle}' mentions '${candidate.dueText}', but omits an exact cutoff time. Should 11:59 PM or close of business be assumed?`,
          sourceClauseIds: [candidate.clauseId],
          status: "OPEN",
        });
      } else if (!hasTimeZone) {
        ambiguities.push({
          id: `amb_${revisionId}_${counter++}`,
          kind: "DEADLINE",
          question: `The deadline time '${candidate.dueText}' does not specify a time zone. Which local time zone applies?`,
          sourceClauseIds: [candidate.clauseId],
          status: "OPEN",
        });
      }
    }

    // 3. Unassigned Collaborative Owner
    if (isCollaborative && !candidate.owner && candidate.isImperative) {
      // Exclude simple personal prep verbs
      if (candidate.imperativeVerb !== "read" && candidate.imperativeVerb !== "download") {
        ambiguities.push({
          id: `amb_${revisionId}_${counter++}`,
          kind: "OWNER",
          question: `This task ('${candidate.normalizedTitle}') is part of a collaborative brief but does not designate an owner. Who will complete this deliverable?`,
          sourceClauseIds: [candidate.clauseId],
          status: "OPEN",
        });
      }
    }

    // 4. Vague Scope / Quantity
    if (
      /\b(?:several|some|a\s+few|as\s+many\s+as\s+possible|thorough|detailed|appropriate|adequate|sufficient|reasonable|as\s+needed)\b/i.test(
        textLower
      )
    ) {
      ambiguities.push({
        id: `amb_${revisionId}_${counter++}`,
        kind: "SCOPE",
        question: `The clause for '${candidate.normalizedTitle}' contains subjective scope terms ('detailed', 'thorough', 'several'). What is the exact expected length or quantity?`,
        sourceClauseIds: [candidate.clauseId],
        status: "OPEN",
      });
    }

    // 5. Alternative Choices ("Either A or B")
    if (
      textLower.includes("either") ||
      textLower.includes("or choose") ||
      textLower.includes("optionally") ||
      textLower.includes("optional") ||
      textLower.includes("if preferred")
    ) {
      ambiguities.push({
        id: `amb_${revisionId}_${counter++}`,
        kind: "OTHER",
        question: `The brief offers alternative options ('${candidate.normalizedTitle}'). Which specific pathway should be executed?`,
        sourceClauseIds: [candidate.clauseId],
        status: "OPEN",
      });
    }
  }

  // De-duplicate ambiguities with identical questions
  const uniqueAmbiguities: Ambiguity[] = [];
  const seenQuestions = new Set<string>();

  for (const amb of ambiguities) {
    if (!seenQuestions.has(amb.question)) {
      seenQuestions.add(amb.question);
      uniqueAmbiguities.push(amb);
    }
  }

  return uniqueAmbiguities;
}
