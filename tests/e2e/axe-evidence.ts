import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

interface AxeScanEvidence {
  state: string;
  project: string;
  url: string;
  criticalOrSeriousViolations: number;
  violationIds: string[];
}

export async function assertAndRecordAxe(page: Page, testInfo: TestInfo, state: string): Promise<void> {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const violations = result.violations.filter((item) => item.impact === "critical" || item.impact === "serious");
  const evidence: AxeScanEvidence = {
    state,
    project: testInfo.project.name,
    url: page.url(),
    criticalOrSeriousViolations: violations.length,
    violationIds: violations.map((item) => item.id),
  };
  const reportPath = path.resolve(process.cwd(), "reports/axe-results.json");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  const report = fs.existsSync(reportPath)
    ? JSON.parse(fs.readFileSync(reportPath, "utf-8")) as { scans: AxeScanEvidence[] }
    : { scans: [] as AxeScanEvidence[] };
  report.scans.push(evidence);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf-8");
  expect(violations, `Serious Axe violations in ${state}: ${violations.map((item) => item.id).join(", ")}`).toEqual([]);
}
