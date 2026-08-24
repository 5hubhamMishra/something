#!/usr/bin/env node
// Compares src/data/site.config.json against a baseline snapshot (the most
// recent file in _backups/, or one passed explicitly) and reports anything
// that looks like it was silently lost: removed keys, populated strings that
// became empty/placeholder, or arrays (family, timeline, memories,
// achievements, lessons, futureDreams, ...) that got shorter.
//
// Usage:
//   node scripts/check-content-preservation.mjs [path/to/baseline.json]
// Exit code 0 = clean, 1 = preservation issue found.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const currentPath = path.join(root, 'src/data/site.config.json');

function latestBackup() {
  const dir = path.join(root, '_backups');
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => f.startsWith('site.config.') && f.endsWith('.json'));
  if (files.length === 0) return null;
  files.sort();
  return path.join(dir, files[files.length - 1]);
}

const baselinePath = process.argv[2] ? path.resolve(process.argv[2]) : latestBackup();

if (!baselinePath || !existsSync(baselinePath)) {
  console.error('No baseline found. Pass a path explicitly, or create one in _backups/ first.');
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const current = JSON.parse(readFileSync(currentPath, 'utf8'));

const PLACEHOLDER = /^\[[\w\s]+\]$/;
function isRealContent(v) {
  return typeof v === 'string' && v.trim() && !PLACEHOLDER.test(v.trim());
}

const issues = [];

function walk(basePath, a, b) {
  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      issues.push(`${basePath}: was an array of ${a.length}, is now ${typeof b}`);
      return;
    }
    if (b.length < a.length) {
      issues.push(`${basePath}: array shrank from ${a.length} to ${b.length} entries`);
    }
    // Best-effort per-item comparison by index (config arrays are ordered,
    // not keyed) — still catches "item 3 lost its text" cases.
    a.forEach((item, i) => {
      if (i < b.length) walk(`${basePath}[${i}]`, item, b[i]);
    });
    return;
  }

  if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object') {
      issues.push(`${basePath}: was an object, is now ${typeof b}`);
      return;
    }
    for (const key of Object.keys(a)) {
      const nextPath = basePath ? `${basePath}.${key}` : key;
      if (!(key in b)) {
        issues.push(`${nextPath}: key removed`);
        continue;
      }
      walk(nextPath, a[key], b[key]);
    }
    return;
  }

  if (isRealContent(a) && !isRealContent(b)) {
    issues.push(`${basePath}: had real content, now empty/placeholder ("${String(a).slice(0, 60)}")`);
  }
}

walk('', baseline, current);

console.log(`Baseline: ${path.relative(root, baselinePath)}`);
console.log(`Current:  ${path.relative(root, currentPath)}`);
console.log('');

if (issues.length === 0) {
  console.log('OK — no content lost relative to the baseline.');
  process.exit(0);
}

console.log(`${issues.length} potential content-preservation issue(s):`);
for (const issue of issues) console.log(`  - ${issue}`);
process.exit(1);
