import { ClauseDiff, SourceClause } from "../types";

/**
 * Computes a clause-level diff between two sets of source clauses.
 *
 * NOTE ON ORDINAL MATCHING BEHAVIOR & CONSERVATIVE INVALIDATION:
 * Source clauses are segmented sequentially into 1-based ordinals (1, 2, 3, ...).
 * Diff comparison evaluates clauses matching by their ordinal position:
 * - If an edit occurs in place at ordinal k, ordinal k is marked MODIFIED.
 * - If a clause is inserted at ordinal k, all subsequent clauses shift ordinals (k -> k+1, etc.),
 *   which conservatively marks shifted ordinals as MODIFIED or ADDED.
 * - If a clause is deleted at ordinal k, subsequent clauses shift down, conservatively invalidating shifted ordinals.
 *
 * This conservative invalidation is an intentional cognitive-safety design choice:
 * In academic and workplace instructions, shifting the sequence or removing a prerequisite
 * alters the contextual semantics of subsequent actions. Rather than guessing whether a shifted
 * sentence still applies unmodified, ClarityRail flags downstream steps for explicit confirmation.
 */
export function computeClauseDiff(
  oldClauses: SourceClause[],
  newClauses: SourceClause[]
): ClauseDiff[] {

  const diffs: ClauseDiff[] = [];
  const oldMap = new Map<number, SourceClause>();
  for (const c of oldClauses) {
    oldMap.set(c.ordinal, c);
  }

  const newMap = new Map<number, SourceClause>();
  for (const c of newClauses) {
    newMap.set(c.ordinal, c);
  }

  const maxOrdinal = Math.max(oldClauses.length, newClauses.length);

  for (let ord = 1; ord <= maxOrdinal; ord++) {
    const oldC = oldMap.get(ord);
    const newC = newMap.get(ord);

    if (oldC && !newC) {
      diffs.push({
        type: "REMOVED",
        oldClause: oldC,
        clauseId: oldC.id,
        text: oldC.text,
      });
    } else if (!oldC && newC) {
      diffs.push({
        type: "ADDED",
        newClause: newC,
        clauseId: newC.id,
        text: newC.text,
      });
    } else if (oldC && newC) {
      if (oldC.text.trim() === newC.text.trim()) {
        diffs.push({
          type: "UNCHANGED",
          oldClause: oldC,
          newClause: newC,
          clauseId: newC.id,
          text: newC.text,
        });
      } else {
        diffs.push({
          type: "MODIFIED",
          oldClause: oldC,
          newClause: newC,
          clauseId: newC.id,
          text: newC.text,
        });
      }
    }
  }

  return diffs;
}
