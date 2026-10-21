import { SourceClause } from "../types";

export interface ActionCandidate {
  clauseId: string;
  actionText: string;
  normalizedTitle: string;
  imperativeVerb: string;
  isImperative: boolean;
  deliverable?: string;
  owner?: string;
  dueText?: string;
  effortMin: number;
  effortMax: number;
}

export const COMMON_ACTION_VERBS = [
  "download",
  "read",
  "review",
  "write",
  "draft",
  "submit",
  "upload",
  "create",
  "test",
  "analyze",
  "configure",
  "implement",
  "interview",
  "format",
  "cite",
  "verify",
  "check",
  "attend",
  "collect",
  "complete",
  "schedule",
  "contact",
  "email",
  "prepare",
  "outline",
  "revise",
  "export",
  "commit",
  "push",
  "design",
  "record",
  "document",
  "calculate",
  "evaluate",
  "clone",
  "install",
  "setup",
  "conduct",
  "present",
  "register",
  "attach",
  "build",
  "organize",
  "update",
  "validate",
  "summarize",
  "generate",
  "record",
  "setup",
  "set up",
  "install",
  "clean",
  "calculate",
  "summarize",
];

export function extractActionCandidates(clauses: SourceClause[]): ActionCandidate[] {
  const candidates: ActionCandidate[] = [];

  for (const clause of clauses) {
    const text = clause.text.trim();
    if (!text) continue;

    const lower = text.toLowerCase();

    // Check for modal obligation phrases: "you must", "please", "students must", "need to", "required to", "Name will", "is responsible for"
    const modalMatch = lower.match(
      /(?:you\s+(?:must|should|need\s+to|have\s+to)|please|students?\s+(?:must|are\s+required\s+to|should)|team\s+(?:will|must)|be\s+sure\s+to|remember\s+to|(?:is|are)\s+responsible\s+for|[a-z]+\s+will)\s+([a-z]+)/i
    );

    // Or check if the sentence begins with an imperative verb
    const firstWordMatch = text.match(/^([A-Za-z]+)\b/);
    const firstWordLower = firstWordMatch ? firstWordMatch[1]?.toLowerCase() : "";

    let matchedVerb = "";
    let isImperative = false;

    if (modalMatch && modalMatch[1]) {
      let verb = modalMatch[1].toLowerCase();
      if (verb.endsWith("ing") && verb.length > 4) {
        const stem = verb.slice(0, -3);
        if (COMMON_ACTION_VERBS.includes(stem)) {
          verb = stem;
        } else if (COMMON_ACTION_VERBS.includes(stem + "e")) {
          verb = stem + "e";
        }
      }
      if (COMMON_ACTION_VERBS.includes(verb) || isProbableActionVerb(verb)) {
        matchedVerb = verb;
        isImperative = true;
      }
    }

    if (!matchedVerb && firstWordLower) {
      if (COMMON_ACTION_VERBS.includes(firstWordLower) || isProbableActionVerb(firstWordLower)) {
        matchedVerb = firstWordLower;
        isImperative = true;
      }
    }

    // Secondary scan: check if any action verb appears in a command position
    if (!matchedVerb) {
      for (const verb of COMMON_ACTION_VERBS) {
        const regex = new RegExp(`\\b(?:to\\s+)?(${verb})\\s+([a-z0-9\\s]{3,30})`, "i");
        if (regex.test(text)) {
          matchedVerb = verb;
          break;
        }
      }
    }

    if (matchedVerb) {
      const deliverable = extractDeliverable(text);
      const owner = extractOwner(text);
      const dueText = extractDueText(text);
      const { min, max } = estimateEffort(matchedVerb, text);

      // Clean up title: capitalize and make concise
      const cleanTitle = formatActionTitle(matchedVerb, text);

      candidates.push({
        clauseId: clause.id,
        actionText: text,
        normalizedTitle: cleanTitle,
        imperativeVerb: matchedVerb,
        isImperative,
        deliverable,
        owner,
        dueText,
        effortMin: min,
        effortMax: max,
      });
    }
  }

  return candidates;
}

function isProbableActionVerb(word: string): boolean {
  // Common english verb endings or imperative forms
  return /^(run|build|start|stop|fix|find|send|get|make|choose|select)$/i.test(word);
}

