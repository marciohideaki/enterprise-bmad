# Repository consolidation — 2026-09-07

## Scope and baseline

This audit reconciles the local checkout, remote history, uncommitted files,
compiled artifacts, dependency installation and executable validation against
master `d74df337571b34bb0451c1e1f86b4903c7758b8f` (package version 3.4.1).
It closes a workspace recovery task; it does not activate proposed architecture
or certify production services that were not exercised.

The repository had `core.bare=true` while retaining files from the older
`cfdcbbe` checkout. The apparent 807 status entries included 508 staged deletions
caused by this mismatch. Applying that index would have removed current code.
A full archive, all-ref bundle and the genuine old-baseline overlay were saved
before restoring the current tree. No original file was overwritten or lost.

The pre-existing local fixture commit identity was removed so the owner's
global identity applies. An empty detached worktree whose commit is an ancestor
of master was moved into the private archive before pruning its stale Git
registration. Existing historical commits and author metadata were not rewritten.

The private recovery archive is identified in [inventory.json](inventory.json).
Its location is the workspace recovery directory, outside this public repository.
The inventory records file hashes, sizes, classifications and historical branch
comparisons, without publishing recovered credentials or operational state.
The archive is a local recovery copy, not an independently replicated backup.

## Disposition of recovered work

| Recovered material | Count | Disposition |
| --- | ---: | --- |
| Tracked-file overlays against the actual old baseline | 20 | Reviewed individually; adapter filename behavior and sequential-delivery instructions ported; remaining deltas classified below |
| Generated client mirror files | 70 | Preserved privately; current canonical sources retained |
| Local runtime state and evidence | 28 | Preserved privately; no old run, trust store or credentials reactivated |
| Historical audit and goal evidence | 26 | Preserved as historical records, not current acceptance evidence |
| Files already identical to master | 2 | Already consolidated |
| Local configuration backup | 1 | Preserved privately |
| Unapproved credential policy draft | 1 | Preserved privately; not published or adopted |
| Operational-mesh prototype source and tests | 15 | Preserved as a proposal, syntax checked, not integrated into the active runtime |

The 143 untracked files and all 20 real tracked overlays have individual
entries in the inventory. Documentation-only formatting and historical catalog
counts were superseded by current documentation. Generated overlays were not
used as canonical sources. The operational-mesh changes to state emission,
loop verification, skills and their documentation remain a coherent archived
proposal, rather than partial executable changes.

The prototype changes JSONL/SQLite authority and verifier trust. Current governed
execution contracts and ADR-0037 do not authorize adopting those changes merely
because they were present on disk. Syntax checks passing for its 15 files do not
establish functional compatibility. Any revival needs a scoped design decision,
port to current contracts, negative tests and a separate delivery. Consequently,
this consolidation closes the current runtime baseline, not that future proposal.

## Historical branches

There were no open pull requests at the initial remote audit. The branch
inventory covers 17 remote heads (plus the symbolic origin reference).
Contained branches are already integrated; the session-tracking branch is patch
equivalent to the squash merge. Capability branches have rewritten transplants
recorded in the inventory and in the master integration history. Their differing
ancestry is not a reason to merge old trees again.

The machine-rebuild preservation branch contains an empty-tree deletion commit.
It must not be merged as recovered implementation. Historical references are
retained as evidence; they are not active delivery worktrees. No history was
rewritten and no uncontained historical branch was deleted.

The integrity scan found no object corruption and no active stash, but recovered
15 orphan commit tips, 23 trees and 55 blobs. Orphan commit histories were also
preserved in a separate pack. Their dispositions include superseded harness
integrations, release stashes, the same operational overlay, generated metadata,
two truncated-tree commits and historical alternate runtimes. The alternate
March runtime/session/install implementation is preserved for reference, not
silently declared merged into the current architecture. Its paths and commit
identity are available in the inventory. The enforcement-boundary proposal is
already represented by ADR-0035 under its current numbering.

## Functional consolidation

- Normalize emitted agent filenames and reject empty or colliding names; test
  repeated emission and removal of stale generated files.
- Allocate the supervised executable in an atomic private temporary directory,
  retaining directory mode 0700, executable mode 0500, explicit sandbox mapping,
  binary integrity checks and cleanup. Remove the workstation-specific path.
- Keep hardlink rejection fixtures on a shared filesystem so the test reaches
  the rejection assertion on hosts with separate temporary mounts.
- Remove tracked dependency installation metadata; retain the authoritative root
  lockfile and remediate its vulnerable transitive dependencies.
- Restore sequential resource-intensive delivery instructions.
- Normalize the files reported by the repository formatter and run PostgreSQL
  integration against an isolated database; enable that integration in both
  required CI Node.js matrix jobs.

## Validation and limits

The local full `npm test` suite passed on Node.js 24.15.0, including ESLint and
schema checks. `agent-core compile --check` passed 222 checks without mutation.
The separately configured PostgreSQL 18 integration passed 15 tests with zero
skips, exercising migration, RLS, transaction rollback and repository contracts.
The root lockfile audit reported zero vulnerabilities after remediation.
Formatting is checked across the repository, including the normalized files.

Final task validation and pre-commit gates rerun against the staged consolidated
tree. The pull request supplies the authoritative CI results for Node.js 20 and
22 and the standalone installation environment. Temporary execution logs and
package smoke artifacts stay outside the published source tree.

The installed global CLI, external model credentials, production databases,
shared services and future ADR activation are outside this baseline test claim.
No new registry publication or release tag is implied by this audit. Changes
remain documented under the changelog's Unreleased entry until release promotion.
