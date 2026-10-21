# ClarityRail — Devpost Hackathon Submission

**Project Title**: ClarityRail: From Messy Instructions to One Clear, Traceable Next Step  
**Elevator Pitch**: A local-first, cognitive-accessibility workspace for university students experiencing task paralysis. Transforms overwhelming assignments into single actionable focus rails with cryptographic source traceability, automated ambiguity gating, and change impact guards.  
**Track / Hackathon**: Taskforge Hackathon 2026 — Cognitive Accessibility & Local-First Student Tools  
**Repository**: [github.com/abhijeetnardele24-hash/clarityrail](https://github.com/abhijeetnardele24-hash/clarityrail)  
**Live Application**: [abhijeetnardele24-hash.github.io/clarityrail/](https://abhijeetnardele24-hash.github.io/clarityrail/)  

---

## 1. Inspiration: The Task Paralysis Reality

For students experiencing executive dysfunction, ADHD, autistic inertia, or acute burnout, academic briefs are an invisible wall. Modern course materials are rarely structured checklists; they are multi-paragraph torrents containing buried constraints (*"submit by Friday"*), unassigned group tasks, contradictory guidelines, and unspecified deliverable formats.

When faced with ambiguity, cognitive overload triggers paralysis:
1. **The Overwhelming List Trap**: Conventional task managers dump 30 checkboxes onto a screen simultaneously, demanding immediate executive prioritization that freezes students.
2. **The Hallucination Trap**: Mainstream LLM wrappers attempt to "summarize" briefs, but invent phantom deliverables, skip critical constraints, vary randomly across prompts, and ship sensitive student drafts to remote servers.
3. **The Mid-Stream Invalidation Trap**: When an instructor emails a syllabus revision halfway through a project, students have no automated way to determine which parts of their work were rendered obsolete.

We built **ClarityRail** to provide radical cognitive relief: isolating exactly **one** immediate actionable step, grounding every claim in verifiable source text, actively catching ambiguities, and halting work safely when requirements mutate.

---

## 2. What ClarityRail Does: The Four-Part Clarity Contract

ClarityRail operates on a four-part contract designed to protect student cognitive bandwidth:

### I. Cognitive Isolation & Focus Rail
- Rather than presenting an intimidating checklist, the Focus Rail isolates **only the single immediate unblocked action** (e.g., *"Download the lab starter repository from GitHub"*).
- Subsequent tasks are suppressed from the primary visual field to reduce sensory overload, while maintaining instant progress visibility.

### II. Direct Source Evidence Thread
- Every generated step is pinned to its exact origin in the brief with 1-based character boundaries (`Clause #2: [120–195]`).
- Expanding the **"Why this step?"** drawer reveals the literal source sentence from the handout and its structural prerequisites. If a step cannot be proven directly from the brief, our compiler will not emit it.

### III. Proactive Ambiguity Gate
- Before a student spends hours executing a vague requirement, ClarityRail flags hidden traps:
  - **Deadlines**: *"Mentions Friday, but omits an exact cutoff time and time zone."*
  - **Deliverable Formats**: *"Requests submission, but does not specify file format (PDF, ZIP, or repository link)."*
  - **Collaborative Ownership**: *"Task has no assigned team member in a group brief."*
  - **Vague Scopes**: *"Subjective qualifiers like 'detailed' or 'several'."*
- Decisions are answered inline and immutably persisted into local storage.

### IV. Change Impact Guard & Dependency-Safe Detours
- When course handouts are updated mid-semester, the student pastes the new text. ClarityRail computes a clause-level diff and uses topological graph traversal to automatically mark downstream steps **STALE**.
- If a step is marked **BLOCKED** (e.g., waiting for lab cluster access or instructor clarification), the **Dependency-Safe Detour** algorithm identifies alternate, unblocked branches so the student can keep moving forward without violating prerequisite chains.

---

## 3. How We Built It: Pure Deterministic Architecture

ClarityRail is engineered as a zero-cloud, 100% client-side Progressive Web Application (PWA):

```
┌─────────────────────────────────────────────────────────────┐
│                 ClarityRail Local Workspace                 │
│                                                             │
│  ┌────────────────┐     ┌────────────────────────────────┐  │
│  │ Raw Assignment │ ──> │ Deterministic Compiler Engine  │  │
│  │ Brief or Notes │     │  • Clause Segmenter            │  │
│  └────────────────┘     │  • Imperative Extractor        │  │
│                         │  • Topological Dependency DAG  │  │
│                         │  • Deterministic Ambiguity     │  │
│                         └──────────────┬─────────────────┘  │
│                                        │                    │
│                                        ▼                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Execution Rail State Machine                          │  │
│  │   PROPOSED ──> READY ──> IN_PROGRESS ──> DONE         │  │
│  │      │           ▲                                    │  │
│  │      ▼           │                                    │  │
│  │   BLOCKED ──> [Safe Detour]                           │  │
│  │      │                                                │  │
│  │   Source Revised ──> STALE ──> [Review & Revalidate]  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                        │                    │
│                                        ▼                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Local Persistence & Sensory Layer                     │  │
│  │  • Dexie / IndexedDB + localStorage fallback          │  │
│  │  • Interruption Recovery Capsule                      │  │
│  │  • High Contrast / Reduced Motion / WCAG 2.1 AA       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

- **Core Engine**: Pure TypeScript without neural black-boxes. 100% deterministic repeatability across runs.
- **Client Framework**: React 19, TypeScript 5.8, Vite 6, Zustand state orchestration.
- **Storage**: IndexedDB via Dexie with automatic fallback to localStorage and memory. Zero remote databases.
- **Accessibility & Sensory Support**:
  - Semantic HTML landmarks with keyboard skip links.
  - High Contrast (Dark & Vivid) and Warm Paper (Default Editorial) palettes.
  - Reduced-motion toggle disabling CSS animations for vestibular sensitivity.
  - Text scaling (100%, 112.5%, 125%) with responsive layouts tested down to 320px mobile viewports.

---

## 4. Empirical Evaluation & Quality Gate Verification

We hold ClarityRail to rigorous engineering standards:

| Metric | Target | Verified Value | Status |
|---|---|---|---|
| **Unit Test Count** | $\ge 50$ tests | **60 Vitest tests** | **PASS** |
| **Statement Coverage** | $\ge 85\%$ | **91.87%** | **PASS** |
| **Branch Coverage** | $\ge 80\%$ | **81.22%** | **PASS** |
| **Function Coverage** | $\ge 85\%$ | **87.17%** | **PASS** |
| **Line Coverage** | $\ge 85\%$ | **91.87%** | **PASS** |
| **Action Extraction F1** | $\ge 0.90$ | **0.969** (Recall: 0.939, Prec: 1.0) | **PASS** |
| **Ambiguity Detection Recall** | $\ge 0.90$ | **0.914** | **PASS** |
| **Deterministic Repeatability** | $100\%$ | **100% across 40 briefs** | **PASS** |
| **Stale Propagation Accuracy** | $100\%$ | **100% across DAG mutations** | **PASS** |
| **Cross-Device E2E Tests** | All passing | **28 tests across 7 viewports** | **PASS** |
| **Axe Accessibility Audit** | 0 critical/serious | **0 violations across all routes** | **PASS** |
| **Security & Key Audit** | 0 leaks | **0 vulnerabilities (npm audit)** | **PASS** |

---

## 5. Judge Quick-Start: 60-Second Test Protocol

Judges can explore the entire four-part contract immediately:

1. **Visit the Live Application**: [https://abhijeetnardele24-hash.github.io/clarityrail/](https://abhijeetnardele24-hash.github.io/clarityrail/)
2. **Click Any Synthetic Fixture** under *Judge Quick-Start*:
   - `CS 401 Final Assignment` (Academic with deadline ambiguity)
   - `Bioinformatics Capstone` (Collaborative with unowned roles)
   - `Campus Innovation Grant` (Administrative with format gaps)
3. **Inspect the Evidence**: Click *"Why this step?"* to verify the exact source clause.
4. **Resolve Ambiguity**: Answer the inline deadline or deliverable format question.
5. **Test Safe Detour**: Click *"Mark as Blocked"* on a prerequisite step to view the detour recommendation.
6. **Trigger Change Impact**: Click *"Edit Source Brief"*, alter Clause 1, and watch the active step transition to **STALE**.
7. **Export Handoff**: Open *"Review & Handoff"* to inspect the Interruption Recovery Capsule and copy a Markdown standup report.
