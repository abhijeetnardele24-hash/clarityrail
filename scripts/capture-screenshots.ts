import { chromium } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const output = path.resolve("docs/assets/screenshots");
fs.mkdirSync(output, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const base = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:4173/clarityrail/";

await page.goto(base, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(output, "01-capture-workspace.png"), fullPage: true });

await page.getByTestId("load-fixture-fixture_academic_cs401").click();
await page.getByTestId("focus-step-title").waitFor();
await page.getByRole("button", { name: /Why this step/i }).click();
await page.screenshot({ path: path.join(output, "02-focus-rail.png"), fullPage: true });

await page.getByRole("button", { name: /View Full Plan & Export Handoff/i }).click();
await page.getByRole("heading", { name: /Plan & Lineage Review/i }).waitFor();
await page.screenshot({ path: path.join(output, "03-review-lineage.png"), fullPage: true });

await page.goto(`${base}#/settings`, { waitUntil: "networkidle" });
await page.getByRole("heading", { name: /Display & Accessibility Preferences/i }).waitFor();
await page.screenshot({ path: path.join(output, "04-accessibility-settings.png"), fullPage: true });

await browser.close();
console.log(`Captured four real application screenshots in ${output}`);
