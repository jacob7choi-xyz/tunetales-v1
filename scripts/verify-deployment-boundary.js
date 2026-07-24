#!/usr/bin/env node

// Proves the S3 tracing invariant on BUILD ARTIFACTS, not config intent:
// after `npm run build`, every data/ file referenced by any .nft.json
// trace must live under data/public/. Raw research or internal pipeline
// artifacts appearing in a trace fails the build boundary check.

const fs = require('fs');
const path = require('path');

const SERVER_APP_DIR = path.join(process.cwd(), '.next', 'server', 'app');

function walk(dir, suffix, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, suffix, out);
    else if (entry.name.endsWith(suffix)) out.push(full);
  }
  return out;
}

if (!fs.existsSync(SERVER_APP_DIR)) {
  console.error('[FAIL] No .next/server/app found. Run `npm run build` first.');
  process.exit(1);
}

const traceFiles = walk(SERVER_APP_DIR, '.nft.json');
if (traceFiles.length === 0) {
  console.error('[FAIL] No .nft.json traces found under .next/server/app.');
  process.exit(1);
}

const violations = [];
let publicCount = 0;

for (const traceFile of traceFiles) {
  const trace = JSON.parse(fs.readFileSync(traceFile, 'utf-8'));
  for (const ref of trace.files ?? []) {
    // Trace entries are relative to the trace file's directory
    const resolved = path.resolve(path.dirname(traceFile), ref);
    const relToRepo = path.relative(process.cwd(), resolved);
    if (!relToRepo.startsWith('data' + path.sep)) continue;
    if (relToRepo.startsWith(path.join('data', 'public') + path.sep)) {
      publicCount += 1;
    } else {
      violations.push(`${path.relative(process.cwd(), traceFile)} -> ${relToRepo}`);
    }
  }
}

if (violations.length > 0) {
  console.error(`[FAIL] ${violations.length} traced data file(s) outside data/public:`);
  for (const v of violations.slice(0, 20)) console.error('  ' + v);
  process.exit(1);
}

if (publicCount === 0) {
  console.error('[FAIL] No data/public files traced at all; tracing config is broken.');
  process.exit(1);
}

console.log(
  `[OK] Deployment boundary holds: ${publicCount} data/public references across ` +
    `${traceFiles.length} traces, zero references outside data/public.`
);
