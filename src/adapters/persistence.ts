import { RailSession } from "../domain/types";
import { db, DEFAULT_PREFERENCES, UserPreferences } from "./db";

// In-memory / localStorage fallback cache
const memorySessions = new Map<string, RailSession>();
let memoryPreferences: UserPreferences = { ...DEFAULT_PREFERENCES };

export async function saveSession(session: RailSession): Promise<void> {
  const updated: RailSession = {
    ...session,
    updatedAt: new Date().toISOString(),
  };

  memorySessions.set(updated.id, updated);

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(`clarityrail_session_${updated.id}`, JSON.stringify(updated));
    }
    await db.sessions.put(updated);
  } catch (err) {
    console.warn("[ClarityRail Persistence] IndexedDB write failed, persisted in memory/localStorage:", err);
  }
}

export async function getSession(id: string): Promise<RailSession | undefined> {
  try {
    const item = await db.sessions.get(id);
    if (item) return item;
  } catch {
    // fallback
  }

  if (memorySessions.has(id)) {
    return memorySessions.get(id);
  }

  if (typeof window !== "undefined" && window.localStorage) {
    const raw = window.localStorage.getItem(`clarityrail_session_${id}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as RailSession;
        memorySessions.set(id, parsed);
        return parsed;
      } catch {
        // ignore malformed
      }
    }
  }

  return undefined;
}

export async function listSessions(): Promise<RailSession[]> {
  try {
    const items = await db.sessions.orderBy("updatedAt").reverse().toArray();
    if (items.length > 0) return items;
  } catch {
    // fallback
  }

  const list = Array.from(memorySessions.values());
  list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return list;
}

export async function deleteSession(id: string): Promise<void> {
  memorySessions.delete(id);
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem(`clarityrail_session_${id}`);
  }
  try {
    await db.sessions.delete(id);
  } catch {
    // ignore
  }
}

export async function clearAllLocalData(): Promise<void> {
  memorySessions.clear();
  memoryPreferences = { ...DEFAULT_PREFERENCES };

  if (typeof window !== "undefined" && window.localStorage) {
    const keys = Object.keys(window.localStorage);
    for (const k of keys) {
      if (k.startsWith("clarityrail_")) {
        window.localStorage.removeItem(k);
      }
    }
  }

  try {
    await db.sessions.clear();
    await db.preferences.clear();
  } catch {
    // ignore
  }
}

export async function loadPreferences(): Promise<UserPreferences> {
  try {
    const record = await db.preferences.get("user_prefs");
    if (record) {
      const { id: _, ...rest } = record;
      return rest;
    }
  } catch {
    // fallback
  }

  if (typeof window !== "undefined" && window.localStorage) {
    const raw = window.localStorage.getItem("clarityrail_prefs");
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
  }

  return memoryPreferences;
}

export async function savePreferences(prefs: UserPreferences): Promise<void> {
  memoryPreferences = { ...prefs };

  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem("clarityrail_prefs", JSON.stringify(prefs));
  }

  try {
    await db.preferences.put({ id: "user_prefs", ...prefs });
  } catch {
    // ignore
  }
}
