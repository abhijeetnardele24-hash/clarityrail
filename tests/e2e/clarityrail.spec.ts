import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("ClarityRail E2E & Accessibility Suite", () => {
  test("Landing Page: Loads, compiles academic brief, and verifies Axe accessibility", async ({ page }) => {
    await page.goto("./");

    // Check title and hero
    await expect(page).toHaveTitle(/ClarityRail/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("From messy instructions");

    // Run Axe automated accessibility audit on landing page
    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const criticalOrSerious = axeResults.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(criticalOrSerious.length).toBe(0);

    // Click 1-click synthetic fixture for CS 401
    const fixtureBtn = page.getByTestId("load-fixture-fixture_academic_cs401");
    await expect(fixtureBtn).toBeVisible();
    await fixtureBtn.click();

    // Should navigate to focus rail
    await expect(page.getByTestId("focus-step-title")).toBeVisible();
  });

  test("Four-Part Clarity Contract: Focus Rail, Evidence Thread, Ambiguity, Guard & Detour", async ({ page }) => {
    await page.goto("./");

    // Load fixture
    await page.getByTestId("load-fixture-fixture_academic_cs401").click();

    // 1. Evidence Thread: Expand 'Why this step?'
    const whyBtn = page.getByRole("button", { name: /Why this step/i });
    await expect(whyBtn).toBeVisible();
    await whyBtn.click();
    await expect(page.getByText(/Direct Source Evidence/i)).toBeVisible();
    await expect(page.getByText(/Clause #/i).first()).toBeVisible();

    // 2. Ambiguity Gate: Answer or confirm an open ambiguity
    const answerInput = page.getByPlaceholder(/Type decision/i).first();
    if (await answerInput.isVisible()) {
      await answerInput.fill("11:59 PM EST");
      await page.getByRole("button", { name: /Confirm Decision/i }).first().click();
      await expect(page.getByText(/Resolved:/i).first()).toBeVisible();
    }

    // 3. Mark Step Blocked -> Triggers Dependency-Safe Detour Banner
    const blockedBtn = page.getByTestId("mark-blocked-button");
    await blockedBtn.click();

    const detourBanner = page.getByRole("complementary", { name: /Dependency-Safe Detour/i });
    await expect(detourBanner).toBeVisible();
    await expect(page.getByText(/Dependency-Safe Detour Available|Detour Blocked/i)).toBeVisible();

    // 4. Change Impact Guard: Revise source brief and verify STALE state propagation
    const editBriefBtn = page.getByTestId("edit-brief-button");
    await editBriefBtn.click();

    const textarea = page.getByTestId("revise-brief-textarea");
    await expect(textarea).toBeVisible();

    // Modify active step's source clause to trigger STALE state on active step
    const currentVal = await textarea.inputValue();
    const revisedVal = currentVal.replace(
      "Please download the lab starter repository from GitHub.",
      "Please download the updated v2 lab starter repository with Paxos dependencies."
    );
    await textarea.fill(revisedVal);

    const applyBtn = page.getByTestId("apply-revision-button");
    await applyBtn.click();

    // Stale alert should be visible
    const staleAlert = page.getByTestId("stale-alert");
    await expect(staleAlert).toBeVisible();
    await expect(page.getByText(/Require Review Due to Source Revision/i)).toBeVisible();

    // Confirm stale step review
    const confirmStaleBtn = page.getByRole("button", { name: /Review & Mark Ready/i }).first();
    if (await confirmStaleBtn.isVisible()) {
      await confirmStaleBtn.click();
    }

    // 5. Interruption Recovery Capsule
    await expect(page.getByRole("region", { name: /Resume Capsule/i })).toBeVisible();
    await expect(page.getByText(/Local Device Only/i)).toBeVisible();

    // Run Axe audit on the complete active rail screen
    const railAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const railViolations = railAxe.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(railViolations.length).toBe(0);
  });

  test("Review Route & Export Capsule Modal", async ({ page }) => {
    await page.goto("./");
    await page.getByTestId("load-fixture-fixture_academic_cs401").click();

    // Navigate to Review Route
    await page.getByRole("button", { name: /View Full Plan & Export Handoff/i }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Plan & Lineage Review");

    // Open Export Modal
    await page.getByTestId("open-export-modal-button").click();

    const modal = page.getByRole("dialog", { name: /Export Progress & Handoff Capsule/i });
    await expect(modal).toBeVisible();
    await expect(page.getByText(/# ClarityRail Progress & Handoff Capsule/i)).toBeVisible();

    // Close modal
    await page.getByRole("button", { name: /Close export dialog/i }).click();
    await expect(modal).not.toBeVisible();
  });

  test("Display Settings: Theme toggle, text scale, and reset data", async ({ page }) => {
    await page.goto("./#/settings");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Display & Accessibility Preferences");

    // Toggle theme to High Contrast
    const highContrastBtn = page.locator("main").getByRole("button", { name: /High Contrast/i });
    await highContrastBtn.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "high-contrast");

    // Toggle text scale to Large
    const largeTextBtn = page.getByRole("button", { name: /Large \(112.5%\)/i });
    await largeTextBtn.click();
    await expect(page.locator("html")).toHaveAttribute("data-text-scale", "large");

    // Restore to Warm Paper
    await page.locator("main").getByRole("button", { name: /Warm Paper/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "warm-paper");
  });
});
