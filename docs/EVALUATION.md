# Evaluation

## Deterministic benchmark

The checked-in evaluation corpus contains 40 synthetic briefs covering academic, collaborative, and administrative patterns. Expected actions and ambiguity labels are authored fixtures, not real-user research.

| Metric | Current result |
|---|---:|
| Action precision | 1.000 |
| Action recall | 0.939 |
| Action F1 | 0.969 |
| Ambiguity recall | 0.914 |
| Unsupported emitted steps in corpus | 0 |
| Repeatability | 100% |
| Stale propagation accuracy | 100% |
| Safe-detour fixture accuracy | 100% |

These figures describe this corpus and implementation version only. They do not establish performance on arbitrary documents.

## Software verification

- 78 Vitest unit/component tests.
- Coverage: 92.03% statements, 81.40% branches, 87.50% functions, and 92.03% lines.
- 33 Playwright executions: four core scenarios across seven responsive profiles plus five deep Chromium scenarios.
- Deep checks cover offline reload after initial installation, persistence, stale state after reload, dialog focus behavior, runtime/page errors, horizontal overflow, Axe, and reduced motion.
- Production dependency audit uses `npm audit --omit=dev --audit-level=high`.
- Full-history secret scan refuses a shallow Git checkout.

## Evidence provenance

`docs/verification-results.json` is generated only after fresh unit, coverage, benchmark, browser, Axe, and build artifacts exist. The generator fails on missing, stale, failed, skipped, or flaky evidence. CI uploads the underlying machine artifacts for independent inspection.

## Known limits

- English-language rule coverage is finite and grammar based.
- Character offsets are evidence pointers, not semantic proof that a user interpreted the source correctly.
- Synthetic benchmark composition may not represent real institutional documents.
- Automated Axe scans cover selected states and do not substitute for manual assistive-technology testing.
- Offline verification covers the installed application shell and locally persisted sessions, not uncached external destinations.
