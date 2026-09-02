#!/usr/bin/env python3
"""Fill in vehicle make / model / year from CrashZone.

    https://v1.crashzone.com.au/a/#!/

WHY THIS BEATS THE VICROADS SCRIPT
----------------------------------
CrashZone is our own system holding our own job data, and its API is plain JSON
with no captcha in front of it. The app itself calls:

    GET https://v1.crashzone.com.au/api/rego/<rego>
    Authorization: Bearer <token>
    -> {"status": "ok", "data": {"cars": [{"VehicleRegoNo": ..., "VehicleMake":
        ..., "VehicleModel": ..., "VehicleDOM": ..., "VehicleSeries": ...}]}}

So this script does exactly what the browser does, with our own login. No
challenge to get around, and it returns model and year -- which the VicRoads
route could never give us in bulk.

AUTHENTICATION
--------------
You log in yourself. On first run a real Chrome window opens on the CrashZone
login page; once you're in, the script reads the session token the app stored in
localStorage and reuses it for the API calls. Your password is never typed into,
seen by, or stored by this script. The token is cached in a gitignored file and
refreshed by logging in again whenever it expires.

USAGE
-----
    # dry run: how many of our make-less vehicles can CrashZone actually resolve?
    .venv-rego/bin/python scripts/crashzone_lookup.py --check

    # one rego
    .venv-rego/bin/python scripts/crashzone_lookup.py --rego 1XS3FS

    # write what it finds back into vehicles (blank columns only)
    .venv-rego/bin/python scripts/crashzone_lookup.py --apply

    # force a fresh login
    .venv-rego/bin/python scripts/crashzone_lookup.py --login

Requires the .venv-rego virtualenv (see rego_lookup.py) and psql on PATH.
Note this is an internal API, not a documented one -- if CrashZone change it,
the field names in CAR_FIELDS are the place to look.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))
import cz_normalise  # noqa: E402
from rego_lookup import PROFILE_DIR, apply_update, database_url, psql  # noqa: E402

REPO = Path(__file__).resolve().parent.parent
BASE = "https://v1.crashzone.com.au"
APP_URL = f"{BASE}/a/#!/"
TOKEN_FILE = REPO / "scripts" / ".crashzone-token.json"
CACHE_FILE = REPO / "scripts" / ".crashzone-cache.json"

# Field names lifted from the app bundle.
CAR_FIELDS = {
    "rego":   "VehicleRegoNo",
    "make":   "VehicleMake",
    "model":  "VehicleModel",
    "year":   "VehicleDOM",       # date of manufacture
    "series": "VehicleSeries",
    "colour": "VehicleColour",
    "body":   "VehicleBody",
    "vin":    "VehicleVinNo",
}


# --------------------------------------------------------------------------- #
# auth
# --------------------------------------------------------------------------- #

def load_token() -> str | None:
    if TOKEN_FILE.exists():
        try:
            return json.loads(TOKEN_FILE.read_text()).get("token")
        except json.JSONDecodeError:
            return None
    return None


def save_token(token: str) -> None:
    TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
    TOKEN_FILE.write_text(json.dumps({"token": token, "saved_at": int(time.time())}))
    TOKEN_FILE.chmod(0o600)  # it's a live session credential


def interactive_login() -> str:
    """Open Chrome, let the user log in, then read the app's own session token."""
    from playwright.sync_api import sync_playwright

    print("\nOpening CrashZone. Log in as you normally would.")
    print("(Your password goes into CrashZone's own page -- this script never sees it.)")

    with sync_playwright() as pw:
        PROFILE_DIR.mkdir(parents=True, exist_ok=True)
        opts = dict(user_data_dir=str(PROFILE_DIR), headless=False,
                    viewport={"width": 1600, "height": 950})
        try:
            ctx = pw.chromium.launch_persistent_context(channel="chrome", **opts)
        except Exception:
            ctx = pw.chromium.launch_persistent_context(**opts)

        page = ctx.pages[0] if ctx.pages else ctx.new_page()
        page.goto(APP_URL, wait_until="domcontentloaded", timeout=60_000)

        token = None
        deadline = time.time() + 300
        while time.time() < deadline:
            try:
                token = page.evaluate("() => window.localStorage.getItem('token')")
            except Exception:
                token = None
            if token:
                break
            page.wait_for_timeout(1_500)

        ctx.close()

    if not token:
        sys.exit("Timed out waiting for login -- no token appeared. Try again.")
    save_token(token)
    print("Logged in; token cached.\n")
    return token


