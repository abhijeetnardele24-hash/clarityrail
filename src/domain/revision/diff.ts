import { ClauseDiff, SourceClause } from "../types";

/**
 * Computes a clause-level diff between two sets of source clauses.
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
