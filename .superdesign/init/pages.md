# Page dependency trees

## `/` Capture
- `src/ui/routes/CaptureRoute.tsx`
  - `src/application/store.ts`
  - `src/domain/fixtures.ts`
  - `src/ui/components/Header.tsx` via `src/App.tsx`
  - `src/ui/styles/index.css`
  - `src/ui/styles/tokens.css`

## `/rail/:sessionId` Focus Rail
- `src/ui/routes/RailRoute.tsx`
  - `src/ui/components/FocusRail.tsx`
  - `src/ui/components/SafeDetourBanner.tsx`
  - `src/ui/components/AmbiguityGate.tsx`
  - `src/ui/components/ChangeImpactGuard.tsx`
  - `src/ui/components/ResumeCapsule.tsx`
  - `src/application/store.ts`

## `/review/:sessionId`
- `src/ui/routes/ReviewRoute.tsx`
  - `src/ui/components/HandoffExportModal.tsx`
  - `src/adapters/export.ts`

## `/evidence`
- `src/ui/routes/EvidenceRoute.tsx`

## `/settings`
- `src/ui/routes/SettingsRoute.tsx`
  - `src/application/store.ts`
  - `src/adapters/persistence.ts`
