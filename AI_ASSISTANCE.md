# ClarityRail — AI Assistance Disclosure

> **Event**: Taskforge Hackathon 2026 (<https://taskforge.devpost.com/>)  
> **Date**: October 2026  
> **Status**: Full, transparent disclosure of AI assistance and human engineering boundaries  

---

## 1. Executive Summary

In adherence to the Taskforge hackathon rules and Devpost community guidelines regarding AI transparency, this document discloses how artificial intelligence was utilized during the development of ClarityRail.

ClarityRail was built with pair-programming assistance from **Google Antigravity (Advanced Agentic Coding Assistant)**.

Importantly:
- **ClarityRail's core product runtime does NOT depend on a remote or opaque neural AI model.**
- The core runtime transformation engine is a **100% deterministic, local-first rule compiler** that extracts source clauses, identifies imperatives, surfaces ambiguities, tracks dependencies, propagates source revision invalidation, and selects dependency-safe detours without probabilistic guessing or cloud roundtrips.
- An optional experimental LLM assistant layer is strictly feature-flagged off by default and never required for the judged user flow.

---

## 2. Categorized AI Assistance During Development

### 2.1 Code Implementation & Architecture
- **Tool**: Google Antigravity IDE (Gemini 3.8 Flash model).
- **Scope**:
  - Scaffolding the React 19 + TypeScript + Vite project structure.
  - Implementing the pure deterministic compiler pipeline (`src/domain/compiler/`).
  - Constructing the dependency graph algorithms, cycle detection, and revision diff engine (`src/domain/revision/`).
  - Building accessible UI components and automated checks aligned with relevant WCAG success criteria (`src/ui/components/`, `tests/e2e/`).
  - Configuring Dexie/IndexedDB local persistence adapters and migrations.
  - Designing local SVG architecture and state lifecycle diagrams.

### 2.2 Testing & Quality Engineering
- **Scope**:
  - Writing the comprehensive Vitest unit test suite achieving $\ge 85\%$ statement and $\ge 80\%$ branch coverage.
  - Constructing the 40+ brief synthetic benchmark corpus and runner script.
  - Writing Playwright end-to-end tests across 7 viewports (320px to 1920px), keyboard navigation flows, and Axe accessibility audits.
  - Creating the evidence reconciliation validator script (`scripts/verify-evidence.ts`).

### 2.3 Documentation & Copywriting
- **Scope**:
  - Assisting in drafting structured markdown documentation, threat modeling, architecture decision records, and Devpost submission package drafts.
  - Reviewing copy against Taskforge truthfulness constraints to eliminate unsupported claims (e.g., medical claims, unverified encryption, unqualified accessibility conformance).

---

## 3. Human Authorship & Verification

All architecture decisions, product framing, cognitive-accessibility mechanisms (the four-part Clarity Contract: Evidence Thread, Ambiguity Gate, Change Impact Guard, and Dependency-Safe Detour), test pass/fail validations, and live GitHub Pages deployments were engineered, reviewed, and verified by Abhijeet Nardele during the official hackathon window (18 October 2026 – 25 October 2026).
