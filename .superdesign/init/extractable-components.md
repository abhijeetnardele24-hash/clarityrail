# Extractable components

## Header
- Source: `src/ui/components/Header.tsx`
- Category: layout
- Description: Persistent brand/navigation/privacy header.
- Extractable props: activeRoute, hasSession, theme.
- Hardcoded: ClarityRail name, Lucide Compass/Shield/Settings icons, navigation labels.

## FocusRail
- Source: `src/ui/components/FocusRail.tsx`
- Category: basic
- Description: Primary evidence-linked action workspace.
- Extractable props: activeStep, stepNumber, totalSteps, completedCount, evidenceExpanded.
- Hardcoded: action hierarchy and status visual language.

## StatusBadge
- Source pattern: `.badge*` in `src/ui/styles/index.css`
- Category: basic
- Description: Evidence/state classification badge.
- Extractable props: label, tone.

## Footer
- Source: `src/App.tsx`
- Category: layout
- Description: Event attribution and bounded privacy statement.
- Extractable props: none.
