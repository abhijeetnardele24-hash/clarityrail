import { test, expect } from "@playwright/test";
import { assertAndRecordAxe } from "./axe-evidence";

test.describe("ClarityRail resilience and interaction verification", () => {
  test("persists a compiled rail through reload and an offline service-worker reload", async ({ page, context }) => {
    await page.goto("./");
    await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) throw new Error("Service workers are unavailable");
      await navigator.serviceWorker.ready;
    });
    await page.getByTestId("load-fixture-fixture_academic_cs401").click();
    const title = await page.getByTestId("focus-step-title").textContent();
    await page.reload();
    await expect(page.getByTestId("focus-step-title")).toHaveText(title ?? "");

    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("focus-step-title")).toHaveText(title ?? "");
    await context.setOffline(false);
  });

  test("preserves stale revision review state across reload", async ({ page }) => {
    await page.goto("./");
    await page.getByTestId("load-fixture-fixture_academic_cs401").click();
    await page.getByTestId("edit-brief-button").click();
    const textarea = page.getByTestId("revise-brief-textarea");
    const original = await textarea.inputValue();
    await textarea.fill(original.replace("4-page", "6-page"));
    await page.getByTestId("apply-revision-button").click();
    await expect(page.getByTestId("stale-alert")).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("stale-alert")).toBeVisible();
  });

  test("traps dialog focus, closes on Escape and restores the trigger", async ({ page }) => {
    await page.goto("./");
    await page.getByTestId("load-fixture-fixture_academic_cs401").click();
    await page.getByRole("button", { name: /View Full Plan & Export Handoff/i }).click();
    const trigger = page.getByTestId("open-export-modal-button");
    await trigger.focus();
    await trigger.click();
    const close = page.getByRole("button", { name: /Close export dialog/i });
    await expect(close).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("has no horizontal overflow, unexpected runtime errors, or serious Axe findings on primary routes", async ({ page }, testInfo) => {
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });

    await page.goto("./");
    await assertAndRecordAxe(page, testInfo, "landing-deep-verification");
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

    await page.goto("./#/evidence");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await assertAndRecordAxe(page, testInfo, "evidence-route");

    await page.goto("./#/settings");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await assertAndRecordAxe(page, testInfo, "settings-route");
    expect(runtimeErrors).toEqual([]);
  });

  test("honors reduced-motion preference", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");
    const duration = await page.getByRole("button", { name: /Build My Focus Rail/i }).evaluate((element) => getComputedStyle(element).transitionDuration);
    expect(["0s", "0.001s", "0.01ms", "1e-05s"]).toContain(duration);
  });
});
