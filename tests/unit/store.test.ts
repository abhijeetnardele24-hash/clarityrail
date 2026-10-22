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

  it("resolves ambiguities without prematurely unblocking dependency-blocked steps", async () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const session = await useAppStore.getState().loadFixture(fixture.id);

    // Identify a step that depends on earlier steps
    const dependentStep = session.steps.find((s) => s.dependsOn.length > 0)!;
    expect(dependentStep).toBeDefined();

    // Check ambiguities associated with dependent step
    const amb = session.ambiguities.find((a) =>
      dependentStep.sourceClauseIds.some((cid) => a.sourceClauseIds.includes(cid))
    );

    if (amb) {
      await useAppStore.getState().resolveAmbiguity(amb.id, "ANSWERED", "Resolved answer");
      const updated = useAppStore.getState().currentSession!;

      const targetStep = updated.steps.find((s) => s.id === dependentStep.id)!;
      // Because prerequisites are not DONE yet, targetStep MUST NOT become READY!
      expect(targetStep.state).not.toBe("READY");
    }
  });

  it("propagates STALE state, retains old validation revision, and updates revision on review", async () => {
    const fixture = SYNTHETIC_FIXTURES[0]!;
    const initialSession = await useAppStore.getState().createSession(fixture.initialBriefText);
    const rev1Id = initialSession.activeRevisionId;

    await useAppStore.getState().reviseSourceText(fixture.revisedBriefText!);

    const updated = useAppStore.getState().currentSession!;
    expect(updated.sourceRevisions.length).toBe(2);
    const rev2Id = updated.activeRevisionId;
    expect(rev2Id).not.toBe(rev1Id);

    // Genuinely changed clause IDs must be populated
    const rev2 = updated.sourceRevisions[1]!;
    expect(rev2.changedClauseIds.length).toBeGreaterThan(0);

    const staleSteps = updated.steps.filter((s) => s.state === "STALE");
    expect(staleSteps.length).toBeGreaterThan(0);

    // CRITICAL: Stale steps MUST still point to rev1Id until reviewed!
    for (const stale of staleSteps) {
      expect(stale.validatedAgainstRevisionId).toBe(rev1Id);
    }

    // Confirm stale review
    const firstStale = staleSteps[0]!;
    await useAppStore.getState().reviewAndConfirmStaleStep(firstStale.id);

    const postConfirm = useAppStore.getState().currentSession!;
    const confirmedStep = postConfirm.steps.find((s) => s.id === firstStale.id)!;
    expect(confirmedStep.state).toBe("READY");
    // Now it points to rev2Id!
    expect(confirmedStep.validatedAgainstRevisionId).toBe(rev2Id);
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
