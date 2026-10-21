# ClarityRail — Concept Decision Record & Differentiation Analysis

> **Document Type**: Architecture Decision Record & Product Strategy  
> **Status**: APPROVED & LOCKED  
> **Target Challenge**: Taskforge Hackathon 2026 (<https://taskforge.devpost.com/>)  

---

## 1. Product Thesis

> **Turn an overwhelming brief into one clear, traceable next step—without hiding uncertainty or requiring the user to remember prior context.**

Taskforge does not reward raw feature count. The competition brief specifically asks for **one user**, **one productivity or access barrier**, and **a visible, meaningful change**:

- **Target Persona**: A university student who comprehends academic or project subject matter but experiences severe initiation paralysis when instructions are long, multi-layered, or ambiguous.
- **The Core Barrier**: The student must mentally retain and reconcile too many competing details before they can identify where or how to begin.
- **The Meaningful Change**: Transforming dense, unstructured text into a local-first, source-linked execution rail presenting exactly one valid next action, transparent ambiguity status, and automated invalidation when instructions change.

---

## 2. Concept Pressure Test

Before locking product scope, four candidate product directions were evaluated against the official Taskforge judging dimensions:

| Candidate Direction | Brief Fit (25) | Demo Clarity (20) | Originality (20) | Technical Proof (15) | Accessibility Depth (10) | Feasibility (10) | Total / 100 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| Generic AI Task Planner | 20 | 16 | 7 | 10 | 6 | 8 | 67 |
| Resume-Capsule-Only Tool | 22 | 17 | 11 | 10 | 8 | 9 | 77 |
| Accessible Group Handoff Board | 22 | 16 | 14 | 12 | 8 | 8 | 80 |
| **ClarityRail: Evidence-Bound Execution Rail** | **25** | **20** | **18** | **15** | **10** | **9** | **97** |

*Note: The score table above represents an internal comparative decision tool, not an external forecast of judging results.*

---

## 3. Nearest Competing Product Patterns & Gaps

| Existing Product Pattern | Incumbent Strengths | Critical Gap Addressed by ClarityRail |
| :--- | :--- | :--- |
| **Goblin Tools (Magic ToDo)** | High-level recursive task breakdown; estimated subtask effort. | Breaks tasks without source traceability. If the original brief changes, subtasks do not update. Ambiguities are flattened or hallucinated. |
| **Tiimo** | Visual schedules, routines, calendar integration, sensory-friendly icons. | Manages daily time allocation rather than decomposing a specific dense academic assignment into an auditable dependency chain. Requires account. |
| **Motion / Reclaim** | Cloud-based automatic calendar prioritization and rescheduling. | Requires calendar permissions, expensive cloud subscription, zero source clause lineage, and no local offline privacy. |
| **Standard To-Do Checklists** (Todoist, Things, Apple Reminders) | Broad task storage, tags, project lists. | Creates backlog dread. Facing a list of 40 tasks exacerbates executive function paralysis instead of isolating one immediate next step. |

---

## 4. The Four-Part Clarity Contract

Generic task breakdown, focus timers, and basic resume summaries are established patterns. ClarityRail differentiates itself through a formal four-part **Clarity Contract**:

```
[Raw Brief] ──► (1) Evidence Thread: Every action links to exact source clause
                    │
                    ▼ (2) Ambiguity Gate: Missing deadlines/owners remain open decisions
                    │
                    ▼ (3) Change Impact Guard: Edited clauses propagate STALE state
                    │
                    ▼ (4) Dependency-Safe Detour: Blocked step yields strictly eligible work
```

1. **Evidence Thread**:
   - Every generated plan step maintains an immutable reference to the exact ordinal source clauses from which it was derived.
   - The user can inspect the "Why this step?" disclosure at any moment to see the verbatim source evidence.
   - The system never manufactures deliverables or deadlines not present in the source.

2. **Ambiguity Gate**:
   - Instead of guessing unspecified parameters, missing facts (e.g., submission format, missing owner, unstated time zone) are isolated into explicit decision items.
   - Tasks depending on open ambiguities cannot enter the active rail until confirmed or explicitly acknowledged as assumptions by the user.

3. **Change Impact Guard**:
   - When a professor, team leader, or client issues a revised brief, ClarityRail creates a versioned revision and computes a clause-level diff.
   - Directly affected steps are immediately marked `STALE`.
   - Staleness propagates transitively through downstream dependency edges.
   - Stale steps are blocked from execution until the student explicitly reviews and acknowledges the revision.

4. **Dependency-Safe Detour**:
   - If an active step is blocked (e.g., waiting for lab access or partner code), ClarityRail does not dump the entire backlog onto the student.
   - It computes the dependency graph and offers *only* tasks that are `READY`, whose prerequisites are fully met, and that do not lie downstream of any unresolved or stale step.
   - It provides a single-sentence explanation of why the detour is safe to execute.

---

## 5. Architectural Commitment

- **Local-First & Zero Network Dependency**: The core compiler is 100% deterministic pure TypeScript. No external API key, server, or cloud model is required to complete the golden journey.
- **Cognitive Accessibility as Mechanism**: Minimizing working memory load, clear single-focus views, interruption recovery, and zero forced time limits are woven directly into the state machine and data model.
