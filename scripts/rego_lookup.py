#!/usr/bin/env python3
"""Look up a Victorian registration on the VicRoads vehicle registration enquiry
and pull back make / model / year.

    https://www.vicroads.vic.gov.au/registration/buy-sell-or-transfer-a-vehicle/
    check-vehicle-registration/vehicle-registration-enquiry/

HOW THIS WORKS, AND WHY IT ISN'T FULLY AUTOMATIC
------------------------------------------------
The VicRoads page is behind a Cloudflare managed challenge, and the enquiry form
carries a captcha. This script does NOT try to get around either of them. It
opens a real, visible Chrome window using your own browser profile; you clear the
challenge and the captcha yourself, exactly as you would by hand. Everything
around that is automated: typing the rego, reading the result, keeping a cache so
a rego is never looked up twice, and writing the answer back to the database.

So it is a form-filler with a human in the loop, not a bulk scraper. Expect to
click a captcha once per lookup. Pace yourself and stay well inside what the
service is meant for — one-at-a-time enquiries about vehicles you're dealing
with. For real bulk backfill, the sanctioned path is a NEVDIS reseller / PPSR
business API, which returns the same fields under a licence.

USAGE
-----
    # one rego, print the result
    .venv-rego/bin/python scripts/rego_lookup.py --rego 1XS3FS

    # work through vehicles in the DB that have no make/model recorded
    .venv-rego/bin/python scripts/rego_lookup.py --from-db --limit 10

    # ...and write what it finds back to the vehicles table
    .venv-rego/bin/python scripts/rego_lookup.py --from-db --limit 10 --apply

    # first run: keep the result HTML so the field parser can be tuned
    .venv-rego/bin/python scripts/rego_lookup.py --rego 1XS3FS --dump-html

Requires the .venv-rego virtualenv (Debian's python3-playwright package is
broken -- its Node driver is missing -- so this uses a pip playwright plus the
system Google Chrome). Recreate it with:

    python3 -m venv .venv-rego && .venv-rego/bin/pip install playwright

psql must be on PATH for the --from-db / --apply modes. DATABASE_URL is read
from .env.local.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import os
import random
import re
import subprocess
import sys
import time
from pathlib import Path

try:
    from playwright.sync_api import TimeoutError as PWTimeout
    from playwright.sync_api import sync_playwright
except ImportError:  # pragma: no cover
    sys.exit("playwright is not installed:  pip install playwright")

REPO = Path(__file__).resolve().parent.parent
ENQUIRY_URL = (
    "https://www.vicroads.vic.gov.au/registration/buy-sell-or-transfer-a-vehicle/"
    "check-vehicle-registration/vehicle-registration-enquiry/"
)
# Persistent browser profile, so the Cloudflare clearance you earn by solving the
# challenge once survives between runs instead of being re-triggered every time.
PROFILE_DIR = REPO / "scripts" / ".rego-browser-profile"
CACHE_FILE = REPO / "scripts" / ".rego-cache.json"
DUMP_DIR = REPO / "scripts" / ".rego-dumps"


# --------------------------------------------------------------------------- #
# database helpers (psql subprocess -- no driver dependency)
# --------------------------------------------------------------------------- #

def database_url() -> str:
    url = os.environ.get("DATABASE_URL")
    if url:
        return url
    env = REPO / ".env.local"
    if env.exists():
        for line in env.read_text().splitlines():
            line = line.strip()
            if line.startswith("DATABASE_URL="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("DATABASE_URL not set and not found in .env.local")


def psql(sql: str, *, csv_out: bool = True) -> str:
    cmd = ["psql", database_url(), "-v", "ON_ERROR_STOP=1"]
    cmd += ["--csv", "-t", "-c", sql] if csv_out else ["-c", sql]
    done = subprocess.run(cmd, capture_output=True, text=True)
    if done.returncode != 0:
        sys.exit(f"psql failed:\n{done.stderr.strip()}")
    return done.stdout


def sql_lit(value) -> str:
    """Quote a value for inline SQL. None -> NULL."""
    if value is None or value == "":
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def fetch_missing(limit: int) -> list[dict]:
    """Vehicles with no make recorded, newest first."""
    rows = psql(
        f"""
        SELECT id, registration,
               coalesce(nullif(btrim(make), ''),  ''),
               coalesce(nullif(btrim(model), ''), '')
        FROM vehicles
        WHERE nullif(btrim(make), '') IS NULL
           OR nullif(btrim(model), '') IS NULL
        ORDER BY date_in DESC NULLS LAST, id DESC
        LIMIT {int(limit)}
        """
    )
    out = []
    for rec in csv.reader(io.StringIO(rows)):
        if len(rec) >= 4 and rec[1].strip():
            out.append(
                {"id": int(rec[0]), "registration": rec[1].strip(),
                 "make": rec[2], "model": rec[3]}
            )
    return out


def apply_update(vehicle_id: int, found: dict) -> None:
    """Fill in only the columns that are still blank -- never clobber curated data."""
    year = found.get("year")
    try:
        year = int(year) if year else None
        if year and not (1950 <= year <= time.localtime().tm_year + 2):
            year = None  # vehicles_year_check would reject it
    except (TypeError, ValueError):
        year = None

    psql(
        f"""
        UPDATE vehicles SET
            make  = CASE WHEN nullif(btrim(make), '')  IS NULL
                         THEN {sql_lit(found.get('make'))}  ELSE make  END,
            model = CASE WHEN nullif(btrim(model), '') IS NULL
                         THEN {sql_lit(found.get('model'))} ELSE model END,
            year  = CASE WHEN year IS NULL
                         THEN {year if year else 'NULL'}    ELSE year  END
        WHERE id = {int(vehicle_id)}
        """,
        csv_out=False,
    )


# --------------------------------------------------------------------------- #
# result parsing
# --------------------------------------------------------------------------- #

# The result markup isn't visible from outside the challenge, so rather than
# betting on one set of selectors we pull every label/value pair we can find --
# from definition lists, tables, and plain "Label: value" text -- then map the
# labels we care about onto our own field names. Run once with --dump-html and
# tighten this if the page turns out to use something exotic.
FIELD_ALIASES: dict[str, tuple[str, ...]] = {
    "make":       ("make", "vehicle make"),
    "model":      ("model", "model description", "vehicle model"),
    "year":       ("year of manufacture", "build date", "compliance date",
                   "year model", "manufacture year", "year"),
    "body_type":  ("body type", "vehicle type", "body shape"),
    "colour":     ("colour", "color", "primary colour"),
    "vin":        ("vin", "chassis number", "vin/chassis"),
    "status":     ("registration status", "status"),
    "expiry":     ("registration expiry", "expiry date", "expires", "expiry"),
}

_LABEL_VALUE_RE = re.compile(r"^\s*([A-Za-z][A-Za-z /]{2,40}?)\s*[::]\s*(.+?)\s*$")


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "")).strip()


def harvest_pairs(page) -> dict[str, str]:
    """Every label -> value pair on the page, keyed by lowercased label."""
    pairs: dict[str, str] = {}

    def put(label: str, value: str) -> None:
        label = _norm(label).rstrip(":").lower()
        value = _norm(value)
        if label and value and label != value.lower() and len(value) < 200:
            pairs.setdefault(label, value)

    # 1. definition lists
    for dl in page.query_selector_all("dl"):
        terms = dl.query_selector_all("dt")
        defs = dl.query_selector_all("dd")
        for dt, dd in zip(terms, defs):
            put(dt.inner_text(), dd.inner_text())

    # 2. tables -- both th/td and two-column td/td layouts
    for row in page.query_selector_all("tr"):
        cells = row.query_selector_all("th, td")
        if len(cells) == 2:
            put(cells[0].inner_text(), cells[1].inner_text())

    # 3. plain text "Label: value", and label/value on consecutive lines
    try:
        text = page.inner_text("body")
    except Exception:
        text = ""
    lines = [_norm(ln) for ln in text.splitlines()]
    lines = [ln for ln in lines if ln]
    for i, line in enumerate(lines):
        m = _LABEL_VALUE_RE.match(line)
        if m:
            put(m.group(1), m.group(2))
        elif i + 1 < len(lines):
            # "Make" on one line, "TOYOTA" on the next
            if line.rstrip(":").lower() in {a for al in FIELD_ALIASES.values() for a in al}:
                put(line, lines[i + 1])
    return pairs


def extract_fields(pairs: dict[str, str]) -> dict[str, str]:
    found: dict[str, str] = {}
    for field, aliases in FIELD_ALIASES.items():
        for alias in aliases:
            if alias in pairs:
                found[field] = pairs[alias]
                break
    # "Year of manufacture" often arrives as a date -- keep the year
    if "year" in found:
        m = re.search(r"(19|20)\d{2}", found["year"])
        found["year"] = m.group(0) if m else ""
    return {k: v for k, v in found.items() if v}


# --------------------------------------------------------------------------- #
# browser session
# --------------------------------------------------------------------------- #

CHALLENGE_MARKERS = ("just a moment", "verify you are human", "checking your browser",
                     "needs to review the security")


class Session:
    """A visible Chrome window driving the enquiry form. You clear the gates."""

    def __init__(self, headless: bool = False, slow_mo: int = 0):
        self._pw = sync_playwright().start()
        PROFILE_DIR.mkdir(parents=True, exist_ok=True)
        opts = dict(
            user_data_dir=str(PROFILE_DIR),
            headless=headless,
            slow_mo=slow_mo,
            viewport={"width": 1280, "height": 900},
            args=["--disable-blink-features=AutomationControlled"],
        )
        # Prefer the real Chrome that's installed -- a genuine browser build is
        # what the challenge expects to see, and it saves downloading Chromium.
        try:
            self.ctx = self._pw.chromium.launch_persistent_context(channel="chrome", **opts)
        except Exception:
            self.ctx = self._pw.chromium.launch_persistent_context(**opts)
        self.page = self.ctx.pages[0] if self.ctx.pages else self.ctx.new_page()

    def close(self) -> None:
        try:
            self.ctx.close()
        finally:
            self._pw.stop()

    def _challenged(self) -> bool:
        try:
            body = self.page.inner_text("body")[:3000].lower()
        except Exception:
            return False
        return any(marker in body for marker in CHALLENGE_MARKERS)

    def open_form(self) -> None:
        self.page.goto(ENQUIRY_URL, wait_until="domcontentloaded", timeout=60_000)
        if self._challenged():
            print("\n  Cloudflare is challenging this session.")
            print("  Clear it in the browser window, then come back here.")
            input("  Press Enter once the enquiry form is on screen... ")

    def _rego_input(self):
        """Find the registration field without relying on one fixed selector."""
        candidates = [
            "input[name*='rego' i]",
            "input[id*='rego' i]",
            "input[name*='registration' i]",
            "input[id*='registration' i]",
            "input[placeholder*='registration' i]",
            "input[aria-label*='registration' i]",
            "input[type='text']:visible",
        ]
        for sel in candidates:
            try:
                el = self.page.wait_for_selector(sel, timeout=2_500, state="visible")
                if el:
                    return el
            except PWTimeout:
                continue
        return None

    def lookup(self, rego: str, dump_html: bool = False) -> dict:
        """Fill the form for one rego; you complete the captcha; we read the result."""
        self.open_form()

        field = self._rego_input()
        if field is None:
            print(f"  Couldn't find the registration field for {rego}.")
            print("  Type it in the window yourself, submit, then press Enter here.")
            input("  Press Enter once the result is on screen... ")
        else:
            field.click()
            field.fill("")
            field.type(rego, delay=90)
            print(f"\n  {rego} is typed into the form.")
            print("  Complete the captcha and submit in the browser window.")
            input("  Press Enter once the result is on screen... ")

        self.page.wait_for_timeout(500)
        pairs = harvest_pairs(self.page)
        found = extract_fields(pairs)

        if dump_html or not found:
            DUMP_DIR.mkdir(parents=True, exist_ok=True)
            dump = DUMP_DIR / f"{re.sub(r'[^A-Za-z0-9]', '', rego)}.html"
            dump.write_text(self.page.content(), encoding="utf-8")
            if not found:
                print(f"  No fields recognised. Page saved to {dump}")
                print("  Send me that file and I'll tighten the parser.")
            else:
                print(f"  Page saved to {dump}")
        return found


# --------------------------------------------------------------------------- #
# cache
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


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #

def main() -> int:
    ap = argparse.ArgumentParser(
        description="VicRoads registration enquiry -> make / model, human in the loop.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--rego", help="a single registration to look up")
    src.add_argument("--from-db", action="store_true",
                     help="work through vehicles that have no make/model recorded")
    ap.add_argument("--limit", type=int, default=5,
                    help="how many vehicles to do this run (default 5)")
    ap.add_argument("--apply", action="store_true",
                    help="write results back to the vehicles table")
    ap.add_argument("--delay", type=float, default=12.0,
                    help="seconds to pause between lookups (default 12)")
    ap.add_argument("--dump-html", action="store_true",
                    help="save each result page for parser tuning")
    ap.add_argument("--refresh", action="store_true",
                    help="ignore the cache and look the rego up again")
    args = ap.parse_args()

    if args.rego:
        targets = [{"id": None, "registration": args.rego.strip().upper()}]
    else:
        targets = fetch_missing(args.limit)
        if not targets:
            print("Nothing to do -- every vehicle already has a make and model.")
            return 0
        print(f"{len(targets)} vehicle(s) to look up.\n")

    cache = load_cache()
    session = Session()
    filled = 0

    try:
        for i, target in enumerate(targets, 1):
            rego = target["registration"]
            print(f"[{i}/{len(targets)}] {rego}")

            if rego in cache and not args.refresh:
                found = cache[rego]
                print("  (from cache)")
            else:
                found = session.lookup(rego, dump_html=args.dump_html)
                cache[rego] = found
                save_cache(cache)

            if found:
                for key in ("make", "model", "year", "body_type", "colour", "status"):
                    if found.get(key):
                        print(f"    {key:<10} {found[key]}")
            else:
                print("    nothing found")

            if args.apply and target["id"] and (found.get("make") or found.get("model")):
                apply_update(target["id"], found)
                filled += 1
                print("    -> saved to the database")
            elif found.get("make") and target["id"]:
                print(f"    (dry run -- re-run with --apply to save)")

            if i < len(targets):
                pause = args.delay * random.uniform(0.8, 1.4)
                print(f"  waiting {pause:.0f}s\n")
                time.sleep(pause)
    except KeyboardInterrupt:
        print("\nStopped. Progress is cached, so re-running picks up where you left off.")
    finally:
        save_cache(cache)
        session.close()

    if args.apply:
        print(f"\nUpdated {filled} vehicle(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
