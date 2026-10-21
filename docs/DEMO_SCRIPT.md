# ClarityRail — Official 3:30 Hackathon Demonstration Script & Storyboard

**Target Duration**: 3:20 – 3:40 (210 seconds total)  
**Hackathon**: Taskforge 2026 Challenge  
**Application**: [ClarityRail](https://github.com/abhijeetnardele24-hash/clarityrail)  
**Key Value Proposition**: From messy instructions to one clear, traceable next step. A local-first cognitive-accessibility workspace for students experiencing task paralysis.

---

## Storyboard Overview & Timing Map

| Scene | Timestamp | Duration | Scene Title & Core Concept | Primary Visual Action |
|---|---|---|---|---|
| **1** | 0:00 – 0:35 | 35s | The Task Paralysis Gap & Ambiguous Briefs | Raw multi-page assignment brief; cognitive friction |
| **2** | 0:35 – 1:15 | 40s | 1-Click Compilation & Deterministic Pipeline | Judge Quick-Start button; instant graph generation |
| **3** | 1:15 – 2:00 | 45s | The Focus Rail & Direct Source Evidence Thread | Single active step; "Why this step?" source drawer |
| **4** | 2:00 – 2:35 | 35s | The Ambiguity Gate & In-Situ Decisions | Missing timezone/format resolution inline |
| **5** | 2:35 – 3:05 | 30s | Change Impact Guard & Dependency-Safe Detour | Brief revision triggering STALE; detour banner |
| **6** | 3:05 – 3:25 | 20s | Interruption Recovery Capsule & Handoff Export | Export modal, Markdown copy, sensory settings |
| **7** | 3:25 – 3:35 | 10s | Verification Architecture & Production Standards | Test suite, offline privacy boundary, closing call |

---

## Scene-by-Scene Audio & Visual Script

### Scene 1: The Problem & Task Paralysis Gap (0:00 – 0:35 | 35s)

**Visuals**:
- Camera displays a dense, unformatted 800-word university lab handout containing buried requirements, vague deadlines (“submit by Friday”), and conflicting collaboration roles.
- Cursor hovers hesitantly over the page, illustrating executive dysfunction and task inertia.

**Voiceover**:
> *"Every student knows this sinking feeling: you open an assignment, and you are hit with three pages of dense instructions, buried deadlines, and unowned group roles. For neurodivergent learners and anyone under high cognitive load, this friction triggers immediate task paralysis—not because the work is hard, but because deciding what to do first is overwhelming.*
>
> *Existing AI tools summarize text into even more words. They hallucinate non-existent steps, change their output on every prompt, and send private student work to cloud servers.*
>
> *This is why we built **ClarityRail**."*

---

### Scene 2: 1-Click Compilation & Pure Deterministic Pipeline (0:35 – 1:15 | 40s)

**Visuals**:
- Browser navigates to ClarityRail landing page (`#/`).
- Highlight the 60-Second Judge Quick-Start section. Click the **"Load & Compile: CS 401 — Distributed Systems"** fixture.
- The interface instantaneously compiles the brief into an interactive rail in under 15 milliseconds without external API round-trips.

**Voiceover**:
> *"ClarityRail is a local-first cognitive-accessibility workspace that turns messy briefs into one clear, verifiable next action.
>
> To let judges test every subsystem immediately, we provide 1-click pre-annotated synthetic fixtures right on the landing page. Let's load the CS 401 Distributed Systems assignment.
>
> In just 12 milliseconds, our pure TypeScript compiler parses the brief. It performs sentence segmentation, extracts action candidates, models dependency prerequisites, detects ambiguities, and anchors every single step directly to its source clause with exact character offsets. Zero AI hallucinations, zero cloud calls, and 100% deterministic repeatability."*

---

### Scene 3: The Focus Rail & Direct Evidence Thread (1:15 – 2:00 | 45s)

**Visuals**:
- The screen transitions to the **Focus Rail** (`#/rail/:sessionId`).
- Full viewport concentrates on Step 1: *"Download the lab starter repository from GitHub"*.
- The secondary and later steps are subdued to prevent cognitive overload.
- Click the **"Why this step?"** expandable drawer.
- The drawer expands, revealing Clause #2 highlighted with exact line and character boundaries: *"Please download the lab starter repository from GitHub."*

**Voiceover**:
> *"Notice the screen: there is no overwhelming list of twenty checkboxes. ClarityRail enforces cognitive isolation—showing only the immediate next actionable step.
>
> But how does the student know they can trust it?
>
> We introduce the **Evidence Thread**. Clicking 'Why this step?' reveals the direct source clause from the original brief. Every step carries an immutable evidence badge linking back to the verified text. If a step cannot be proven from the source, our compiler will not generate it."*

---

### Scene 4: The Ambiguity Gate & In-Situ Decisions (2:00 – 2:35 | 35s)

**Visuals**:
- In the Focus Rail, an amber **Ambiguity Gate** card appears: *"The deadline mentions 'Friday', but omits an exact cutoff time and time zone. Which local time zone applies?"*
- User types `"11:59 PM EST"` into the input box and clicks **"Confirm Decision"**.
- The card updates with a green checkmark: *"Resolved: 11:59 PM EST"*, updating the step metadata and persisting to local storage.

**Voiceover**:
> *"Real-world briefs are full of vague traps: 'submit by Friday' or 'format appropriately'. 
>
> ClarityRail catches these with our deterministic **Ambiguity Gate**. Instead of letting students guess or panic at deadline time, the system detects missing formats, absent time zones, and unassigned owners.
>
> Here, it asks for the missing time zone. The student enters '11:59 PM EST', confirms it, and the decision is permanently recorded in the session record."*

---

### Scene 5: Change Impact Guard & Dependency-Safe Detour (2:35 – 3:05 | 30s)

**Visuals**:
- Click **"Edit Source Brief"**.
- Modify Clause 1 in the textarea: changing GitHub starter to v2 starter. Click **"Apply Revision"**.
- Instantly, the active step turns into a red/amber **STALE** alert: *"Action invalidated due to source brief revision"*.
- Click **"Mark as Blocked"** on a dependency-locked step.
- The **Safe Detour Banner** appears at the top: recommending an alternative, unblocked research action that doesn't depend on the blocked step.

**Voiceover**:
> *"What happens when instructions change mid-project?
>
> If a professor emails an update, our **Change Impact Guard** computes a clause diff. If a source clause changes, all downstream steps are automatically flagged as STALE. The student is prevented from wasting hours on obsolete requirements.
>
> And if a student hits a roadblock—like waiting on hardware access—they can mark the step BLOCKED. Our **Dependency-Safe Detour** algorithm instantly identifies an eligible alternative step that doesn't depend on the blocker, keeping momentum alive without breaking project prerequisites."*

---

### Scene 6: Interruption Recovery Capsule & Handoff Export (3:05 – 3:25 | 20s)

**Visuals**:
- Click **"Review & Handoff"** in the navigation header.
- View the **Interruption Recovery Capsule** showing completed steps, current focus, and remaining actions.
- Click **"Export Handoff Capsule"**.
- Show the modal with copyable Markdown standup summary and downloadable JSON session file.
- Click the **Contrast Toggle** in the header to show the High Contrast theme.

**Voiceover**:
> *"When work is interrupted, the **Interruption Recovery Capsule** brings the student back up to speed in seconds.
>
> Need to update a project partner or instructor? With one click, generate a clean Markdown handoff capsule ready for Slack or email.
>
> The interface also includes high-contrast palettes, reduced motion controls, and WCAG 2.1 AA accessibility out of the box."*

---

### Scene 7: Verification Architecture & Production Standards (3:25 – 3:35 | 10s)

**Visuals**:
- Fast camera pan to terminal showing 60 passing Vitest unit tests (91.9% statements / 81.2% branches), 28 Playwright cross-device checks, and green GitHub Actions badge.
- Closing splash card: *ClarityRail — From messy instructions to one clear, traceable next step.*

**Voiceover**:
> *"ClarityRail is verified by 60 unit tests with over 91% coverage, 28 cross-viewport E2E tests, and zero telemetry. Built for Taskforge 2026. Try the live demo today."*

---

## Technical Director & Screen Recording Notes

1. **Audio Pace**: Maintain an articulate, reassuring 130–140 words-per-minute pace.
2. **Resolution**: Record at 1920x1080 (16:9) at 60fps.
3. **Cursor Motion**: Smooth, deliberate cursor paths with 300ms hover pauses on primary interactive elements.
4. **Theme**: Begin in Warm Paper editorial theme; switch to High Contrast at 3:18 to demonstrate sensory accommodation.
