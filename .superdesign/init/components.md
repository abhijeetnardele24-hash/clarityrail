# Shared UI components

The project uses custom React components and Lucide icons; there is no third-party component library. Source files are deliberately small and are passed directly to design calls.

## Header
- Path: `src/ui/components/Header.tsx`
- Shared application header with brand, privacy state, navigation and contrast control.

```tsx
export const Header: React.FC = () => {
  const location = useLocation();
  const currentSession = useAppStore((state) => state.currentSession);
  const preferences = useAppStore((state) => state.preferences);
  const updatePreferences = useAppStore((state) => state.updatePreferences);
  const toggleTheme = () => updatePreferences({ theme: preferences.theme === "warm-paper" ? "high-contrast" : "warm-paper" });
  return <header role="banner">{/* brand, local/offline badge, route navigation, contrast control */}</header>;
};
```

## FocusRail
- Path: `src/ui/components/FocusRail.tsx`
- Dominant next-action surface with progress, status, cue, evidence disclosure and completion/block/breakdown actions.

```tsx
interface FocusRailProps {
  session: RailSession;
  activeStep: PlanStep;
  supportingClauses: SourceClause[];
  onMarkDone: (stepId: string) => void;
  onMarkBlocked: (stepId: string) => void;
  onBreakDown: (stepId: string, subtasks: string[]) => void;
}
```

## Supporting workflow components
- `AmbiguityGate.tsx`: explicit decision capture tied to source clauses.
- `ChangeImpactGuard.tsx`: source revision editor and stale-step review.
- `SafeDetourBanner.tsx`: dependency-safe alternative work explanation.
- `ResumeCapsule.tsx`: interruption-recovery state summary.
- `HandoffExportModal.tsx`: Markdown, text and validated JSON export.
- `LiveAnnouncer.tsx`: polite assistive-technology announcements.

All complete implementations live in the listed files and must be passed unchanged as `--context-file` inputs for a design generation.
