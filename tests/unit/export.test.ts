import { describe, it, expect } from "vitest";
import { compileBrief } from "../../src/domain/compiler/compiler";
import {
  generateMarkdownHandoff,
  generatePlainTextHandoff,
  serializeSessionToJson,
  parseAndValidateSessionJson,
} from "../../src/adapters/export";
import { SYNTHETIC_FIXTURES } from "../../src/domain/fixtures";

describe("Export & Schema Validation", () => {
  it("generates markdown handoff containing immediate action, completed work, and source clauses", () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const session = compileBrief(fixture.initialBriefText, { title: fixture.title });

    const md = generateMarkdownHandoff(session);
    expect(md).toContain("# ClarityRail Progress & Handoff Capsule");
    expect(md).toContain("## 1. Immediate Next Action");
    expect(md).toContain("## 6. Source Clause References");
    expect(md).toContain("100% locally in browser memory");
  });

  it("generates clean plain text handoff", () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const session = compileBrief(fixture.initialBriefText, { title: fixture.title });

    const txt = generatePlainTextHandoff(session);
    expect(txt).toContain("CLARITYRAIL EXECUTION CAPSULE");
    expect(txt).toContain("CURRENT ACTION");
  });

  it("validates round-trip JSON serialization with Zod schema", () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const session = compileBrief(fixture.initialBriefText, { title: fixture.title });

    const json = serializeSessionToJson(session);
    expect(json).toBeDefined();

    const parsed = parseAndValidateSessionJson(json);
    expect(parsed.id).toBe(session.id);
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.steps.length).toBe(session.steps.length);
  });
});