# --------------------------------------------------------------------------- #
# API
# --------------------------------------------------------------------------- #

class CrashZone:
    def __init__(self, token: str):
        self.token = token
        self.http = requests.Session()
        self.http.headers.update({
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
            "User-Agent": "mbsmash-backfill/1.0 (own-account vehicle lookup)",
        })

    def rego(self, rego: str) -> list[dict]:
        """Cars matching a registration. Raises PermissionError on an expired token."""
        url = f"{BASE}/api/rego/{requests.utils.quote(rego.strip(), safe='')}"
        try:
            res = self.http.get(url, timeout=25)
        except requests.RequestException as exc:
            print(f"    network error: {exc}")
            return []
        if res.status_code in (401, 403):
            raise PermissionError("token expired")
        if res.status_code != 200:
            print(f"    HTTP {res.status_code}")
            return []
        try:
            body = res.json()
        except ValueError:
            return []
        if body.get("status") != "ok":
            return []
        return (body.get("data") or {}).get("cars") or []


def pick_car(cars: list[dict], rego: str) -> dict | None:
    """The API does prefix matching, so keep only an exact rego hit."""
    want = re.sub(r"[^A-Z0-9]", "", rego.upper())
    exact = [c for c in cars
             if re.sub(r"[^A-Z0-9]", "", str(c.get(CAR_FIELDS["rego"], "")).upper()) == want]
    if not exact:
        return None
    # Prefer the entry that actually names a make, then the richest record.
    exact.sort(key=lambda c: (bool(str(c.get(CAR_FIELDS["make"], "")).strip()),
                              sum(1 for f in CAR_FIELDS.values() if str(c.get(f, "")).strip())),
               reverse=True)
    return exact[0]


def normalise(car: dict) -> dict:
    out: dict[str, str] = {}
    for key, field in CAR_FIELDS.items():
        val = str(car.get(field) or "").strip()
        if val:
            out[key] = val
    if "year" in out:  # VehicleDOM may be a full date
        m = re.search(r"(19|20)\d{2}", out["year"])
        out["year"] = m.group(0) if m else ""
    return {k: v for k, v in out.items() if v}


# --------------------------------------------------------------------------- #
# database
# --------------------------------------------------------------------------- #

def fetch_targets() -> list[dict]:
    rows = psql(
        """
        SELECT id, registration,
               coalesce(nullif(btrim(make), ''),  ''),
               coalesce(nullif(btrim(model), ''), ''),
               coalesce(year::text, '')
        FROM vehicles
        WHERE nullif(btrim(make), '') IS NULL
           OR nullif(btrim(model), '') IS NULL
           OR year IS NULL
        ORDER BY date_in DESC NULLS LAST, id DESC
        """
    )
    import csv as _csv
    import io as _io
    out = []
    for rec in _csv.reader(_io.StringIO(rows)):
        if len(rec) >= 5 and rec[1].strip():
            out.append({"id": int(rec[0]), "registration": rec[1].strip(),
                        "make": rec[2], "model": rec[3], "year": rec[4]})
    return out


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #

def load_cache() -> dict:
    if CACHE_FILE.exists():
        try:
            return json.loads(CACHE_FILE.read_text())
        except json.JSONDecodeError:
            return {}
    return {}


def save_cache(cache: dict) -> None:
    CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
    CACHE_FILE.write_text(json.dumps(cache, indent=2, sort_keys=True))


