import { RelationKind } from "../types";
import { ActionCandidate } from "./extractor";

export interface DependencyEdge {
  fromStepIndex: number; // prerequisite step
  toStepIndex: number;   // dependent step
  relation: RelationKind;
  markerClauseText: string;
}

export interface DependencyGraphResult {
  edges: DependencyEdge[];
  hasCycle: boolean;
  cycleExplanation?: string;
  stepDependencies: Map<number, number[]>; // stepIndex -> prerequisiteIndices
}

/**
 * Builds dependency relationships between identified candidate actions.
 */
export function buildDependencyGraph(
  candidates: ActionCandidate[],
  rawClausesText: string[]
): DependencyGraphResult {
  const edges: DependencyEdge[] = [];
  const count = candidates.length;
  const stepDependencies = new Map<number, number[]>();

  for (let i = 0; i < count; i++) {
    stepDependencies.set(i, []);
  }

  // 1. Scan for explicit inter-step linguistic markers in candidate texts and connecting clauses
  for (let i = 0; i < count; i++) {
    const candidate = candidates[i];
    if (!candidate) continue;
    const text = candidate.actionText.toLowerCase();

    // "After completing [X], do [this]" or "Once [X] is done, do [this]"
    const afterMatch = text.match(/(?:after|once|following|having)\s+([a-z0-9\s]{4,30})/);
    if (afterMatch && afterMatch[1]) {
      const targetPhrase = afterMatch[1].trim();
      // Find candidate that matches target phrase
      for (let j = 0; j < count; j++) {
        if (i === j) continue;
        const other = candidates[j];
        if (other && isPhraseMatch(other.actionText, targetPhrase)) {
          addEdge(j, i, "BEFORE", text, edges, stepDependencies);
        }
      }
    }

    // "Before doing [X], [this] must be done" -> this happens before X (X depends on this)
    const beforeMatch = text.match(/before\s+([a-z0-9\s]{4,30})/);
    if (beforeMatch && beforeMatch[1]) {
      const targetPhrase = beforeMatch[1].trim();
      for (let j = 0; j < count; j++) {
        if (i === j) continue;
        const other = candidates[j];
        if (other && isPhraseMatch(other.actionText, targetPhrase)) {
          // i must happen before j -> j depends on i
          addEdge(i, j, "BEFORE", text, edges, stepDependencies);
        }
      }
    }

    // Alternative detection: "either [A] or [B]", "choose one of"
    if (text.includes("either") || text.includes("or choose") || text.includes("alternative")) {
      if (i > 0) {
        addEdge(i - 1, i, "ALTERNATIVE", text, edges, stepDependencies);
      }
    }
  }

  // 2. Also inspect intermediate clauses that are not actions themselves (e.g. "Step 1 must be completed before Step 2")
  for (const clauseText of rawClausesText) {
    const lower = clauseText.toLowerCase();
    const orderingMatch = lower.match(/(?:step|task)\s+(\d+)\s+(?:must\s+be\s+done\s+)?before\s+(?:step|task)\s+(\d+)/);
    if (orderingMatch && orderingMatch[1] && orderingMatch[2]) {
      const fromNum = parseInt(orderingMatch[1], 10) - 1;
      const toNum = parseInt(orderingMatch[2], 10) - 1;
      if (fromNum >= 0 && fromNum < count && toNum >= 0 && toNum < count && fromNum !== toNum) {
        addEdge(fromNum, toNum, "BEFORE", clauseText, edges, stepDependencies);
      }
    }
  }

  // 3. Fallback sequential ordering: If no explicit edges exist between adjacent steps,
  // establish a soft natural progression for sequential briefs (e.g. download -> draft -> submit)
  for (let i = 0; i < count - 1; i++) {
    const current = candidates[i];
    const next = candidates[i + 1];
    if (!current || !next) continue;

    // Strong natural dependencies:
    // e.g., "download/read" before "write/draft"; "draft" before "submit/upload/present"
    if (isNaturalPrerequisite(current.imperativeVerb, next.imperativeVerb)) {
      addEdge(i, i + 1, "BEFORE", "Natural workflow progression", edges, stepDependencies);
    }
  }

  // 4. Cycle detection using DFS
  const cycleCheck = detectCycle(count, stepDependencies);

  return {
    edges,
    hasCycle: cycleCheck.hasCycle,
    cycleExplanation: cycleCheck.explanation,
    stepDependencies,
  };
}

function addEdge(
  from: number,
  to: number,
  relation: RelationKind,
  marker: string,
  edges: DependencyEdge[],
  stepDeps: Map<number, number[]>
) {
  if (from === to) return;
  // Prevent duplicate edge
  const existing = edges.find((e) => e.fromStepIndex === from && e.toStepIndex === to);
  if (existing) return;

  edges.push({
    fromStepIndex: from,
    toStepIndex: to,
    relation,
    markerClauseText: marker,
  });

  const deps = stepDeps.get(to) ?? [];
  if (!deps.includes(from)) {
    deps.push(from);
    stepDeps.set(to, deps);
  }
}

function isPhraseMatch(fullText: string, targetPhrase: string): boolean {
  const words = targetPhrase.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return false;
  const lowerFull = fullText.toLowerCase();
  return words.some((word) => lowerFull.includes(word));
}

function isNaturalPrerequisite(v1: string, v2: string): boolean {
  const prepVerbs = ["download", "read", "review", "collect", "setup", "install"];
  const workVerbs = ["write", "draft", "implement", "analyze", "create", "test"];
  const finalVerbs = ["submit", "upload", "export", "send", "deliver", "present"];

  if (prepVerbs.includes(v1) && (workVerbs.includes(v2) || finalVerbs.includes(v2))) return true;
  if (workVerbs.includes(v1) && finalVerbs.includes(v2)) return true;
  return false;
}

function detectCycle(
  nodeCount: number,
  depsMap: Map<number, number[]>
): { hasCycle: boolean; explanation?: string } {
  const visited = new Array<number>(nodeCount).fill(0); // 0: unvisited, 1: visiting, 2: visited
  const cyclePath: number[] = [];

  function dfs(u: number): boolean {
    visited[u] = 1;
    cyclePath.push(u);

    const neighbors = depsMap.get(u) ?? [];
    for (const v of neighbors) {
      if (visited[v] === 1) {
        cyclePath.push(v);
        return true; // Cycle detected
      }
      if (visited[v] === 0) {
        if (dfs(v)) return true;
      }
    }

    cyclePath.pop();
    visited[u] = 2;
    return false;
  }

  for (let i = 0; i < nodeCount; i++) {
    if (visited[i] === 0) {
      if (dfs(i)) {
        const cycleText = cyclePath.map((idx) => `Step ${idx + 1}`).join(" -> ");
        return {
          hasCycle: true,
          explanation: `Circular dependency detected: ${cycleText}. One step cannot simultaneously be a prerequisite and a dependent of itself.`,
        };
      }
    }
  }

  return { hasCycle: false };
}
