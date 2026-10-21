import { describe, it, expect } from "vitest";
import {
  extractActionCandidates,
  extractDeliverable,
  extractOwner,
  extractDueText,
} from "../../src/domain/compiler/extractor";
import { SourceClause } from "../../src/domain/types";

describe("Action Candidate Extractor", () => {
  it("identifies imperative verbs at the start of sentences", () => {
    const clauses: SourceClause[] = [
      { id: "c1", revisionId: "r1", ordinal: 1, text: "Download the starter files from the portal.", startOffset: 0, endOffset: 45 },
      { id: "c2", revisionId: "r1", ordinal: 2, text: "Draft a 4-page experimental evaluation report.", startOffset: 46, endOffset: 92 },
      { id: "c3", revisionId: "r1", ordinal: 3, text: "This assignment is worth 20 percent of your final grade.", startOffset: 93, endOffset: 150 },
    ];

    const candidates = extractActionCandidates(clauses);
    expect(candidates.length).toBe(2);
    expect(candidates[0]!.imperativeVerb).toBe("download");
    expect(candidates[0]!.isImperative).toBe(true);
    expect(candidates[1]!.imperativeVerb).toBe("draft");
    expect(candidates[1]!.deliverable).toBe("4-page experimental evaluation report");
  });

  it("extracts assigned owners and target deadlines", () => {
    const text = "Sarah is responsible for writing the variant annotation scripts before Friday at 5:00 PM EST.";
    expect(extractOwner("assigned to Alex Chen")).toBe("Alex Chen");
    expect(extractOwner("responsible: Marcus Vance")).toBe("Marcus Vance");
    expect(extractDueText(text)).toBe("before Friday at 5:00 PM EST");
  });

  it("extracts deliverable formats", () => {
    expect(extractDeliverable("Please submit a PDF document.")).toBe("PDF document");
    expect(extractDeliverable("Package the project into a ZIP archive.")).toBe("ZIP archive");
    expect(extractDeliverable("Provide your GitHub repository link.")).toBe("GitHub repository");
    expect(extractDeliverable("Prepare a 5-page report.")).toBe("5-page report");
  });

  it("estimates reasonable effort ranges based on verb type", () => {
    const clauses: SourceClause[] = [
      { id: "c1", revisionId: "r1", ordinal: 1, text: "Download the dataset.", startOffset: 0, endOffset: 21 },
      { id: "c2", revisionId: "r1", ordinal: 2, text: "Write the 10-page thesis paper.", startOffset: 22, endOffset: 53 },
    ];

    const candidates = extractActionCandidates(clauses);
    expect(candidates[0]!.effortMin).toBe(5);
    expect(candidates[0]!.effortMax).toBe(15);
    expect(candidates[1]!.effortMin).toBe(45);
    expect(candidates[1]!.effortMax).toBe(90);
  });
});
