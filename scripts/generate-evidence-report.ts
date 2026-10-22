import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";

type JsonRecord = Record<string, unknown>;

export interface VerificationEvidence {
  generatedAt: string;
  status: "VERIFIED";
  source: { commitSha: string; workingTreeClean: boolean };
  unitTesting: {
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    coverage: Record<"statements" | "lines" | "functions" | "branches", number>;
  };
  e2eTesting: {
    logicalScenarios: number;
    totalExecutions: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    durationMs: number;
    browserEngine: "Chromium";
    viewportProfiles: string[];
  };
  accessibility: {
    scanner: "@axe-core/playwright";
    scannedStates: string[];
    totalScans: number;
    criticalOrSeriousViolations: number;
    scope: string;
  };
  build: { indexPresent: true };
  benchmark: JsonRecord;
}

function readJson(filePath: string): JsonRecord {
  if (!fs.existsSync(filePath)) throw new Error(`Required evidence artifact is missing: ${filePath}`);
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as JsonRecord;
  } catch (error) {
    throw new Error(`Malformed JSON evidence artifact ${filePath}: ${String(error)}`);
  }
}

function finiteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Invalid numeric evidence: ${label}`);
  return value;
}

function requireFresh(filePath: string, runStartedAtMs: number): void {
  if (fs.statSync(filePath).mtimeMs + 1_000 < runStartedAtMs) {
    throw new Error(`Stale evidence artifact predates this verification run: ${filePath}`);
  }
}

function parseVitest(raw: JsonRecord) {
  const total = finiteNumber(raw.numTotalTests, "Vitest total tests");
  const passed = finiteNumber(raw.numPassedTests, "Vitest passed tests");
  const failed = finiteNumber(raw.numFailedTests ?? 0, "Vitest failed tests");
  const skipped = finiteNumber(raw.numPendingTests ?? 0, "Vitest skipped tests");
  if (raw.success !== true || total <= 0 || passed !== total || failed !== 0 || skipped !== 0) {
    throw new Error(`Vitest evidence is not fully passing: total=${total}, passed=${passed}, failed=${failed}, skipped=${skipped}`);
  }
  return { total, passed, failed, skipped };
}

function parseCoverage(raw: JsonRecord) {
  const total = raw.total as JsonRecord | undefined;
  if (!total) throw new Error("Coverage summary has no total record");
  const percentage = (name: string) => finiteNumber((total[name] as JsonRecord | undefined)?.pct, `coverage.${name}.pct`);
  const coverage = {
    statements: percentage("statements"),
    lines: percentage("lines"),
    functions: percentage("functions"),
    branches: percentage("branches"),
  };
  if (coverage.statements < 85 || coverage.lines < 85 || coverage.functions < 85 || coverage.branches < 80) {
    throw new Error(`Coverage thresholds not met: ${JSON.stringify(coverage)}`);
  }
  return coverage;
}

function parsePlaywright(raw: JsonRecord) {
  const stats = raw.stats as JsonRecord | undefined;
  if (!stats) throw new Error("Playwright report has no stats block");
  const passed = finiteNumber(stats.expected, "Playwright passed");
  const failed = finiteNumber(stats.unexpected, "Playwright failed");
  const skipped = finiteNumber(stats.skipped, "Playwright skipped");
  const flaky = finiteNumber(stats.flaky, "Playwright flaky");
  const total = passed + failed + skipped + flaky;
  const durationMs = finiteNumber(stats.duration, "Playwright duration");
  if (total <= 0 || failed !== 0 || skipped !== 0 || flaky !== 0 || passed !== total) {
    throw new Error(`Playwright evidence is not fully passing: total=${total}, passed=${passed}, failed=${failed}, skipped=${skipped}, flaky=${flaky}`);
  }
  const scenarioTitles = new Set<string>();
  const projects = new Set<string>();
  const visit = (suites: unknown[]) => {
    for (const suiteValue of suites) {
      const suite = suiteValue as JsonRecord;
      for (const specValue of (suite.specs as unknown[] | undefined) ?? []) {
        const spec = specValue as JsonRecord;
        scenarioTitles.add(String(spec.title));
        for (const testValue of (spec.tests as unknown[] | undefined) ?? []) {
          projects.add(String((testValue as JsonRecord).projectName));
        }
      }
      visit((suite.suites as unknown[] | undefined) ?? []);
    }
  };
  visit((raw.suites as unknown[] | undefined) ?? []);
  if (scenarioTitles.size === 0 || projects.size === 0) throw new Error("Playwright report contains no scenario/project metadata");
  return { logicalScenarios: scenarioTitles.size, total, passed, failed, skipped, flaky, durationMs, projects: [...projects].sort() };
}

function parseAxe(raw: JsonRecord) {
  const scans = raw.scans as unknown[] | undefined;
  if (!Array.isArray(scans) || scans.length === 0) throw new Error("Axe evidence contains no scans");
  const states = new Set<string>();
  let violations = 0;
  for (const scanValue of scans) {
    const scan = scanValue as JsonRecord;
    states.add(String(scan.state));
    violations += finiteNumber(scan.criticalOrSeriousViolations, `Axe violations for ${String(scan.state)}`);
  }
  if (violations !== 0) throw new Error(`Axe detected ${violations} critical/serious violations`);
  return { states: [...states].sort(), scans: scans.length, violations };
}

function git(args: string[], cwd: string): string {
  return execFileSync("git", args, { cwd, encoding: "utf-8" }).trim();
}

export function generateEvidenceReport(root = process.cwd()): VerificationEvidence {
  console.log("=== Generating Fail-Closed Verification Evidence ===");
  const artifactPaths = {
    runStart: path.resolve(root, "reports/verification-run-start.json"),
    vitest: path.resolve(root, "reports/vitest-results.json"),
    coverage: path.resolve(root, "coverage/coverage-summary.json"),
    benchmark: path.resolve(root, "docs/benchmark-results.json"),
    playwright: path.resolve(root, "test-results/results.json"),
    axe: path.resolve(root, "reports/axe-results.json"),
    build: path.resolve(root, "dist/index.html"),
  };
  const runStart = readJson(artifactPaths.runStart);
  const runStartedAtMs = finiteNumber(runStart.startedAtMs, "verification run start");
  for (const artifact of Object.values(artifactPaths).filter((value) => value !== artifactPaths.runStart)) {
    if (!fs.existsSync(artifact)) throw new Error(`Required evidence artifact is missing: ${artifact}`);
    requireFresh(artifact, runStartedAtMs);
  }

  const unit = parseVitest(readJson(artifactPaths.vitest));
  const coverage = parseCoverage(readJson(artifactPaths.coverage));
  const benchmark = readJson(artifactPaths.benchmark);
  const playwright = parsePlaywright(readJson(artifactPaths.playwright));
  const axe = parseAxe(readJson(artifactPaths.axe));

  const results: VerificationEvidence = {
    generatedAt: new Date().toISOString(),
    status: "VERIFIED",
    source: {
      commitSha: process.env.GITHUB_SHA ?? git(["rev-parse", "HEAD"], root),
      workingTreeClean: git(["status", "--porcelain"], root).length === 0,
    },
    unitTesting: { totalTests: unit.total, passed: unit.passed, failed: unit.failed, skipped: unit.skipped, coverage },
    e2eTesting: {
      logicalScenarios: playwright.logicalScenarios,
      totalExecutions: playwright.total,
      passed: playwright.passed,
      failed: playwright.failed,
      skipped: playwright.skipped,
      flaky: playwright.flaky,
      durationMs: playwright.durationMs,
      browserEngine: "Chromium",
      viewportProfiles: playwright.projects,
    },
    accessibility: {
      scanner: "@axe-core/playwright",
      scannedStates: axe.states,
      totalScans: axe.scans,
      criticalOrSeriousViolations: axe.violations,
      scope: "Automated Axe scans of the explicitly listed states; not a full WCAG conformance certification.",
    },
    build: { indexPresent: true },
    benchmark,
  };
  const outPath = path.resolve(root, "docs/verification-results.json");
  fs.writeFileSync(outPath, `${JSON.stringify(results, null, 2)}\n`, "utf-8");
  console.log(`Verified ${unit.passed}/${unit.total} unit tests and ${playwright.passed}/${playwright.total} browser executions.`);
  console.log(`Saved authoritative verification evidence to ${outPath}`);
  return results;
}

if (process.argv[1]?.endsWith("generate-evidence-report.ts")) generateEvidenceReport();
