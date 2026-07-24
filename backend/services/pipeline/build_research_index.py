# backend/services/pipeline/build_research_index.py

"""Projects raw research files into the public research index.

This module is part of the security perimeter: raw research files carry
provider metadata and full API responses that never ship. Each index row
is constructed field by field into the public schema (queryLabel, date,
tokens), the full output is strictly validated, and the write is atomic.
A failed build leaves the previous valid index intact.

Run after any research pipeline run:
    cd backend && python services/pipeline/build_research_index.py
"""

import glob
import json
import os
import re
from typing import Any

from services.pipeline.public_artifacts import write_public_json

RESEARCH_DIR = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "../../../data/research")
)
INDEX_FILENAME = "research-index.json"
SLUG_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

# The only research categories that exist. An unknown query_type fails the
# whole build: classification of new categories is a deliberate decision,
# never an automatic passthrough.
QUERY_LABELS = {
    "artist_info": "Artist profile research",
    "timeline": "Career timeline research",
    "album_info": "Album deep dive",
    "song_story": "Song story research",
}


def _slugify(artist_name: str) -> str:
    """Derive the registry slug from a research file's artist name."""
    return artist_name.strip().lower().replace(" ", "-")


def _project_row(metadata: dict[str, Any], source_file: str) -> dict[str, Any]:
    """Build one public index row, field by field, failing closed.

    Args:
        metadata: The raw research file's metadata block.
        source_file: File name, used only in error messages.

    Returns:
        A row with exactly the public schema: queryLabel, date, tokens.

    Raises:
        ValueError: If any field is missing, of the wrong type, or the
            query_type is not a known category.
    """
    query_type = metadata.get("query_type")
    if query_type not in QUERY_LABELS:
        raise ValueError(f"Unknown query_type {query_type!r} in {source_file}")

    date = metadata.get("timestamp")
    if not isinstance(date, str) or not date:
        raise ValueError(f"Missing timestamp in {source_file}")

    tokens = metadata.get("tokens_used")
    if not isinstance(tokens, int) or isinstance(tokens, bool) or tokens < 0:
        raise ValueError(f"Invalid tokens_used in {source_file}")

    return {"queryLabel": QUERY_LABELS[query_type], "date": date, "tokens": tokens}


def _validate_index(index: dict[str, Any]) -> None:
    """Strictly validate the finished index before it may be published.

    Raises:
        ValueError: On any structural deviation from the public schema.
    """
    if not isinstance(index, dict) or not index:
        raise ValueError("Index must be a non-empty object keyed by slug")
    for slug, rows in index.items():
        if not SLUG_PATTERN.match(slug):
            raise ValueError(f"Invalid artist slug in index: {slug!r}")
        if not isinstance(rows, list) or not rows:
            raise ValueError(f"Empty or non-list rows for {slug!r}")
        for row in rows:
            if set(row.keys()) != {"queryLabel", "date", "tokens"}:
                raise ValueError(f"Row keys deviate from schema for {slug!r}: {sorted(row)}")
            if not isinstance(row["queryLabel"], str) or not row["queryLabel"]:
                raise ValueError(f"Empty queryLabel for {slug!r}")
            if not isinstance(row["date"], str) or not row["date"]:
                raise ValueError(f"Empty date for {slug!r}")
            if not isinstance(row["tokens"], int) or isinstance(row["tokens"], bool):
                raise ValueError(f"Non-integer tokens for {slug!r}")


def build_research_index() -> str:
    """Project all raw research into the public index and publish it.

    Returns:
        Absolute path of the published index.

    Raises:
        ValueError: If any research file cannot be classified into the
            public schema. Nothing is written in that case.
    """
    index: dict[str, list[dict[str, Any]]] = {}

    for filepath in sorted(glob.glob(os.path.join(RESEARCH_DIR, "*.json"))):
        filename = os.path.basename(filepath)
        with open(filepath, "r", encoding="utf-8") as f:
            raw = json.load(f)
        metadata = raw.get("metadata")
        if not isinstance(metadata, dict):
            raise ValueError(f"Missing metadata block in {filename}")

        artist_name = metadata.get("artist_name")
        if not isinstance(artist_name, str) or not artist_name:
            raise ValueError(f"Missing artist_name in {filename}")

        slug = _slugify(artist_name)
        index.setdefault(slug, []).append(_project_row(metadata, filename))

    for rows in index.values():
        rows.sort(key=lambda row: row["date"], reverse=True)

    _validate_index(index)
    return write_public_json(INDEX_FILENAME, index)


if __name__ == "__main__":
    path = build_research_index()
    with open(path, "r", encoding="utf-8") as f:
        built = json.load(f)
    total = sum(len(rows) for rows in built.values())
    print(f"[PUBLISHED] Research index: {path} ({total} rows, {len(built)} artists)")
