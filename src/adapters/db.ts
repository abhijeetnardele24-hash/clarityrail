import Dexie, { type Table } from "dexie";
import { RailSession } from "../domain/types";

export interface UserPreferences {
  theme: "warm-paper" | "high-contrast";
  textScale: "normal" | "large" | "x-large";
  density: "comfortable" | "compact";
  reducedMotion: boolean;
  cuePhrasesEnabled: boolean;
  lastActiveSessionId?: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "warm-paper",
  textScale: "normal",
  density: "comfortable",
  reducedMotion: false,
  cuePhrasesEnabled: true,
};

export class ClarityRailDatabase extends Dexie {
  sessions!: Table<RailSession, string>;
  preferences!: Table<UserPreferences & { id: string }, string>;

  constructor() {
    super("ClarityRailDB");

    // Version 1: Initial schema
    this.version(1).stores({
      sessions: "id, activeRevisionId, createdAt, updatedAt",
      preferences: "id",
    });

    // Version 2: Added schemaVersion migration
    this.version(2).stores({
      sessions: "id, activeRevisionId, createdAt, updatedAt, schemaVersion",
      preferences: "id",
    }).upgrade(tx => {
      return tx.table("sessions").toCollection().modify(session => {
        if (!session.schemaVersion) {
          session.schemaVersion = 2;
        }
      });
    });
  }
}

export const db = new ClarityRailDatabase();
