'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function atomicWrite(file, data) {
  const temp = `${file}.${crypto.randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temp, data, { flag: 'wx', mode: 0o600 });
    fs.renameSync(temp, file);
  } finally {
    fs.rmSync(temp, { force: true });
  }
}

function readSmall(file) {
  let fd;
  try {
    fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
    const stat = fs.fstatSync(fd);
    if (!stat.isFile() || stat.size > 8192) throw new Error('Invalid context state file');
    return fs.readFileSync(fd, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

function sessionState(sessionId, adapter, directory = process.env.HSEOS_GOVERNANCE_CONTEXT_STATE) {
  if (typeof sessionId !== 'string' || !sessionId.trim() || sessionId.length > 1024) return null;
  const root = path.resolve(directory || path.join(os.homedir(), '.local', 'state', 'hseos', 'governance-context'));
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  const stat = fs.lstatSync(root);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error('Unsafe context state directory');
  const key = crypto
    .createHash('sha256')
    .update(JSON.stringify([adapter, sessionId]))
    .digest('hex');
  const epochFile = path.join(root, `${key}.epoch`);
  const receiptFile = path.join(root, `${key}.json`);
  const epoch = readSmall(epochFile) || 'initial';
  return {
    matches(fingerprint, now = Date.now()) {
      // Do not deduplicate until a lifecycle event actually initialized this
      // adapter/session. Merely configuring a prompt hook is insufficient.
      if (epoch === 'initial') return false;
      const raw = readSmall(receiptFile);
      if (!raw) return false;
      const receipt = JSON.parse(raw);
      const age = now - receipt.emitted_at;
      return (
        receipt.version === 1 &&
        receipt.epoch === epoch &&
        receipt.fingerprint === fingerprint &&
        Number.isFinite(age) &&
        age >= 0 &&
        age < MAX_AGE_MS
      );
    },
    remember(fingerprint) {
      if (epoch === 'initial') return;
      // An invalidation racing with emission changes the separate epoch. A late
      // receipt can never overwrite it and suppress the next post-compact prompt.
      atomicWrite(receiptFile, JSON.stringify({ version: 1, epoch, fingerprint, emitted_at: Date.now() }));
    },
    invalidate() {
      atomicWrite(epochFile, crypto.randomUUID());
      fs.rmSync(receiptFile, { force: true });
    },
  };
}

module.exports = { sessionState, MAX_AGE_MS };
