# Privacy boundary and threat model

## Data flow

During ordinary use, brief text, generated steps, decisions, and preferences remain in browser-managed storage. ClarityRail has no application backend, user account, analytics SDK, or model API. An explicit export writes a user-selected local file or clipboard value.

## Protected assets

- Assignment and project brief text
- Ambiguity answers and progress state
- Revision history and recovery capsules
- User preferences

## Considered threats and controls

| Threat | Control | Residual risk |
|---|---|---|
| Accidental network disclosure | Static app; no brief-upload code path; dependency and source audit | Browser extensions, compromised device, or modified build can observe page data |
| Stale instructions | Clause diff plus transitive `STALE` propagation | Semantically equivalent rewording may still require review |
| Fabricated integrity claims | Canonical SHA-256 implementation and test vectors | Digest does not prove identity, time, or authorship |
| Lost local data | JSON export and recovery capsule | Clearing browser data can remove sessions |
| Malicious imported content | Rendered as text; no HTML execution path | Extremely large input may affect browser performance |
| Secret leakage in repository | Full-history configured-pattern scan in non-shallow CI checkout | Pattern scanners cannot detect every possible secret format |

## Non-goals

ClarityRail does not provide end-to-end encryption, multi-user authorization, a trusted timestamp service, clinical advice, or guaranteed confidentiality on a shared or compromised device.
