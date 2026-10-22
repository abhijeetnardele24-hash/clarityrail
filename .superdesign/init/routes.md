# Route map

Router: `HashRouter` in `src/App.tsx`.

| URL | Component | Purpose |
|---|---|---|
| `#/` | `src/ui/routes/CaptureRoute.tsx` | Judge-first landing, brief capture and synthetic fixtures |
| `#/rail/:sessionId` | `src/ui/routes/RailRoute.tsx` | Active next action, evidence, ambiguity, detour and revision guard |
| `#/compile/:sessionId` | `src/ui/routes/RailRoute.tsx` | Compatibility alias for rail |
| `#/review/:sessionId` | `src/ui/routes/ReviewRoute.tsx` | Plan lineage and export handoff |
| `#/evidence` | `src/ui/routes/EvidenceRoute.tsx` | Product evidence, limitations and methodology |
| `#/settings` | `src/ui/routes/SettingsRoute.tsx` | Contrast, text scale, density and local-data controls |

Every page uses the application shell in `src/App.tsx` and `Header.tsx`.
