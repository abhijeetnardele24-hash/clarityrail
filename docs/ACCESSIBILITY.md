# Accessibility scope

ClarityRail treats cognitive load, keyboard access, reflow, contrast, and motion as product requirements.

## Implemented behavior

- One-action primary focus with later tasks visually subordinate.
- Semantic headings, landmarks, lists, forms, and status regions.
- Skip link to `#main-content`.
- Keyboard-operable dialogs with initial focus, focus trap, Escape close, and trigger-focus restoration.
- Navigation links retain accessible names when compact mobile labels are visually hidden.
- Export previews are keyboard-focusable when scrollable.
- Warm-paper and high-contrast themes, text scaling, and explicit focus rings.
- `prefers-reduced-motion` reduces animations and transitions.
- Layout assertions cover 320, 360, 390, 768, 1024, 1440, and 1920 pixel viewports.

## Automated evidence

Playwright records Axe results on the landing page, active revised rail, export dialog, evidence route, and settings state. Current verification reports zero serious or critical findings in those tested states. Keyboard, focus restoration, overflow, and reduced-motion behavior have dedicated assertions.

## Limits

Automated checks are not an accessibility certification. The project does not claim completed moderated testing with screen-reader users, switch users, or people with lived experience. Manual testing with NVDA, VoiceOver, keyboard-only users, and cognitive-accessibility participants is planned.
