import { create } from "zustand";
import { PlanStep, RailSession, SafeDetourResult } from "../domain/types";
import { compileBrief } from "../domain/compiler/compiler";
import { segmentSourceText } from "../domain/compiler/segmenter";
import { calculateRevisionImpact, applyRevisionStaleness, confirmStaleStepReview } from "../domain/revision/impact";
import { findDependencySafeDetour } from "../domain/detour/selector";
import {
  saveSession,
  getSession,
  loadPreferences,
  savePreferences,
  clearAllLocalData,
} from "../adapters/persistence";
import { DEFAULT_PREFERENCES, UserPreferences } from "../adapters/db";
import { SYNTHETIC_FIXTURES } from "../domain/fixtures";

export interface AppState {
  currentSession: RailSession | null;
  preferences: UserPreferences;
  safeDetour: SafeDetourResult | null;
  announcement: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  createSession: (rawText: string, title?: string) => Promise<RailSession>;
  loadSession: (sessionId: string) => Promise<boolean>;
  loadFixture: (fixtureId: string) => Promise<RailSession>;
  markStepDone: (stepId: string) => Promise<void>;
  markStepBlocked: (stepId: string) => Promise<void>;
  resolveAmbiguity: (
    ambiguityId: string,
    status: "OPEN" | "ANSWERED" | "NOT_NEEDED" | "BLOCKER",
    answer?: string
  ) => Promise<void>;
  reviseSourceText: (newText: string) => Promise<void>;
  reviewAndConfirmStaleStep: (stepId: string) => Promise<void>;
  activateDetourStep: (stepId: string) => Promise<void>;
  breakDownStep: (stepId: string, subtaskTitles: string[]) => Promise<void>;
  setPreferences: (partial: Partial<UserPreferences>) => Promise<void>;
  announceMessage: (message: string) => void;
  resetAllData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentSession: null,
  preferences: DEFAULT_PREFERENCES,
  safeDetour: null,
  announcement: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      const prefs = await loadPreferences();
      set({ preferences: prefs, isLoading: false });

