# backend/schemas/story_schema.py

"""Pydantic mirror of the frontend story schema v2 (app/lib/types.ts).

Fields are snake_case in Python and serialize to the camelCase JSON keys
the Next.js frontend reads (schemaVersion, artistSlug, accentHsl, ...).
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

ChapterMood = Literal[
    "nostalgic",
    "melancholic",
    "triumphant",
    "introspective",
    "romantic",
    "rebellious",
    "peaceful",
    "intense",
    "playful",
    "wonder",
]


class CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ChapterAmbience(CamelModel):
    mood: ChapterMood = "introspective"
    accent_hsl: str = "260, 65%, 50%"
    spotify_track_id: str | None = None
    imagery_hint: str | None = None


class StoryChapter(CamelModel):
    id: str
    order: int = Field(ge=1)
    title: str
    content: str
    ambience: ChapterAmbience = ChapterAmbience()


class ArtistStory(CamelModel):
    schema_version: Literal[2] = 2
    title: str
    artist_slug: str
    chapters: list[StoryChapter]

    def to_json(self) -> str:
        """Serialize to the exact JSON shape the frontend consumes."""
        return self.model_dump_json(by_alias=True, indent=2)
