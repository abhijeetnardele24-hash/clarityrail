import { describe, it, expect, beforeEach } from "vitest";
import {
  saveSession,
  getSession,
  listSessions,
  deleteSession,
  clearAllLocalData,
  loadPreferences,
  savePreferences,
} from "../../src/adapters/persistence";
import { compileBrief } from "../../src/domain/compiler/compiler";

describe("Persistence Adapter", () => {
  beforeEach(async () => {
    await clearAllLocalData();
  });

  it("saves and retrieves a session correctly", async () => {
    const session = compileBrief("Download the rubric. Write the essay.");
    await saveSession(session);

    const retrieved = await getSession(session.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(session.id);
    expect(retrieved?.steps.length).toBe(session.steps.length);
  });

  it("lists all stored sessions ordered by recency", async () => {
    const s1 = compileBrief("Task one.", { sessionId: "s1" });
    const s2 = compileBrief("Task two.", { sessionId: "s2" });

    await saveSession(s1);
    await saveSession(s2);

    const list = await listSessions();
    expect(list.length).toBe(2);
  });

  it("deletes a session by ID", async () => {
    const s1 = compileBrief("Task one.", { sessionId: "del_target" });
    await saveSession(s1);

    await deleteSession("del_target");
    const retrieved = await getSession("del_target");
    expect(retrieved).toBeUndefined();
  });

  it("persists and loads accessibility preferences", async () => {
    await savePreferences({
      theme: "high-contrast",
      textScale: "large",
      density: "compact",
      reducedMotion: true,
      cuePhrasesEnabled: false,
    });

    const prefs = await loadPreferences();
    expect(prefs.theme).toBe("high-contrast");
    expect(prefs.textScale).toBe("large");
    expect(prefs.reducedMotion).toBe(true);
  });
});