      // If there was a last active session, attempt to restore it
      if (prefs.lastActiveSessionId) {
        const lastSession = await getSession(prefs.lastActiveSessionId);
        if (lastSession) {
          set({ currentSession: lastSession });
          // Check if active step is blocked to compute detour
          const active = lastSession.steps.find((s) => s.id === lastSession.activeStepId);
          if (active && active.state === "BLOCKED") {
            const detour = findDependencySafeDetour(active.id, lastSession.steps);
            set({ safeDetour: detour });
          }
        }
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createSession: async (rawText: string, title?: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = compileBrief(rawText, { title });
      await saveSession(session);
      await savePreferences({ ...get().preferences, lastActiveSessionId: session.id });

      set({
        currentSession: session,
        isLoading: false,
        announcement: `Compiled brief into ${session.steps.length} traceable steps. First step ready.`,
      });
      return session;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  loadSession: async (sessionId: string) => {
    set({ isLoading: true });
    try {
      const session = await getSession(sessionId);
      if (session) {
        set({ currentSession: session, isLoading: false });
        await savePreferences({ ...get().preferences, lastActiveSessionId: session.id });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return false;
    }
  },

  loadFixture: async (fixtureId: string) => {
    const fixture = SYNTHETIC_FIXTURES.find((f) => f.id === fixtureId);
    if (!fixture) {
      throw new Error(`Fixture not found: ${fixtureId}`);
    }
    return get().createSession(fixture.initialBriefText, fixture.title);
  },

  markStepDone: async (stepId: string) => {
    const session = get().currentSession;
    if (!session) return;

    const updatedSteps = session.steps.map((s) => {
      if (s.id === stepId) {
        return { ...s, state: "DONE" as const };
      }
      return s;
    });

    // Determine next step: first READY step or unblock a PROPOSED step whose deps are now DONE
    const nextEligible = updatedSteps.find((s) => {
      if (s.state === "DONE" || s.state === "SKIPPED" || s.state === "BLOCKED" || s.state === "STALE") {
        return false;
      }
      // Check if all prerequisites are DONE
      const allDepsDone = s.dependsOn.every((depId) => {
        const dep = updatedSteps.find((st) => st.id === depId);
        return dep?.state === "DONE";
      });
      return allDepsDone;
    });

    if (nextEligible && nextEligible.state === "PROPOSED") {
      nextEligible.state = "READY";
    }

    const nextActiveId = nextEligible?.id ?? session.activeStepId;

    const updatedSession: RailSession = {
      ...session,
      steps: updatedSteps,
      activeStepId: nextActiveId,
      updatedAt: new Date().toISOString(),
    };

    await saveSession(updatedSession);
    set({
      currentSession: updatedSession,
      safeDetour: null,
      announcement: `Step completed. ${nextEligible ? `Advancing to: ${nextEligible.title}` : "All queued steps completed!"}`,
    });
  },

  markStepBlocked: async (stepId: string) => {
    const session = get().currentSession;
    if (!session) return;

    const updatedSteps = session.steps.map((s) => {
      if (s.id === stepId) {
        return { ...s, state: "BLOCKED" as const };
      }
      return s;
    });

    // Compute Dependency-Safe Detour
    const detourResult = findDependencySafeDetour(stepId, updatedSteps);

    const updatedSession: RailSession = {
      ...session,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    await saveSession(updatedSession);
    set({
      currentSession: updatedSession,
      safeDetour: detourResult,
      announcement: `Step marked blocked. ${detourResult.isEligible ? `Detour available: ${detourResult.candidateStep?.title}` : "No independent detour available."}`,
    });
  },

  resolveAmbiguity: async (ambiguityId, status, answer) => {
    const session = get().currentSession;
    if (!session) return;

    const updatedAmbiguities = session.ambiguities.map((a) => {
      if (a.id === ambiguityId) {
        return {
          ...a,
          status,
          answer: answer ?? a.answer,
        };
      }
      return a;
    });

    // Check if any blocked steps are now freed
    const updatedSteps = session.steps.map((step) => {
      const remainingBlockers = updatedAmbiguities.filter(
        (a) =>
          step.sourceClauseIds.some((cid) => a.sourceClauseIds.includes(cid)) &&
          (a.status === "OPEN" || a.status === "BLOCKER")
      );

      if (remainingBlockers.length === 0 && step.state === "BLOCKED") {
        return {
          ...step,
          state: "READY" as const,
          evidenceClass: "USER_CONFIRMED" as const,
        };
      }
      return step;
    });

    const updatedSession: RailSession = {
      ...session,
      ambiguities: updatedAmbiguities,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    await saveSession(updatedSession);
    set({
      currentSession: updatedSession,
      announcement: `Decision recorded. Ambiguity resolved as ${status}.`,
    });
  },

  reviseSourceText: async (newText: string) => {
    const session = get().currentSession;
    if (!session) return;

    const newRevId = `rev_${session.sourceRevisions.length + 1}_${Date.now()}`;
    const newClauses = segmentSourceText(newText, newRevId);

    const newRevision = {
      id: newRevId,
      parentRevisionId: session.activeRevisionId,
      sourceText: newText,
      normalizedDigest: `digest_${Date.now()}`,
      createdAt: new Date().toISOString(),
      changedClauseIds: newClauses.map((c) => c.id),
      changeSummary: "Revised brief edited by user",
    };

    // Calculate impact and propagate staleness
    const impact = calculateRevisionImpact(
      session.sourceClauses,
      newClauses,
      session.steps,
      newRevision
    );

    const staleSteps = applyRevisionStaleness(session.steps, impact, newRevId);

    const updatedSession: RailSession = {
      ...session,
      sourceText: newText,
      activeRevisionId: newRevId,
      sourceRevisions: [...session.sourceRevisions, newRevision],
      sourceClauses: newClauses,
      steps: staleSteps,
      updatedAt: new Date().toISOString(),
    };

    await saveSession(updatedSession);
    set({
      currentSession: updatedSession,
      announcement: `Source brief updated. ${impact.allStaleStepIds.length} affected step(s) marked STALE for review.`,
    });
  },

  reviewAndConfirmStaleStep: async (stepId: string) => {
    const session = get().currentSession;
    if (!session) return;

    const updatedSteps = session.steps.map((s) => {
      if (s.id === stepId) {
        return confirmStaleStepReview(s);
      }
      return s;
    });

    const updatedSession: RailSession = {
      ...session,
      steps: updatedSteps,
      updatedAt: new Date().toISOString(),
    };

    await saveSession(updatedSession);
    set({
      currentSession: updatedSession,
      announcement: `Step reviewed and confirmed. Restored to READY.`,
    });
  },

  activateDetourStep: async (detourStepId: string) => {
    const session = get().currentSession;
    if (!session) return;

    const updatedSession: RailSession = {
      ...session,
      activeStepId: detourStepId,
      updatedAt: new Date().toISOString(),
    };

    await saveSession(updatedSession);
    set({
      currentSession: updatedSession,
      announcement: `Switched focus to safe alternative step.`,
    });
  },

  breakDownStep: async (stepId: string, subtaskTitles: string[]) => {
    const session = get().currentSession;
    if (!session || subtaskTitles.length === 0) return;

    const targetStep = session.steps.find((s) => s.id === stepId);
    if (!targetStep) return;

    const targetIndex = session.steps.findIndex((s) => s.id === stepId);

    // Create sub-steps linked to the same source clause
    const subSteps: PlanStep[] = subtaskTitles.map((subTitle, idx) => ({
      id: `${targetStep.id}_sub_${idx + 1}`,
      title: subTitle.trim(),
      state: idx === 0 ? "READY" : "PROPOSED",
      evidenceClass: "DERIVED",
      sourceClauseIds: [...targetStep.sourceClauseIds],
      dependsOn: idx === 0 ? [...targetStep.dependsOn] : [`${targetStep.id}_sub_${idx}`],
      validatedAgainstRevisionId: targetStep.validatedAgainstRevisionId,
      effortMinutes: {
        min: Math.max(5, Math.floor((targetStep.effortMinutes?.min ?? 20) / subtaskTitles.length)),
        max: Math.max(10, Math.floor((targetStep.effortMinutes?.max ?? 40) / subtaskTitles.length)),
        userEdited: false,
      },
      assumptionIds: [],
    }));

    // Replace target step with sub-steps
    const newSteps = [...session.steps];
    newSteps.splice(targetIndex, 1, ...subSteps);

    const updatedSession: RailSession = {
      ...session,
      steps: newSteps,
      activeStepId: subSteps[0]?.id ?? session.activeStepId,
      updatedAt: new Date().toISOString(),
    };

    await saveSession(updatedSession);
    set({
      currentSession: updatedSession,
      announcement: `Broken down into ${subSteps.length} smaller steps.`,
    });
  },

  setPreferences: async (partial: Partial<UserPreferences>) => {
    const updated = { ...get().preferences, ...partial };
    await savePreferences(updated);
    set({ preferences: updated });
  },

  announceMessage: (message: string) => {
    set({ announcement: message });
  },

  resetAllData: async () => {
    await clearAllLocalData();
    set({
      currentSession: null,
      preferences: DEFAULT_PREFERENCES,
      safeDetour: null,
      announcement: "All local workspace data and cached sessions have been reset.",
    });
  },
}));
