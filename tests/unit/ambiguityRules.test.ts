import { describe, it, expect } from "vitest";
import { detectAmbiguities } from "../../src/domain/compiler/ambiguityRules";
import { ActionCandidate } from "../../src/domain/compiler/extractor";
import { SourceClause } from "../../src/domain/types";

describe("Ambiguity Rules Engine", () => {
  it("flags missing deliverable format on submission tasks", () => {
    const clauses: SourceClause[] = [
      { id: "c1", revisionId: "r1", ordinal: 1, text: "Submit your final assignment.", startOffset: 0, endOffset: 30 },
    ];
    const candidates: ActionCandidate[] = [
      {
        clauseId: "c1",
        actionText: "Submit your final assignment.",
        normalizedTitle: "Submit your final assignment",
        imperativeVerb: "submit",
        isImperative: true,
        effortMin: 10,
        effortMax: 20,
      },
    ];

    const ambiguities = detectAmbiguities(clauses, candidates, "r1");
    expect(ambiguities.some((a) => a.kind === "FORMAT")).toBe(true);
  });

  it("flags deadline with day but missing time or time zone", () => {
    const clauses: SourceClause[] = [
      { id: "c1", revisionId: "r1", ordinal: 1, text: "Submit your code before Friday.", startOffset: 0, endOffset: 31 },
    ];
    const candidates: ActionCandidate[] = [
      {
        clauseId: "c1",
        actionText: "Submit your code before Friday.",
        normalizedTitle: "Submit your code before Friday",
        imperativeVerb: "submit",
        isImperative: true,
        dueText: "before Friday",
        effortMin: 10,
        effortMax: 20,
      },
    ];

    const ambiguities = detectAmbiguities(clauses, candidates, "r1");
    expect(ambiguities.some((a) => a.kind === "DEADLINE")).toBe(true);
  });

  it("flags unassigned owner in collaborative team brief", () => {
    const clauses: SourceClause[] = [
      { id: "c0", revisionId: "r1", ordinal: 1, text: "Team will build the data pipeline.", startOffset: 0, endOffset: 35 },
      { id: "c1", revisionId: "r1", ordinal: 2, text: "Implement the database schema.", startOffset: 36, endOffset: 66 },
    ];
    const candidates: ActionCandidate[] = [
      {
        clauseId: "c1",
        actionText: "Implement the database schema.",
        normalizedTitle: "Implement the database schema",
        imperativeVerb: "implement",
        isImperative: true,
        effortMin: 30,
        effortMax: 60,
      },
    ];

    const ambiguities = detectAmbiguities(clauses, candidates, "r1");
    expect(ambiguities.some((a) => a.kind === "OWNER")).toBe(true);
  });

  it("flags alternative choices ('either X or Y') as ambiguity question", () => {
    const clauses: SourceClause[] = [
      { id: "c1", revisionId: "r1", ordinal: 1, text: "Either use Python or choose Go for the backend.", startOffset: 0, endOffset: 48 },
    ];
    const candidates: ActionCandidate[] = [
      {
        clauseId: "c1",
        actionText: "Either use Python or choose Go for the backend.",
        normalizedTitle: "Choose language",
        imperativeVerb: "choose",
        isImperative: true,
        effortMin: 15,
        effortMax: 30,
      },
    ];

    const ambiguities = detectAmbiguities(clauses, candidates, "r1");
    expect(ambiguities.some((a) => a.kind === "OTHER" && a.question.includes("alternative"))).toBe(true);
  });
});
