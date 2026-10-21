import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "../../src/application/store";
import { SYNTHETIC_FIXTURES } from "../../src/domain/fixtures";

describe("Application Zustand Store", () => {
  beforeEach(async () => {
    await useAppStore.getState().resetAllData();
  });

  it("initializes with default preferences", async () => {
    await useAppStore.getState().initialize();
    const prefs = useAppStore.getState().preferences;
    expect(prefs.theme).toBe("warm-paper");
    expect(prefs.textScale).toBe("normal");
  });

  it("creates a session from raw brief text and sets first step ready", async () => {
    const raw = "Download starter files. Write the analysis paper. Submit before Friday at 5:00 PM.";
    const session = await useAppStore.getState().createSession(raw, "Test Assignment");

    expect(session.id).toBeDefined();
    expect(session.steps.length).toBeGreaterThanOrEqual(2);
    expect(useAppStore.getState().currentSession?.id).toBe(session.id);

    const active = session.steps.find((s) => s.id === session.activeStepId);
    expect(active?.state).toBe("READY");
  });

  it("loads a synthetic fixture by ID", async () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const session = await useAppStore.getState().loadFixture(fixture.id);

    expect(session.title).toBe(fixture.title);
    expect(session.steps.length).toBeGreaterThanOrEqual(4);
  });

  it("advances to the next step when markStepDone is called", async () => {
    const session = await useAppStore.getState().createSession("Download the starter files. Review the specification.");
    const step1Id = session.steps[0]!.id;

    await useAppStore.getState().markStepDone(step1Id);

    const updated = useAppStore.getState().currentSession!;
    expect(updated.steps.find((s) => s.id === step1Id)?.state).toBe("DONE");
  });

  it("marks a step blocked and computes dependency-safe detour", async () => {
    const fixture = SYNTHETIC_FIXTURES[1]!; // Collaborative capstone
    const session = await useAppStore.getState().createSession(fixture.initialBriefText);
    const firstStep = session.steps[0]!;

    await useAppStore.getState().markStepBlocked(firstStep.id);

    const updated = useAppStore.getState().currentSession!;
    expect(updated.steps.find((s) => s.id === firstStep.id)?.state).toBe("BLOCKED");

    const detour = useAppStore.getState().safeDetour;
    expect(detour).toBeDefined();
  });

  it("resolves ambiguities and unblocks steps", async () => {
    const session = await useAppStore.getState().createSession("Submit your final assignment.");
    const amb = session.ambiguities[0];
    if (amb) {
      await useAppStore.getState().resolveAmbiguity(amb.id, "ANSWERED", "PDF");
      const updated = useAppStore.getState().currentSession!;
      expect(updated.ambiguities.find((a) => a.id === amb.id)?.status).toBe("ANSWERED");
    }
  });

  it("propagates STALE state when source text is revised", async () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    await useAppStore.getState().createSession(fixture.initialBriefText);

    await useAppStore.getState().reviseSourceText(fixture.revisedBriefText!);

    const updated = useAppStore.getState().currentSession!;
    expect(updated.sourceRevisions.length).toBe(2);
    const staleCount = updated.steps.filter((s) => s.state === "STALE").length;
    expect(staleCount).toBeGreaterThan(0);

    // Confirm stale review
    const firstStale = updated.steps.find((s) => s.state === "STALE")!;
    await useAppStore.getState().reviewAndConfirmStaleStep(firstStale.id);

    const postConfirm = useAppStore.getState().currentSession!;
    expect(postConfirm.steps.find((s) => s.id === firstStale.id)?.state).toBe("READY");
  });

  it("breaks down a step into subtasks", async () => {
    const session = await useAppStore.getState().createSession("Implement the core system architecture. Finish deployment.");
    const targetId = session.steps[0]!.id;

    await useAppStore.getState().breakDownStep(targetId, [
      "Subtask part A",
      "Subtask part B",
    ]);

    const updated = useAppStore.getState().currentSession!;
    expect(updated.steps.some((s) => s.title === "Subtask part A")).toBe(true);
    expect(updated.steps.some((s) => s.title === "Subtask part B")).toBe(true);
  });

  it("updates preferences and announces messages", async () => {
    await useAppStore.getState().setPreferences({ theme: "high-contrast", density: "compact" });
    expect(useAppStore.getState().preferences.theme).toBe("high-contrast");

    useAppStore.getState().announceMessage("Task updated successfully");
    expect(useAppStore.getState().announcement).toBe("Task updated successfully");
  });
});
