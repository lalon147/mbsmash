#!/usr/bin/env python3
"""Normalise CrashZone make/model strings onto our own conventions.

CrashZone's vehicle data is entered by hand across many shops, so it arrives
inconsistent in ways that would fragment our reports if written in raw:

    TOYOTA / Toyota / TOYATA      -> Toyota      (case, plus a typo)
    HAVAL / GREAT WALL / GWM      -> GWM         (three names, one manufacturer)
    ES300H / ES300h / RX450hL     -> ES / RX     (variant grades on the model)
    RAV 4 / X TRAIL / CX9         -> RAV4 / ...  (spacing and punctuation)

Our own `makes` and `models` tables are the authority. Anything that can't be
matched to them is passed through title-cased and *flagged*, never silently
guessed -- a wrong make is worse than a missing one.
"""

from __future__ import annotations

import csv
import io
import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

# Manufacturer aliases. Haval and Great Wall are both GWM marques, and our
# `makes` table records the parent as the make with the marque in the model.
MAKE_ALIASES = {
    "HAVAL": "GWM",
    "GREAT WALL": "GWM",
    "GREATWALL": "GWM",
    "GWM HAVAL": "GWM",
    "TOYATA": "Toyota",     # observed typo in CrashZone data
    "TOYOYA": "Toyota",
    "VW": "Volkswagen",
    "MERC": "Mercedes-Benz",
    "MERCEDES": "Mercedes-Benz",
    "MERCEDES BENZ": "Mercedes-Benz",
}

# Sub-brands that belong in the model, matching how we already store
# "Haval Jolion" and "Haval H6" under make GWM.
SUBBRAND_PREFIX = {"GWM": "Haval"}


def squash(text: str) -> str:
    """Uppercase alphanumerics only -- 'RAV 4', 'RAV-4' and 'rav4' all collapse."""
    return re.sub(r"[^A-Z0-9]", "", (text or "").upper())


def smart_title(text: str) -> str:
    """Title-case, but leave short/alphanumeric tokens alone (S90, MG, C-HR)."""
    parts = []
    for word in re.split(r"(\s+)", (text or "").strip()):
        if not word.strip():
            parts.append(word)
        elif len(word) <= 2 or re.search(r"\d", word):
            parts.append(word.upper() if word.isalpha() else word)
        else:
            parts.append(word.capitalize())
    return "".join(parts).strip()


@dataclass
class Catalog:
    makes: dict[str, str] = field(default_factory=dict)          # SQUASHED -> canonical
    models: dict[str, dict[str, str]] = field(default_factory=dict)  # MAKE -> {SQUASHED: canonical}

    @classmethod
    def from_db(cls, database_url: str) -> "Catalog":
        def q(sql: str) -> list[list[str]]:
            out = subprocess.run(
                ["psql", database_url, "--csv", "-t", "-c", sql],
                capture_output=True, text=True,
            )
            if out.returncode != 0:
                raise RuntimeError(out.stderr.strip())
            return [r for r in csv.reader(io.StringIO(out.stdout)) if r and any(r)]

        cat = cls()
        for row in q("SELECT name FROM makes"):
            cat.makes[squash(row[0])] = row[0].strip()
        for row in q("SELECT mk.name, m.name FROM models m JOIN makes mk ON mk.id = m.make_id"):
            if len(row) >= 2:
                cat.models.setdefault(row[0].strip(), {})[squash(row[1])] = row[1].strip()
        return cat

    # ------------------------------------------------------------------ #

    def make(self, raw: str) -> tuple[str | None, bool]:
        """-> (canonical make or None, is_known). None means 'do not write this'."""
        text = re.sub(r"\s+", " ", (raw or "")).strip()
        if not text:
            return None, False

        alias = MAKE_ALIASES.get(text.upper())
        if alias:
            text = alias

        canonical = self.makes.get(squash(text))
        if canonical:
            return canonical, True
        return smart_title(text), False  # plausible, but flag it for review

    def model(self, make: str | None, raw: str) -> tuple[str | None, bool]:
        """-> (canonical model or None, is_known). Trims variant grades."""
        text = re.sub(r"\s+", " ", (raw or "")).strip()
        if not text or not make:
            return None, False

        # Garbage guard: some records repeat the make in the model field.
        if squash(text) in self.makes or squash(text) == squash(make):
            return None, False

        known = self.models.get(make, {})

        # GWM records arrive as "JOLION", "HAVAL JOLION" or "GWM HAVAL H6".
        prefix = SUBBRAND_PREFIX.get(make)
        if prefix:
            stripped = re.sub(rf"^(?:{make}\s+)?(?:{prefix}\s+)?", "", text, flags=re.I).strip()
            candidate = f"{prefix} {stripped}" if stripped else text
            hit = known.get(squash(candidate))
            if hit:
                return hit, True
            text = candidate

        # 1. exact, ignoring case/spacing/punctuation
        hit = known.get(squash(text))
        if hit:
            return hit, True

        # 2. a variant grade on a model we know: ES300H -> ES, RX450hL -> RX.
        #    Longest canonical name wins so C-HR beats a hypothetical C.
        target = squash(text)
        best = None
        for key, canonical in known.items():
            if len(key) >= 2 and target.startswith(key):
                if best is None or len(key) > len(best[0]):
                    best = (key, canonical)
        if best:
            return best[1], True

        # 3. genuinely new model -- keep it, but flag it
        return smart_title(text), False


def normalise(catalog: Catalog, found: dict) -> dict:
    """Rewrite a CrashZone result in our conventions.

    Adds `_review` listing anything not matched to the canonical tables.
    """
    out = dict(found)
    review: list[str] = []

    make, make_known = catalog.make(found.get("make", ""))
    if make:
        out["make"] = make
        if not make_known:
            review.append(f"unknown make {make!r}")
    else:
        out.pop("make", None)

    model, model_known = catalog.model(make, found.get("model", ""))
    if model:
        out["model"] = model
        if not model_known:
            review.append(f"new model {make} {model!r}")
    else:
        out.pop("model", None)

    if review:
        out["_review"] = "; ".join(review)
    return out
