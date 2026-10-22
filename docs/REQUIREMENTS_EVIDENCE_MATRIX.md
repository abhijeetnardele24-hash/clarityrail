# ClarityRail — Requirement-to-Evidence Matrix

> **Event**: Taskforge Hackathon 2026 (<https://taskforge.devpost.com/>)  
> **Purpose**: Explicitly maps every published Taskforge rule, constraint, and judging dimension directly to concrete implementation code, automated test suites, documentation, and live demonstration proofs.

---

## 1. Hackathon Eligibility & Rules Matrix

| Taskforge Rule / Constraint | ClarityRail Specification & Implementation | Verification & Evidence Artifact |
| :--- | :--- | :--- |
| **Originality & Build Period**<br>(Created 18–25 Oct 2026) | Initialized in empty repository on 21 Oct 2026. Zero pre-existing code copied. | Git initial commit SHA, [`HACKATHON_CHANGELOG.md`](../HACKATHON_CHANGELOG.md), [`PRIOR_WORK_DISCLOSURE.md`](../PRIOR_WORK_DISCLOSURE.md) |
| **Core Challenge Brief**<br>(Accessible tool helping focus, organize, or complete a task) | Local-first cognitive-accessibility workspace resolving task-initiation paralysis by converting briefs into a single, traceable next step. | Working web application, [`docs/CONCEPT_DECISION.md`](./CONCEPT_DECISION.md), [`README.md`](../README.md) |
| **Required Framing**<br>(One user, one barrier, meaningful change) | **User**: University student.<br>**Barrier**: Working memory overload before starting.<br>**Change**: Evidence-linked single-step execution rail with change-impact protection. | [`README.md`](../README.md), [`docs/DEVPOST_SUBMISSION.md`](./DEVPOST_SUBMISSION.md), UI Landing & Focus Rail |
| **Working Prototype**<br>(Judges can test independently) | Static, zero-backend PWA deployed to GitHub Pages. Operates 100% locally in browser memory. | Live URL: `https://abhijeetnardele24-hash.github.io/clarityrail/`, automated Playwright E2E suite |
| **Build Instructions & Open Source** | Clean npm scripts for build, dev, test, and verification. MIT License. | [`README.md`](../README.md), [`LICENSE`](../LICENSE), `package.json` |
| **AI Disclosure** | Honest disclosure of Antigravity pair-programming assistance and deterministic local rule engine. | [`AI_ASSISTANCE.md`](../AI_ASSISTANCE.md) |

---

## 2. Published Judging Dimensions Matrix

| Evaluation Dimension | Weight & Focus | ClarityRail Engineering Implementation | Concrete Proof Artifact |
| :--- | :--- | :--- | :--- |
| **Usefulness & Impact** | Practical real-world relief for task paralysis. | Solves the specific moment of receiving complex briefs. Eliminates anxiety through single-step focus, explicit ambiguity resolution, and resume capsules. | Demo synthetic briefs (Coursework, Group Project, Bureaucracy), user journey tests |
| **Technical Execution** | Software reliability, architecture depth, test coverage. | Deterministic compiler, versioned source clauses, dependency DAG, cycle detection, transitive stale propagation, canonical SHA-256, and Dexie IndexedDB. | 78 Vitest tests, coverage above configured thresholds, 33 Playwright executions, and runtime-error checks |
| **Accessibility** | Usable by diverse cognitive, motor, visual needs. | Semantic landmarks, live regions, skip links, keyboard dialogs, Atkinson Hyperlegible typography, 320px reflow, and reduced motion. | Automated Axe scans report zero serious/critical findings in tested states; see [`docs/ACCESSIBILITY.md`](./ACCESSIBILITY.md) |
| **Originality** | Novel solution beyond standard checklist apps. | The four-part **Clarity Contract**: Evidence Thread (clause lineage), Ambiguity Gate, Change Impact Guard (source revision diff & stale invalidation), and Dependency-Safe Detour. | [`docs/CONCEPT_DECISION.md`](./CONCEPT_DECISION.md), [`docs/assets/state-lifecycle.svg`](./assets/state-lifecycle.svg), unit tests |
| **Presentation & Polish** | Clarity of explanation, judge path, design aesthetic. | Calm, editorial warm-paper theme; hand-crafted vector architecture and state-lifecycle diagrams; 60s judge walkthrough; concise demo script. | [`README.md`](../README.md), [`docs/DEMO_SCRIPT.md`](./DEMO_SCRIPT.md), [`docs/assets/architecture.svg`](./assets/architecture.svg) |