def main() -> int:
    ap = argparse.ArgumentParser(description="Backfill make/model/year from CrashZone.")
    ap.add_argument("--rego", help="look up a single registration and stop")
    ap.add_argument("--check", action="store_true",
                    help="dry run: report the hit rate, change nothing (default)")
    ap.add_argument("--apply", action="store_true", help="write results into vehicles")
    ap.add_argument("--login", action="store_true", help="force a fresh login")
    ap.add_argument("--limit", type=int, help="only process this many vehicles")
    ap.add_argument("--delay", type=float, default=0.4,
                    help="seconds between API calls (default 0.4, be polite)")
    ap.add_argument("--refresh", action="store_true", help="ignore the cache")
    args = ap.parse_args()

    # Our makes/models tables are the authority for spelling -- see cz_normalise.
    catalog = cz_normalise.Catalog.from_db(database_url())

    token = None if args.login else load_token()
    if not token:
        token = interactive_login()
    cz = CrashZone(token)

    def relogin() -> None:
        nonlocal cz
        print("  token expired -- logging in again")
        cz = CrashZone(interactive_login())

    # single rego
    if args.rego:
        try:
            cars = cz.rego(args.rego)
        except PermissionError:
            relogin()
            cars = cz.rego(args.rego)
        car = pick_car(cars, args.rego)
        if not car:
            print(f"{args.rego}: no exact match ({len(cars)} near matches)")
            return 1
        result = cz_normalise.normalise(catalog, normalise(car))
        for k, v in result.items():
            print(f"  {k:<7} {v}")
        return 0

    targets = fetch_targets()
    if args.limit:
        targets = targets[: args.limit]
    if not targets:
        print("Nothing missing -- every vehicle has make, model and year.")
        return 0

    mode = "APPLY (writing to the database)" if args.apply else "CHECK (dry run)"
    print(f"{mode} -- {len(targets)} vehicle(s) with something missing\n")

    cache = load_cache()
    hits = misses = written = 0
    would_fill = {"make": 0, "model": 0, "year": 0}
    examples: list[str] = []
    flagged: list[str] = []

    for i, target in enumerate(targets, 1):
        rego = target["registration"]

        if rego in cache and not args.refresh:
            found = cache[rego]
        else:
            try:
                cars = cz.rego(rego)
            except PermissionError:
                relogin()
                cars = cz.rego(rego)
            car = pick_car(cars, rego)
            found = normalise(car) if car else {}
            cache[rego] = found
            if i % 10 == 0:
                save_cache(cache)
            time.sleep(args.delay)

        found = cz_normalise.normalise(catalog, found) if found else {}
        if found.get("_review"):
            flagged.append(f"  {rego:<10} {found['_review']}")

        if found.get("make") or found.get("model"):
            hits += 1
            for col in ("make", "model", "year"):
                if not target[col] and found.get(col):
                    would_fill[col] += 1
            if len(examples) < 8:
                examples.append(
                    f"  {rego:<10} {found.get('make','?'):<12} "
                    f"{found.get('model','?'):<18} {found.get('year','?')}"
                )
            if args.apply:
                apply_update(target["id"], found)
                written += 1
        else:
            misses += 1

        if i % 25 == 0 or i == len(targets):
            print(f"  {i}/{len(targets)}  matched {hits}  no match {misses}")

    save_cache(cache)

    print(f"\nMatched {hits} of {len(targets)} ({100*hits//max(len(targets),1)}%)")
    print(f"  would fill make:  {would_fill['make']}")
    print(f"  would fill model: {would_fill['model']}")
    print(f"  would fill year:  {would_fill['year']}")
    if examples:
        print("\nSample:")
        print("\n".join(examples))
    if flagged:
        print(f"\nFlagged for review ({len(flagged)}) -- written, but not in the "
              f"makes/models tables yet:")
        print("\n".join(flagged))
    if args.apply:
        print(f"\nWrote {written} vehicle(s).")
    else:
        print("\nDry run -- nothing changed. Re-run with --apply to save.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
