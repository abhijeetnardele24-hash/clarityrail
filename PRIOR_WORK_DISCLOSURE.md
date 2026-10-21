# ClarityRail — Prior Work & Pre-Existing IP Disclosure

> **Event**: Taskforge Hackathon 2026 (<https://taskforge.devpost.com/>)  
> **Rule Reference**: Section 1 of Taskforge Rules — "The project must be original and created during the event period."

---

## 1. Originality Declaration

ClarityRail is an **original software project created entirely during the official Taskforge build window** (18 October 2026, 06:15 IST through 25 October 2026, 02:30 IST).

- **No pre-existing application codebase, proprietary algorithm, private repo, or UI template was copied or adapted.**
- The project repository was initialized from an empty directory on 21 October 2026.
- All product architecture, TypeScript domain types, deterministic compiler rules, state-machine transitions, revision-diff logic, and UI components were written specifically for this challenge.

---

## 2. Open-Source Libraries & Public Standards

ClarityRail utilizes standard, publicly available open-source software libraries and design references, none of which constitute proprietary pre-existing project code:

| Library / Standard | Role in ClarityRail | License |
| :--- | :--- | :--- |
| **React 19 & React DOM** | View presentation layer | MIT |
| **TypeScript (v5.x)** | Strict compile-time type safety | Apache-2.0 |
| **Vite (v6.x)** | Local dev server and production asset bundler | MIT |
| **React Router (v7.x)** | Local client-side routing | MIT |
| **Zustand (v5.x)** | Minimalist predictable local state store | MIT |
| **Dexie.js (v4.x)** | Structured, promise-based IndexedDB persistence | Apache-2.0 |
| **Zod (v3.x)** | Runtime schema validation for exports & migrations | MIT |
| **Lucide React** | Clean, accessible SVG iconography | ISC |
| **Workbox / Vite PWA** | Service Worker registration and offline shell caching | MIT |
| **Vitest & Testing Library** | Unit and component test runner | MIT |
| **Playwright & Axe-Core** | Cross-viewport E2E runner & automated accessibility audits | Apache-2.0 |
| **Atkinson Hyperlegible Font** | High-legibility body typography by Braille Institute | OFL-1.1 |
| **Manrope Font** | Display heading geometric sans-serif by Mikhail Sharanda | OFL-1.1 |

---

## 3. Academic & Public Domain Concept Prior Art

The design of ClarityRail draws inspiration from established, publicly published cognitive-accessibility and prospective-memory research:

1. **W3C Cognitive Accessibility Guidance (COGA)**:
   - *Pattern*: Provide clear step-by-step navigation, avoid reliance on working memory from earlier steps, preserve orientation, and support interruption recovery without data loss.
   - Reference: <https://www.w3.org/WAI/WCAG2/supplemental/patterns/o6p05-low-cognition/>

2. **GOV.UK Step-by-Step Navigation Pattern**:
   - *Pattern*: Structuring sequential processes with explicit parallel and alternative paths.
   - Reference: <https://design-system.service.gov.uk/patterns/step-by-step-navigation/>

3. **Gollwitzer Implementation Intentions Research**:
   - *Concept*: Cue-action planning ("When situation X occurs, I will execute action Y") to reduce cognitive initiation barriers.
   - Reference: Gollwitzer, P. M. (1999). *Implementation intentions: Strong effects of simple plans.* American Psychologist, 54(7), 493–503.

No proprietary code or private assets from any research organization or commercial entity were used.
