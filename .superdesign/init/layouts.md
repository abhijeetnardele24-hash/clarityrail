# Shared layouts

## Application shell
- Path: `src/App.tsx`
- Full structure: skip link → live announcer → persistent Header → route outlet → evidence-aware footer.

```tsx
return (
  <div className="app-shell">
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <LiveAnnouncer />
    <Header />
    <div className="app-main"><Routes>{/* capture, rail, review, evidence, settings */}</Routes></div>
    <footer role="contentinfo">ClarityRail — one clear, traceable next step.</footer>
  </div>
);
```

## Content container
- `.container` in `src/ui/styles/index.css`
- Fluid width, `max-width: 1140px`, centered with responsive padding.
