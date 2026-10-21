import { chromium } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

export async function renderAssets() {
  console.log("=== Rendering ClarityRail Visual Assets & Screenshots ===");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const assetsDir = path.resolve(process.cwd(), "docs/assets");
  const screenshotsDir = path.resolve(assetsDir, "screenshots");
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Helper to render local SVG to PNG
  async function svgToPng(svgPath: string, pngPath: string, width: number, height: number) {
    if (!fs.existsSync(svgPath)) {
      console.warn(`SVG file not found: ${svgPath}`);
      return;
    }
    const svgContent = fs.readFileSync(svgPath, "utf-8");
    await page.setViewportSize({ width, height });
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:#F5F2EA;">${svgContent}</body></html>`);
    await page.screenshot({ path: pngPath });
    console.log(`Rendered: ${pngPath} (${width}x${height})`);
  }

  // 1. Render Architecture Diagram PNG
  await svgToPng(
    path.join(assetsDir, "architecture.svg"),
    path.join(assetsDir, "architecture.png"),
    1600,
    900
  );

  // 2. Render State Lifecycle Diagram PNG
  await svgToPng(
    path.join(assetsDir, "state-lifecycle.svg"),
    path.join(assetsDir, "state-lifecycle.png"),
    1400,
    850
  );

  // 3. Render Devpost Submission Thumbnail PNG (1280x720)
  await svgToPng(
    path.join(assetsDir, "clarityrail-devpost-thumbnail.svg"),
    path.join(assetsDir, "clarityrail-devpost-thumbnail.png"),
    1280,
    720
  );

  // 4. Also render social card PNG (1200x630)
  await svgToPng(
    path.join(assetsDir, "clarityrail-devpost-thumbnail.svg"),
    path.join(assetsDir, "clarityrail-social-card.png"),
    1200,
    630
  );

  await browser.close();
  console.log("✓ Vector and diagram asset rendering completed successfully.");
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("render-assets.ts")) {
  renderAssets().catch((err) => {
    console.error("Asset rendering error:", err);
    process.exit(1);
  });
}
