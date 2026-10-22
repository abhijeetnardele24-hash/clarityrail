import { afterEach, describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import { generateEvidenceReport } from "../../scripts/generate-evidence-report";

const tempRoots: string[] = [];

function writeJson(root: string, relative: string, value: unknown): void {
  const target = path.resolve(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(value), "utf-8");
}

function createFixture(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "clarityrail-evidence-"));
  tempRoots.push(root);
  execFileSync("git", ["init"], { cwd: root });
  execFileSync("git", ["config", "user.email", "tests@example.invalid"], { cwd: root });
  execFileSync("git", ["config", "user.name", "ClarityRail Tests"], { cwd: root });
  fs.writeFileSync(path.join(root, "seed.txt"), "seed", "utf-8");
  execFileSync("git", ["add", "seed.txt"], { cwd: root });
  execFileSync("git", ["commit", "-m", "test seed"], { cwd: root });
  writeJson(root, "reports/verification-run-start.json", { startedAtMs: Date.now() - 2_000 });
  writeJson(root, "reports/vitest-results.json", {
    success: true, numTotalTests: 74, numPassedTests: 74, numFailedTests: 0, numPendingTests: 0,
  });
  writeJson(root, "coverage/coverage-summary.json", {
    total: {
      statements: { pct: 92 }, lines: { pct: 92 }, functions: { pct: 88 }, branches: { pct: 82 },
    },
  });
  writeJson(root, "docs/benchmark-results.json", { thresholdsMet: { repeatability100: true } });
  writeJson(root, "test-results/results.json", {
    stats: { expected: 2, unexpected: 0, skipped: 0, flaky: 0, duration: 1234 },
    suites: [{ specs: [{ title: "journey", tests: [{ projectName: "Laptop" }, { projectName: "Mobile" }] }] }],
  });
  writeJson(root, "reports/axe-results.json", {
    scans: [{ state: "landing", criticalOrSeriousViolations: 0 }],
  });
  fs.mkdirSync(path.join(root, "dist"), { recursive: true });
  fs.writeFileSync(path.join(root, "dist/index.html"), "<!doctype html>", "utf-8");
  return root;
}

afterEach(() => {
  for (const root of tempRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe("fail-closed verification evidence", () => {
  it("parses truthful unit, browser, accessibility, coverage and build evidence", () => {
    const root = createFixture();
    const result = generateEvidenceReport(root);
    expect(result.unitTesting).toMatchObject({ totalTests: 74, passed: 74, failed: 0, skipped: 0 });
    expect(result.e2eTesting).toMatchObject({ logicalScenarios: 1, totalExecutions: 2, passed: 2 });
    expect(result.accessibility).toMatchObject({ totalScans: 1, criticalOrSeriousViolations: 0 });
  });

  it("rejects zero-test or skipped Vitest evidence", () => {
    const root = createFixture();
    writeJson(root, "reports/vitest-results.json", {
      success: true, numTotalTests: 0, numPassedTests: 0, numFailedTests: 0, numPendingTests: 1,
    });
    expect(() => generateEvidenceReport(root)).toThrow(/Vitest evidence is not fully passing/);
  });

  it("rejects failed, skipped or flaky Playwright evidence", () => {
    const root = createFixture();
    writeJson(root, "test-results/results.json", {
      stats: { expected: 1, unexpected: 1, skipped: 1, flaky: 1, duration: 1234 },
      suites: [{ specs: [{ title: "journey", tests: [{ projectName: "Laptop" }] }] }],
    });
    expect(() => generateEvidenceReport(root)).toThrow(/Playwright evidence is not fully passing/);
  });

  it("rejects missing or serious Axe evidence", () => {
    const root = createFixture();
    writeJson(root, "reports/axe-results.json", {
      scans: [{ state: "landing", criticalOrSeriousViolations: 1 }],
    });
    expect(() => generateEvidenceReport(root)).toThrow(/Axe detected/);
    fs.rmSync(path.join(root, "reports/axe-results.json"));
    expect(() => generateEvidenceReport(root)).toThrow(/missing/);
  });
});
