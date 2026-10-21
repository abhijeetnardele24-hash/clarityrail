import { describe, it, expect } from "vitest";
import { segmentSourceText } from "../../src/domain/compiler/segmenter";

describe("SourceClause Segmenter", () => {
  it("handles empty or whitespace-only text gracefully", () => {
    expect(segmentSourceText("", "rev_1")).toEqual([]);
    expect(segmentSourceText("   \n\n  ", "rev_1")).toEqual([]);
  });

  it("segments numbered list items and preserves exact offsets", () => {
    const raw = `1. Download the starter repository.\n2. Review the specification.\n3. Submit your final code.`;
    const clauses = segmentSourceText(raw, "rev_test");

    expect(clauses.length).toBe(3);
    expect(clauses[0]!.ordinal).toBe(1);
    expect(clauses[0]!.text).toBe("Download the starter repository.");
    expect(clauses[1]!.ordinal).toBe(2);
    expect(clauses[1]!.text).toBe("Review the specification.");
    expect(clauses[2]!.ordinal).toBe(3);
    expect(clauses[2]!.text).toBe("Submit your final code.");

    // Verify round-trip offset integrity
    for (const c of clauses) {
      const slice = raw.substring(c.startOffset, c.endOffset);
      expect(slice).toBe(c.text);
    }
  });

  it("segments sentences separated by periods and semicolons", () => {
    const raw = "Read the documentation; configure the database. Run the integration test suite.";
    const clauses = segmentSourceText(raw, "rev_1");

    expect(clauses.length).toBe(3);
    expect(clauses[0]!.text).toBe("Read the documentation;");
    expect(clauses[1]!.text).toBe("configure the database.");
    expect(clauses[2]!.text).toBe("Run the integration test suite.");

    for (const c of clauses) {
      expect(raw.substring(c.startOffset, c.endOffset)).toBe(c.text);
    }
  });

  it("handles bulleted lists with hyphens, asterisks, and bullets", () => {
    const raw = `- First step in bullet\n* Second step with star\n• Third step with bullet`;
    const clauses = segmentSourceText(raw, "rev_bullets");

    expect(clauses.length).toBe(3);
    expect(clauses[0]!.text).toBe("First step in bullet");
    expect(clauses[1]!.text).toBe("Second step with star");
    expect(clauses[2]!.text).toBe("Third step with bullet");

    for (const c of clauses) {
      expect(raw.substring(c.startOffset, c.endOffset)).toBe(c.text);
    }
  });
});
