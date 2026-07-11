#!/usr/bin/env bash
#
# Full backup of the live Supabase database to a gzip'd SQL file you own.
# The app can be completely down and this still works — it talks straight to
# Postgres, not to the app. Restore with:
#
#     gzip -dc mbsmash-YYYYMMDD-HHMMSS.sql.gz | psql "<a fresh DATABASE_URL>"
#
# Usage (from the repo root):
#
#     ./scripts/backup-db.sh
#
# Reads DATABASE_URL from .env.local. Backups land in ~/mbsmash-backups (kept
# OUTSIDE the git repo on purpose — a dump contains password hashes and
# customer data and must never be committed).

set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env.local ]; then
  set -a; . ./.env.local; set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set (expected in .env.local)." >&2
  exit 1
fi

# The Supabase server is Postgres 17, so a v17+ pg_dump is required — an older
# client refuses with a "server version mismatch". Prefer an explicit v17 path,
# fall back to whatever pg_dump is on PATH.
PGDUMP=/usr/lib/postgresql/17/bin/pg_dump
[ -x "$PGDUMP" ] || PGDUMP=pg_dump

DEST="${BACKUP_DIR:-$HOME/mbsmash-backups}"
mkdir -p "$DEST"
OUT="$DEST/mbsmash-$(date +%Y%m%d-%H%M%S).sql.gz"

echo "Backing up to $OUT ..."
"$PGDUMP" "$DATABASE_URL" --no-owner --no-privileges | gzip > "$OUT"

# gzip -t proves the file isn't truncated; the grep proves it has real schema.
gzip -t "$OUT"
tables=$(gzip -dc "$OUT" | grep -cE '^CREATE TABLE' || true)
echo "Done — $(du -h "$OUT" | cut -f1), $tables tables."

# Keep the 30 most recent backups, delete older ones.
ls -1t "$DEST"/mbsmash-*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm --
