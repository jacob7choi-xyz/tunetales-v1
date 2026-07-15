# backend/services/ai/story_compiler.py

"""Compiles a generated narrative into the unified story schema v2."""

import re

from schemas.story_schema import ArtistStory, ChapterAmbience, StoryChapter

# Hue rotation so unmigrated generated stories still get gentle color
# variety across chapters; the owner curates real moods afterwards.
CHAPTER_HUES = ["260, 70%, 55%", "220, 80%, 50%", "270, 65%, 50%",
                "340, 70%, 55%", "195, 75%, 50%", "290, 70%, 55%"]


def _slugify_heading(heading: str, index: int) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", heading.lower()).strip("_")
    return slug or f"chapter_{index + 1}"


def compile_story(artist_name: str, artist_slug: str, narrative_text: str) -> ArtistStory:
    """Split a markdown narrative (## headings) into schema v2 chapters.

    Args:
        artist_name: Display name, used for the story title.
        artist_slug: URL slug the frontend routes by.
        narrative_text: Claude-generated markdown with ## section headings.

    Returns:
        An ArtistStory ready to serialize for the frontend.
    """
    parts = re.split(r"^##\s+(.+)$", narrative_text, flags=re.MULTILINE)
    # parts = [preamble, heading1, body1, heading2, body2, ...]
    chapters: list[StoryChapter] = []
    for i in range(1, len(parts) - 1, 2):
        index = len(chapters)
        heading = parts[i].strip()
        content = parts[i + 1].strip()
        if not content:
            continue
        chapters.append(
            StoryChapter(
                id=_slugify_heading(heading, index),
                order=index + 1,
                title=heading.upper(),
                content=content,
                ambience=ChapterAmbience(accent_hsl=CHAPTER_HUES[index % len(CHAPTER_HUES)]),
            )
        )

    if not chapters:
        raise ValueError("Narrative contained no ## chapter headings to compile")

    return ArtistStory(
        title=f"{artist_name}: The Story",
        artist_slug=artist_slug,
        chapters=chapters,
    )
