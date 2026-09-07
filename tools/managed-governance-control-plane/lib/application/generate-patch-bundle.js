'use strict';

const crypto = require('node:crypto');
const {
  PatchPublicationBundleManifestSchema,
  digestCanonical,
  parseContract,
} = require('../../../../packages/managed-governance-contracts');
const {
  GovernanceRepositoryError,
  assertGovernanceRepository,
  parseRepositoryIdentifier,
  parseRepositoryUuid,
} = require('../domain/repository-port');
const { buildUnifiedPatch, digestPatchText, writePatchBundle } = require('../infrastructure/git/patch-bundle-writer');

// FR-008: a publication request produces a deterministic, reviewable Git change artifact and
// stops before any commit, push, pull request, merge, tag or activation — this module never
// invokes any of those; patch-bundle-writer.js only ever writes to a brand-new directory the
// caller names, never into a git index or working tree.
//
// "Same request is byte-identical" (T06 acceptance criterion) applies to bundle_id too — it is
// not randomly generated, it is derived from the request's own content, exactly like
// manifest_digest. A bundle_id from crypto.randomUUID() would make every field of the record
// vary between two calls with identical input, which is the same class of bug T03's
// non-deterministic command_digest was.

const OPERATIONS = Object.freeze(['create', 'update', 'delete']);
const MAX_CONTENT_BYTES = 2 * 1024 * 1024;

function deterministicUuid(seed) {
  const hash = crypto.createHash('sha256').update(seed, 'utf8').digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function contentDigest(content) {
  return `sha256:${crypto.createHash('sha256').update(content, 'utf8').digest('hex')}`;
}

function assertRelativePath(value) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    Buffer.byteLength(value, 'utf8') > 1024 ||
    value.startsWith('/') ||
    value.includes('\\') ||
    value.includes(' ') ||
    value.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')
  ) {
    throw new GovernanceRepositoryError(`file path is invalid: ${value}`, 'MANAGED_GOVERNANCE_REPOSITORY_INPUT_INVALID');
  }
  return value;
}

function assertContent(value, label) {
  if (typeof value !== 'string' || Buffer.byteLength(value, 'utf8') > MAX_CONTENT_BYTES) {
    throw new GovernanceRepositoryError(`${label} is invalid`, 'MANAGED_GOVERNANCE_REPOSITORY_INPUT_INVALID');
  }
  return value;
}

function normalizeChange(change) {
  if (!change || typeof change !== 'object') {
    throw new GovernanceRepositoryError('file change must be an object', 'MANAGED_GOVERNANCE_REPOSITORY_INPUT_INVALID');
  }
  const path = assertRelativePath(change.path);
  const operation = change.operation;
  if (!OPERATIONS.includes(operation)) {
    throw new GovernanceRepositoryError(`file operation is invalid: ${operation}`, 'MANAGED_GOVERNANCE_REPOSITORY_INPUT_INVALID');
  }
  const before = change.before === undefined ? null : change.before;
  const after = change.after === undefined ? null : change.after;
  if (operation === 'create') {
    if (before !== null)
      throw new GovernanceRepositoryError('a create operation must not carry prior content', 'MANAGED_GOVERNANCE_REPOSITORY_INPUT_INVALID');
    assertContent(after, 'new file content');
  } else if (operation === 'delete') {
    if (after !== null)
      throw new GovernanceRepositoryError('a delete operation must not carry new content', 'MANAGED_GOVERNANCE_REPOSITORY_INPUT_INVALID');
    assertContent(before, 'prior file content');
  } else {
    assertContent(before, 'prior file content');
    assertContent(after, 'new file content');
    if (before === after) {
      throw new GovernanceRepositoryError(
        'an update operation must actually change content',
        'MANAGED_GOVERNANCE_REPOSITORY_INPUT_INVALID',
      );
    }
  }
  return Object.freeze({ path, operation, before, after });
}

async function generatePatchBundle(
  { organizationId, actor, publicationRequestRef, sourceRepositoryId, baseCommit, changes, generatedBy, generatedAt, destination },
  context,
) {
  const repository = assertGovernanceRepository(context?.repository);
  const parsedOrganizationId = parseRepositoryIdentifier(organizationId, 'organization id');
  const parsedRepositoryId = parseRepositoryUuid(sourceRepositoryId, 'source repository id');
  if (!Array.isArray(changes) || changes.length === 0) {
    throw new GovernanceRepositoryError('at least one file change is required', 'MANAGED_GOVERNANCE_REPOSITORY_INPUT_INVALID');
  }
  const normalizedChanges = changes.map((change) => normalizeChange(change));
  const seenPaths = new Set();
  for (const change of normalizedChanges) {
    if (seenPaths.has(change.path)) {
      throw new GovernanceRepositoryError(
        `duplicate file path in the same bundle: ${change.path}`,
        'MANAGED_GOVERNANCE_REPOSITORY_INPUT_INVALID',
      );
    }
    seenPaths.add(change.path);
  }
  // Sorted by path so the manifest, patch and digest never depend on caller-supplied order.
  const sortedChanges = [...normalizedChanges].sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0));

  const fileOperations = sortedChanges.map((change) => ({
    operation: change.operation,
    path: change.path,
    content_digest: change.operation === 'delete' ? null : contentDigest(change.after),
  }));
  const patchText = buildUnifiedPatch(sortedChanges);

  const unsignedBundle = {
    schema_version: 1,
    contract: 'patch-publication-bundle-manifest/v1',
    publication_request_ref: publicationRequestRef,
    source_repository_id: parsedRepositoryId,
    base_commit: baseCommit,
    patch_digest: digestPatchText(patchText),
    file_operations: fileOperations,
    application_instructions: 'Apply with: git apply patch.diff (run from the repository root).',
    rollback_instructions: 'Revert with: git apply --reverse patch.diff (run from the repository root).',
    generated_by: generatedBy,
    generated_at: generatedAt,
  };
  const bundleId = deterministicUuid(digestCanonical(unsignedBundle));
  const bundle = parseContract(
    PatchPublicationBundleManifestSchema,
    { ...unsignedBundle, bundle_id: bundleId, manifest_digest: digestCanonical({ ...unsignedBundle, bundle_id: bundleId }) },
    'patch publication bundle',
  );

  const recorded = await repository.recordPatchPublicationBundle({ organization_id: parsedOrganizationId, actor, bundle });
  const written = writePatchBundle({ destination, manifest: recorded, patchText });
  return Object.freeze({ bundle: recorded, patch: patchText, written });
}

module.exports = {
  generatePatchBundle,
};
