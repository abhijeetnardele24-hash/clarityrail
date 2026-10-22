import * as fs from "node:fs";
import * as path from "node:path";

const root = process.cwd();
const reportsDir = path.resolve(root, "reports");
const testResultsDir = path.resolve(root, "test-results");
fs.mkdirSync(reportsDir, { recursive: true });
fs.mkdirSync(testResultsDir, { recursive: true });
for (const file of [
  path.resolve(reportsDir, "vitest-results.json"),
  path.resolve(reportsDir, "axe-results.json"),
  path.resolve(testResultsDir, "results.json"),
  path.resolve(root, "docs/verification-results.json"),
]) {
  if (fs.existsSync(file)) fs.rmSync(file, { force: true });
}
fs.writeFileSync(path.resolve(reportsDir, "verification-run-start.json"), `${JSON.stringify({ startedAt: new Date().toISOString(), startedAtMs: Date.now() }, null, 2)}\n`, "utf-8");
console.log("Started clean verification run; stale result artifacts removed.");