export function extractDeliverable(text: string): string | undefined {
  const formats = [
    /\b(PDF(?:\s+document)?)\b/i,
    /\b(ZIP(?:\s+archive)?)\b/i,
    /\b(slide\s+deck|presentation|slides)\b/i,
    /\b(\d+[- ]page\s+(?:[a-z0-9-]+\s+){0,3}(?:report|essay|paper))\b/i,
    /\b(GitHub\s+(?:repository|link|repo))\b/i,
    /\b(source\s+(?:code|archive))\b/i,
    /\b(executive\s+summary)\b/i,
    /\b(rubric)\b/i,
    /\b(spreadsheet|Excel\s+sheet|CSV)\b/i,
  ];

  for (const fmt of formats) {
    const match = text.match(fmt);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

export function extractOwner(text: string): string | undefined {
  // Check for assigned roles or names: "assigned to X", "owner: X", "X is responsible for", "X will handle"
  const leadMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:is\s+responsible\s+for|will\s+take\s+the\s+lead\s+on|will\s+handle|will\s+own)\b/);
  if (leadMatch && leadMatch[1]) {
    return leadMatch[1].trim();
  }

  const ownerMatch = text.match(/(?:assigned\s+to|owner:?|responsible:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (ownerMatch && ownerMatch[1]) {
    return ownerMatch[1].trim();
  }
  return undefined;
}

export function extractDueText(text: string): string | undefined {
  const datePatterns = [
    /\b((?:by|due|before|no\s+later\s+than)\s+(?:next\s+)?[A-Za-z]+day(?:\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)(?:\s+[A-Z]{3,4})?)?)/i,
    /\b((?:by|due|before|no\s+later\s+than)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)(?:\s+[A-Z]{3,4})?)/i,
    /\b((?:by|due|before|no\s+later\s+than)\s+[A-Z][a-z]+\s+\d{1,2}(?:th|st|rd|nd)?(?:\s+at\s+[\d:]+\s*(?:am|pm|AM|PM)?)?)/i,
    /\b((?:by|due|before|no\s+later\s+than)\s+(?:end\s+of\s+day|midnight|noon|close\s+of\s+business|tomorrow|tonight|next\s+week))\b/i,
    /\b(?:end\s+of\s+day|midnight|noon|close\s+of\s+business)\b/i,
  ];

  for (const pat of datePatterns) {
    const match = text.match(pat);
    if (match && match[0]) {
      return match[0].trim();
    }
  }
  return undefined;
}

function estimateEffort(verb: string, text: string): { min: number; max: number } {
  const v = verb.toLowerCase();
  const lower = text.toLowerCase();

  if (v === "download" || v === "upload" || v === "submit" || v === "check" || v === "verify") {
    return { min: 5, max: 15 };
  }
  if (v === "read" || v === "review" || v === "outline") {
    return { min: 15, max: 35 };
  }
  if (v === "test" || v === "configure" || v === "format" || v === "cite") {
    return { min: 20, max: 45 };
  }
  if (v === "write" || v === "draft" || v === "analyze" || v === "implement" || v === "create") {
    if (lower.includes("page") || lower.includes("report") || lower.includes("presentation")) {
      return { min: 45, max: 90 };
    }
    return { min: 30, max: 60 };
  }

  return { min: 15, max: 30 };
}

function formatActionTitle(verb: string, text: string): string {
  // If text is short (< 60 chars), clean up punctuation and return
  const clean = text.replace(/[.;:!?]+$/, "").trim();
  if (clean.length <= 65) {
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  // Otherwise, extract the verb phrase + object (up to 50 chars)
  const capitalizedVerb = verb.charAt(0).toUpperCase() + verb.slice(1);
  const afterVerb = clean.substring(clean.toLowerCase().indexOf(verb.toLowerCase()) + verb.length).trim();
  const conciseObject = afterVerb.split(/[,;]/)[0] ?? afterVerb;

  if (conciseObject.length > 5 && conciseObject.length < 50) {
    return `${capitalizedVerb} ${conciseObject}`;
  }

  // Fallback to truncated text with ellipsis
  return clean.substring(0, 57).trim() + "...";
}
