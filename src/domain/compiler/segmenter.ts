import { SourceClause } from "../types";

/**
 * Pure sentence and clause segmenter.
 * Guarantees exact character offsets such that:
 * rawText.substring(clause.startOffset, clause.endOffset) === clause.text
 */
export function segmentSourceText(rawText: string, revisionId: string): SourceClause[] {
  if (!rawText || rawText.trim().length === 0) {
    return [];
  }

  const clauses: SourceClause[] = [];
  let ordinal = 1;

  // Split lines first to preserve list structures, bullet points, and headers
  const lineRegex = /([^\r\n]+)(?:\r?\n|$)/g;
  let lineMatch: RegExpExecArray | null;

  while ((lineMatch = lineRegex.exec(rawText)) !== null) {
    const lineText = lineMatch[1] ?? "";
    const lineStart = lineMatch.index;

    if (lineText.trim().length === 0) {
      continue;
    }

    // Check if line is a bullet or numbered list item
    const bulletMatch = lineText.match(/^(\s*(?:[-*•]|\d+[.)])\s+)(.*)$/);
    if (bulletMatch) {
      const prefix = bulletMatch[1] ?? "";
      const body = bulletMatch[2] ?? "";
      const bodyStart = lineStart + prefix.length;
      const bodyEnd = lineStart + lineText.length;

      if (body.trim().length > 0) {
        // Also split by semicolons inside list items if present
        splitIntoSentencesOrSemicolons(rawText, body, bodyStart, bodyEnd, revisionId, ordinal, clauses);
        ordinal = clauses.length + 1;
      }
      continue;
    }

    // Normal paragraph line: split into sentences or semicolons
    splitIntoSentencesOrSemicolons(rawText, lineText, lineStart, lineStart + lineText.length, revisionId, ordinal, clauses);
    ordinal = clauses.length + 1;
  }

  return clauses;
}

function splitIntoSentencesOrSemicolons(
  fullText: string,
  segment: string,
  baseOffset: number,
  _endOffset: number,
  revisionId: string,
  startOrdinal: number,
  outClauses: SourceClause[]
) {
  // Regex to match sentence endings or semicolons:
  // - Semicolon ';'
  // - Period/exclamation/question mark followed by whitespace or end of string
  const splitPattern = /([^;!?.]+[;!?.]?(?:\s+|$))/g;
  let match: RegExpExecArray | null;
  let currentOrdinal = startOrdinal;

  while ((match = splitPattern.exec(segment)) !== null) {
    const rawMatchText = match[1] ?? "";
    const trimmed = rawMatchText.trim();
    if (trimmed.length === 0) continue;

    // Find exact start and end in segment
    const startInSegment = match.index + (rawMatchText.indexOf(trimmed));
    const endInSegment = startInSegment + trimmed.length;

    const clauseStart = baseOffset + startInSegment;
    const clauseEnd = baseOffset + endInSegment;
    const exactText = fullText.substring(clauseStart, clauseEnd);

    outClauses.push({
      id: `clause_${revisionId}_${currentOrdinal}`,
      revisionId,
      ordinal: currentOrdinal,
      text: exactText,
      startOffset: clauseStart,
      endOffset: clauseEnd,
    });
    currentOrdinal++;
  }
}
