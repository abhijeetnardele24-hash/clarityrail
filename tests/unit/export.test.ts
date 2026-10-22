import { describe, it, expect } from "vitest";
import { compileBrief } from "../../src/domain/compiler/compiler";
import {
  generateMarkdownHandoff,
  generatePlainTextHandoff,
  serializeSessionToJson,
  parseAndValidateSessionJson,
} from "../../src/adapters/export";
import { saveSession, getSession } from "../../src/adapters/persistence";
import { SYNTHETIC_FIXTURES } from "../../src/domain/fixtures";

describe("Export & Schema Validation", () => {
  it("generates markdown handoff containing immediate action, completed work, source clauses, revision provenance, and SHA-256 digests", () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const session = compileBrief(fixture.initialBriefText, { title: fixture.title });

    const md = generateMarkdownHandoff(session);
    expect(md).toContain("# ClarityRail Progress & Handoff Capsule");
    expect(md).toContain("## 1. Immediate Next Action");
    expect(md).toContain("## 6. Source Clause References");
    expect(md).toContain("## 7. Revision Provenance & Source Digests");
    expect(md).toContain("SHA-256 Digest:");
    expect(md).toContain(session.sourceRevisions[0]!.normalizedDigest);
    expect(md).toContain("100% locally in browser memory");
  });

  it("generates clean plain text handoff", () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const session = compileBrief(fixture.initialBriefText, { title: fixture.title });

    const txt = generatePlainTextHandoff(session);
    expect(txt).toContain("CLARITYRAIL EXECUTION CAPSULE");
    expect(txt).toContain("CURRENT ACTION");
  });

  it("validates loss-less round-trip JSON serialization and restoration of all core fields", async () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const session = compileBrief(fixture.initialBriefText, { title: fixture.title });

    // Ensure we have realistic test values for key fields
    session.steps[0]!.evidenceClass = "DIRECT";
    session.steps[0]!.validatedAgainstRevisionId = session.activeRevisionId;

    // 1. Serialize to JSON
    const jsonStr = serializeSessionToJson(session);
    expect(jsonStr).toBeDefined();

    // 2. Parse & validate via Zod schema
    const restored = parseAndValidateSessionJson(jsonStr);

    // Verify zero field loss on core schema
    expect(restored.id).toBe(session.id);
    expect(restored.schemaVersion).toBe(2);
    expect(restored.title).toBe(session.title);
    expect(restored.sourceText).toBe(session.sourceText);
    expect(restored.activeRevisionId).toBe(session.activeRevisionId);
    expect(restored.sourceRevisions).toEqual(session.sourceRevisions);
    expect(restored.sourceClauses).toEqual(session.sourceClauses);
    expect(restored.steps.length).toBe(session.steps.length);
    expect(restored.ambiguities).toEqual(session.ambiguities);

    // Deep check steps
    for (let i = 0; i < session.steps.length; i++) {
      const originalStep = session.steps[i]!;
      const restoredStep = restored.steps[i]!;

      expect(restoredStep.id).toBe(originalStep.id);
      expect(restoredStep.title).toBe(originalStep.title);
      expect(restoredStep.state).toBe(originalStep.state);
      expect(restoredStep.evidenceClass).toBe(originalStep.evidenceClass);
      expect(restoredStep.sourceClauseIds).toEqual(originalStep.sourceClauseIds);
      expect(restoredStep.dependsOn).toEqual(originalStep.dependsOn);
      expect(restoredStep.validatedAgainstRevisionId).toBe(originalStep.validatedAgainstRevisionId);
    }

    // 3. Test persistence layer save and load restoration
    await saveSession(restored);
    const fromStorage = await getSession(restored.id);
    expect(fromStorage).not.toBeNull();
    expect(fromStorage?.id).toBe(session.id);
    expect(fromStorage?.activeRevisionId).toBe(session.activeRevisionId);
    expect(fromStorage?.steps[0]?.validatedAgainstRevisionId).toBe(session.steps[0]?.validatedAgainstRevisionId);
  });
});
