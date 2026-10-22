import { describe, it, expect } from "vitest";
import {
  sha256Hex,
  canonicalNormalizeSourceText,
  computeNormalizedSourceDigest,
  computeNormalizedSourceDigestAsync,
} from "../../src/domain/compiler/digest";

describe("SHA-256 Source Digest & Canonical Normalization Engine", () => {
  it("matches standard NIST SHA-256 test vectors", () => {
    // 1. Empty string
    expect(sha256Hex("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );

    // 2. "abc"
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    );

    // 3. Multi-block standard test vector
    const longInput = "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq";
    expect(sha256Hex(longInput)).toBe(
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1"
    );
  });

  it("produces identical digests for canonically equivalent text with varied CRLF/whitespace", () => {
    const text1 = "Step 1: Download files.  \r\n\r\nStep 2:   Write report. ";
    const text2 = "Step 1: Download files.\n\nStep 2: Write report.";
    const text3 = "Step 1: Download files.\r\n\r\nStep 2: Write report.\u200B";

    const d1 = computeNormalizedSourceDigest(text1);
    const d2 = computeNormalizedSourceDigest(text2);
    const d3 = computeNormalizedSourceDigest(text3);

    expect(d1).toBe(d2);
    expect(d2).toBe(d3);
    expect(d1.startsWith("sha256_")).toBe(true);
    expect(d1.length).toBe(7 + 64); // "sha256_" + 64 hex chars
  });

  it("produces distinct digests when source content is meaningfully changed", () => {
    const original = "Step 1: Download the starter code.";
    const revised = "Step 1: Download the updated starter code with Paxos.";

    const d1 = computeNormalizedSourceDigest(original);
    const d2 = computeNormalizedSourceDigest(revised);

    expect(d1).not.toBe(d2);
  });

  it("ensures synchronous and asynchronous digest implementations yield identical results", async () => {
    const input = "Please draft the lab assignment and submit before midnight.";
    const syncDigest = computeNormalizedSourceDigest(input);
    const asyncDigest = await computeNormalizedSourceDigestAsync(input);

    expect(syncDigest).toBe(asyncDigest);
  });

  it("normalizes unicode NFC and removes zero-width characters", () => {
    const withInvisible = "Project Brief\u200B with\uFEFF hidden chars";
    const cleaned = canonicalNormalizeSourceText(withInvisible);
    expect(cleaned).toBe("Project Brief with hidden chars");
  });
});
