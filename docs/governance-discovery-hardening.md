# Governance discovery hardening

Artifact: implementation and validation note. Scope: global producer discovery.
Authority: Constitution §2.3/§2.5, specification-consumption, automated-validation.

A consumer lacking AGENTS.md was incorrectly used as evidence that conventions
needed local consolidation, despite an available global producer. The correction
must occur in discovery and instruction delivery, not by copying core standards.

`hseos governance-context --directory <consumer> --json` reads the producer baseline
independently of the consumer cwd, emits SHA-256 source references and explicitly
leaves application, enforcement and other producers unverified. It exits 2 when
required sources cannot be read. It performs no network calls or state writes.

The prompt hook checks required sources and fingerprints the Markdown governance
corpus on every prompt. It emits a short navigation capsule only when needed;
unchanged prompts emit zero bytes, including zero JSON envelopes. Full documents
and hashes stay out of automatic context and remain available through explicit CLI
JSON discovery. Applicable standards still need to be read before decisions.

With `--cache`, receipts bind adapter/session, the current consumer's real path,
producer/corpus hashes, handler versions and consumer/ancestor AGENTS/CLAUDE files.
Local consumer governance overlays are also fingerprinted. A project round trip
reloads context, rather than assuming an earlier project's rules remain salient.

`SessionStart`, `PreCompact` and `SessionEnd` invalidate receipts. SessionStart also
emits the capsule immediately, before autonomous resumed execution. The prompt hook
will not deduplicate until a lifecycle event has initialized that adapter/session.
A separate epoch prevents a late concurrent receipt from undoing invalidation.
Receipts expire after 24 hours. Missing identity, corrupt or unwritable cache causes
reinjection, never silent suppression. Missing required sources still fail even on
cache hits; a failed lifecycle invalidation is explicit. No prompts/transcripts are
persisted. State is private local JSON under `~/.local/state/hseos/governance-context`
(or `HSEOS_GOVERNANCE_CONTEXT_STATE`); session identifiers are hashed into filenames.
This is disposable delivery state, not canonical memory or authorization.

The compiler copies both dependency-free handlers and emits the Claude lifecycle
adapter. Manual CLI discovery remains read-only and uncached. Native clients that
cannot reliably report context loss must keep caching disabled and use explicit
checks. A session initialized by SessionStart does not prove every later lifecycle
event will be delivered; native conformance remains a separate requirement.

This prevents silent omission of the baseline in the supported hook path. It does
not prove semantic compliance, stop arbitrary prose in every client, certify AEW
activation, or replace capability-graph lookup and review of applicable standards.
An installed CLI alone does not prove the hook fired. Validate a new client session
before claiming end-to-end enforcement. A running session may cache its hooks.

Validation: `node --test test/test-governance-context.js` covers source failures,
zero-output repeat prompts, lifecycle invalidation, project round trips, session and
adapter isolation, cache corruption/expiry/unavailability, late receipt races,
path traversal, JSON envelopes and compiled adapters. Run compiler-hook regression
tests as well. Measured byte reductions are recorded in the host validation report;
byte counts are not exact model token counts.

Rollout: distribute both handlers with the canonical policy and required baseline;
configure supported global adapters to invoke its absolute installed path so no
project-local overlay is required. Preserve existing hooks. For adapters without
verified event support, retain the explicit instruction fallback. Never modify
an immutable release in place or manufacture trust records for a new hook.


## Native client conformance — 2026-09-12

[Native evidence](evidence/governance-native-2026-09-12/summary.json) confirms startup,
unchanged-prompt deduplication, manual compaction and new-process resume on Codex
0.154.0 and Claude Code 2.1.263. Codex initially skipped the untrusted hooks; reviewed
native currentHash values were approved via its config API and a fresh hooks/list
confirmed trust. No hook-trust bypass was used.

Both clients reload through SessionStart with source compact. Codex defers that
hook until immediately before the next model request; PostCompact is not a context
injection event. This matches the [official hook contract](https://learn.chatgpt.com/docs/hooks).
Automatic mid-turn compaction was not forced in this smoke; manual compact and the
source:compact delivery path were observed directly. No claims apply to untested
client versions or hosts. Installed local snapshot remains unchanged; no release
or repository merge is implied by host-level validation.


## Mechanical global distribution

The owner authorized merge and global distribution on 2026-09-12. Distribute from
an immutable archive of the merged commit, not from the task worktree. Preserve
existing client hooks and state-store locations. Install the packaged CLI from that
same archive; point governance hooks at its compiled handlers and record hashes,
source commit, package integrity, prior paths and rollback backups. Approve reviewed
hook currentHash values through the native client API after path changes. Repeat a
fresh-session native startup/dedup smoke against the distributed paths.

This operation is a commit-pinned local distribution, not an npm registry release.
The distribution manifest and immutable directory identify the merged revision.
