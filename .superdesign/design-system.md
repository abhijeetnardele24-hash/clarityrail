# ClarityRail design system

ClarityRail is a calm execution instrument for students experiencing working-memory overload. It must feel like a trustworthy academic field notebook crossed with a precise railway control surface—not a generic AI dashboard.

## Visual principles
1. One action dominates each screen.
2. Evidence is visible but secondary until requested.
3. State changes are encoded with label + icon + color, never color alone.
4. Warm paper reduces clinical harshness; navy ink preserves authority.
5. Cobalt means action, amber means uncertainty/staleness, green means confirmed/done.
6. No neon, purple gradients, glass panels, stock illustrations, or decorative dashboard clutter.

## Typography and tokens
Use only the values summarized in `.superdesign/init/theme.md`. Manrope is reserved for short headings; Atkinson Hyperlegible is used for interface and reading text. Evidence identifiers use the monospace token.

## Layout
The capture page uses a judge-readable narrative followed by one input surface and three realistic fixtures. The rail page uses a dominant next-action card with a compact provenance spine and supporting ambiguity/revision/recovery surfaces below. Preserve 44px targets and reflow without horizontal scrolling at 320px.

## Motion
Use 150–250ms opacity/translation and border emphasis. Disable nonessential motion for `prefers-reduced-motion`. Do not animate stale states indefinitely.
