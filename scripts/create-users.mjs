#!/usr/bin/env node
//
// Creates the shop's user accounts with freshly generated passwords and prints
// them once. Nothing stores the plaintext — rerunning this on an existing user
// rotates their password rather than printing the old one.
//
//   node --env-file=.env.local scripts/create-users.mjs
//
// Pass usernames to limit it to those, e.g. `... create-users.mjs alice`.

import { Pool } from 'pg';
// .mjs so this script and Next can both load it — the package is not type:module.
import { hashPassword, generatePassword } from '../lib/password.mjs';

const USERS = [
  { username: 'reception', display_name: 'Reception' },
  { username: 'workshop',  display_name: 'Workshop' },
  { username: 'davinder',  display_name: 'Davinder' },
];

const only = process.argv.slice(2);
const targets = only.length ? USERS.filter(u => only.includes(u.username)) : USERS;

if (targets.length === 0) {
  console.error(`No matching users. Known: ${USERS.map(u => u.username).join(', ')}`);
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set. Run with: node --env-file=.env.local scripts/create-users.mjs');
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const created = [];

try {
  for (const user of targets) {
    const password = generatePassword();
    await pool.query(
      `INSERT INTO users (username, display_name, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (username)
       DO UPDATE SET password_hash = EXCLUDED.password_hash,
                     display_name  = EXCLUDED.display_name,
                     active        = true`,
      [user.username, user.display_name, hashPassword(password)],
    );
    created.push({ ...user, password });
  }

  const width = Math.max(...created.map(u => u.username.length));
  console.log('\n  Passwords — shown once, stored only as scrypt hashes.\n');
  for (const u of created) {
    console.log(`    ${u.username.padEnd(width)}  →  ${u.password}`);
  }
  console.log('\n  Hand these out, then keep them somewhere safe.\n');
} finally {
  await pool.end();
}
