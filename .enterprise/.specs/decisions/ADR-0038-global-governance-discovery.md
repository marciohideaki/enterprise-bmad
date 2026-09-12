# ADR-0038 — Global governance discovery before absence claims

**Status:** Accepted
**Date:** 2026-09-12
**Authors:** Platform Governance
**Affects Standards:** specification-consumption, automated-validation, portable instructions and hook registry
**Supersedes:** N/A
**Superseded By:** N/A

## Context

An analysis of a consumer treated missing local instruction files as a governance
gap without first consulting its available global HSEOS producer. Existing rules
require authoritative references, but navigation reminders were local and optional.

## Decision

We will resolve governance from the installed producer, check source freshness at every supported prompt and deliver only a minimal
capsule when session/project/source state has changed, and require explicit fallback checks on other
adapters. Missing required sources fail discovery. Unknown application/enforcement
must never become an absence claim. Other producers require independent evidence.

Implementation and conformance: [hardening note](../../../docs/governance-discovery-hardening.md).
Canonical consumption rule: [discovery policy](../../policies/governance-discovery.md).

## Consequences

- Empty consumers can inherit global standards without copied project overlays.
- Context reload is deterministic in the supported hook path. Lifecycle events invalidate session receipts; unchanged prompts inject zero bytes.
- The hook adds a bounded capsule on cache misses and blocks its event if required
  producer files are unavailable. Repair discovery rather than infer absence.
- In-process hooks are not tamper-proof enforcement or proof of comprehension.
  CI, protected branches and human review retain their separate responsibilities.
- Existing immutable releases require a new distribution; this proposal does not
  silently activate AEW or claim all clients support native hooks.

## Alternatives

Local AGENTS files alone duplicate governance and leave global discovery unresolved.
A once-per-day reminder misses compaction and project switches. Regex checks on
the final answer can be bypassed by paraphrases and cannot establish source coverage.

## Compliance

The owner authorized implementation, repository merge and mechanical global harness
distribution on 2026-09-12. Native startup, deduplication, manual compaction and
resume were validated on both configured clients. Corporate AEW activation and
registry publication remain separate from this delivery.
