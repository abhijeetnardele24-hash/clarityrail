import * as fs from "node:fs";
import * as path from "node:path";

export function checkEvidence(root = process.cwd()): void {
  console.log("=== Checking Authoritative Machine Evidence ===");
  const evidencePath = path.resolve(root, "docs/verification-results.json");
  if (!fs.existsSync(evidencePath)) throw new Error("verification-results.json is missing");
  const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf-8"));
  const unit = evidence.unitTesting;
  const e2e = evidence.e2eTesting;
  const accessibility = evidence.accessibility;
  if (evidence.status !== "VERIFIED") throw new Error("Evidence status is not VERIFIED");
  if (!unit || unit.totalTests <= 0 || unit.passed !== unit.totalTests || unit.failed !== 0 || unit.skipped !== 0) throw new Error("Unit-test evidence is incomplete or not fully passing");
  if (unit.coverage.statements < 85 || unit.coverage.lines < 85 || unit.coverage.functions < 85 || unit.coverage.branches < 80) throw new Error("Coverage evidence is below thresholds");
  if (!e2e || e2e.totalExecutions <= 0 || e2e.passed !== e2e.totalExecutions || e2e.failed !== 0 || e2e.skipped !== 0 || e2e.flaky !== 0) throw new Error("Browser evidence is incomplete or not fully passing");
  if (e2e.browserEngine !== "Chromium") throw new Error("Browser-engine evidence is unexpected");
  if (!accessibility || accessibility.totalScans <= 0 || accessibility.criticalOrSeriousViolations !== 0) throw new Error("Accessibility evidence is missing or contains serious violations");
  if (!evidence.build?.indexPresent) throw new Error("Production build evidence is missing");
  if (!evidence.benchmark?.thresholdsMet || Object.values(evidence.benchmark.thresholdsMet).some((value) => value !== true)) throw new Error("Benchmark thresholds are not fully met");
  console.log(`✓ ${unit.passed}/${unit.totalTests} unit tests; ${e2e.passed}/${e2e.totalExecutions} Chromium executions; ${accessibility.totalScans} Axe scans.`);
}

if (process.argv[1]?.endsWith("check-evidence.ts")) checkEvidence();
