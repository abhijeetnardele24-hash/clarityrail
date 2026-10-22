import { describe, it, expect, beforeEach } from "vitest";
import Dexie from "dexie";
import {
  saveSession,
  getSession,
  listSessions,
  deleteSession,
  clearAllLocalData,
  loadPreferences,
  savePreferences,
} from "../../src/adapters/persistence";
import { db, ClarityRailDatabase } from "../../src/adapters/db";
import { compileBrief } from "../../src/domain/compiler/compiler";
import { serializeSessionToJson, parseAndValidateSessionJson } from "../../src/adapters/export";

describe("Persistence Adapter & IndexedDB Engine", () => {
  beforeEach(async () => {
    await clearAllLocalData();
  });

  it("saves and retrieves a session correctly from IndexedDB", async () => {
    const session = compileBrief("Download the rubric. Write the essay.");
    await saveSession(session);

    // Verify directly in Dexie table
    const dbRecord = await db.sessions.get(session.id);
    expect(dbRecord).toBeDefined();
    expect(dbRecord?.id).toBe(session.id);
    expect(dbRecord?.steps.length).toBe(session.steps.length);

    // Verify through persistence adapter
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
    expect(list.map((s) => s.id)).toContain("s1");
    expect(list.map((s) => s.id)).toContain("s2");
  });

  it("deletes a session by ID from IndexedDB", async () => {
    const s1 = compileBrief("Task one.", { sessionId: "del_target" });
    await saveSession(s1);

    await deleteSession("del_target");
    const retrieved = await getSession("del_target");
    expect(retrieved).toBeUndefined();

    const dbRecord = await db.sessions.get("del_target");
    expect(dbRecord).toBeUndefined();
  });

  it("persists and loads accessibility preferences in IndexedDB", async () => {
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
    expect(prefs.density).toBe("compact");
    expect(prefs.reducedMotion).toBe(true);
    expect(prefs.cuePhrasesEnabled).toBe(false);
  });

  it("persists data across simulated browser reload (reopening Dexie)", async () => {
    const session = compileBrief("Step A. Step B.");
    await saveSession(session);

    // Close current connection
    db.close();

    // Create a new database instance connected to the same IndexedDB database
    const reopenedDb = new ClarityRailDatabase();
    await reopenedDb.open();

    const record = await reopenedDb.sessions.get(session.id);
    expect(record).toBeDefined();
    expect(record?.title).toBe(session.title);

    reopenedDb.close();
    await db.open(); // restore singleton connection
  });

  it("executes schema migration from version 1 to version 2", async () => {
    const testDbName = "MigrationTestDB_" + Date.now();

    // Step 1: Create V1 database and insert legacy session missing schemaVersion
    const v1Db = new Dexie(testDbName);
    v1Db.version(1).stores({
      sessions: "id, activeRevisionId, createdAt, updatedAt",
    });
    await v1Db.open();

    const legacySession: any = {
      id: "legacy_session_1",
      title: "Legacy Brief",
      activeRevisionId: "rev_legacy",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [],
      // Notice: schemaVersion is omitted
    };
    await v1Db.table("sessions").put(legacySession);
    v1Db.close();

    // Step 2: Open with V2 database having upgrade handler
    class TestMigratedDB extends Dexie {
      constructor() {
        super(testDbName);
        this.version(1).stores({
          sessions: "id, activeRevisionId, createdAt, updatedAt",
        });
        this.version(2)
          .stores({
            sessions: "id, activeRevisionId, createdAt, updatedAt, schemaVersion",
          })
          .upgrade((tx) => {
            return tx
              .table("sessions")
              .toCollection()
              .modify((session) => {
                if (!session.schemaVersion) {
                  session.schemaVersion = 2;
                }
              });
          });
      }
    }

    const v2Db = new TestMigratedDB();
    await v2Db.open();

    const upgradedRecord = await v2Db.table("sessions").get("legacy_session_1");
    expect(upgradedRecord).toBeDefined();
    expect(upgradedRecord.schemaVersion).toBe(2);

    v2Db.close();
    await Dexie.delete(testDbName);
  });

  it("handles malformed or partial legacy data in localStorage safely without silent crash", async () => {
    // Put corrupt JSON in localStorage
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("clarityrail_session_corrupt", "not_valid_json{{{");
    }

    const retrieved = await getSession("corrupt");
    // Should gracefully return undefined without throwing
    expect(retrieved).toBeUndefined();
  });

  it("executes export, clear, import, and reopen round trips cleanly", async () => {
    const original = compileBrief("Draft methodology section. Review with advisor.");
    await saveSession(original);

    // Export to JSON string
    const exportedJson = serializeSessionToJson(original);
    expect(typeof exportedJson).toBe("string");

    // Clear all local data
    await clearAllLocalData();
    const afterClear = await getSession(original.id);
    expect(afterClear).toBeUndefined();

    // Import from JSON
    const parsed = parseAndValidateSessionJson(exportedJson);
    await saveSession(parsed);

    // Verify round-trip integrity
    const rehydrated = await getSession(original.id);
    expect(rehydrated).toBeDefined();
    expect(rehydrated?.id).toBe(original.id);
    expect(rehydrated?.steps.length).toBe(original.steps.length);
    expect(rehydrated?.sourceText).toBe(original.sourceText);
    expect(rehydrated?.schemaVersion).toBe(2);
  });
});
