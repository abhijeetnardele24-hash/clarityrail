import * as fs from "node:fs";
import * as path from "node:path";

export default function globalSetup(): void {
  const reportPath = path.resolve(process.cwd(), "reports/axe-results.json");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify({ scans: [] }, null, 2)}\n`, "utf-8");
}
