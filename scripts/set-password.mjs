#!/usr/bin/env node
// One-time (or whenever-you-want) way to set the site password directly,
// bypassing the OTP flow. Reads Redis credentials from .env.local.
//
// Usage: node scripts/set-password.mjs "<new password>"

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync } from 'node:crypto';
import { Redis } from '@upstash/redis';

function loadEnvLocal() {
  const path = fileURLToPath(new URL('../.env.local', import.meta.url));
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

async function main() {
  loadEnvLocal();

  const password = process.argv[2];
  if (!password) {
    console.error('Usage: node scripts/set-password.mjs "<new password>"');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.error('KV_REST_API_URL / KV_REST_API_TOKEN are not set in .env.local. Copy them from the Redis database\'s page under the Storage tab in Vercel.');
    process.exit(1);
  }

  const redis = new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN });
  await redis.set('auth:password_hash', hashPassword(password));
  console.log('Password updated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
