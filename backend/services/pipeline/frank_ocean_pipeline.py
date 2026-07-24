# backend/services/pipeline/frank_ocean_pipeline.py

"""End-to-end generation pipeline: research -> narrative -> story JSON.

Writes an internal draft (frank-ocean.generated.json in data/stories/) by
default so a pipeline run never silently overwrites the hand-curated live
story. Publication into data/public/ is a separate, explicit act via
publish=True, only after the draft has been reviewed.
"""

import os

from schemas.story_schema import ArtistStory
from services.ai.claude_client import ClaudeStorytellingClient
from services.ai.story_compiler import compile_story
from services.pipeline.public_artifacts import (
    require_int,
    require_str,
    require_str_or_none,
    write_public_json,
)

ARTIST_NAME = "Frank Ocean"
ARTIST_SLUG = "frank-ocean"
DRAFT_DIR = os.path.join(os.path.dirname(__file__), "../../../data/stories")
DEFAULT_OUTPUT = f"{ARTIST_SLUG}.generated.json"


def to_public_story(story: ArtistStory) -> dict:
    """Project a story into the public artifact schema, field by field.

    Serializing the internal model wholesale would let any future internal
    field (scores, notes, generation metadata) leak into data/public the
    moment it is added. Only the fields named here ever cross, and each is
    type-validated rather than coerced.

    Args:
        story: The compiled internal story model.

    Returns:
        A dict containing exactly the public story schema.

    Raises:
        ValueError: If any field fails strict type validation.
    """
    return {
        "schemaVersion": 2,
        "title": require_str(story.title, "story.title"),
        "artistSlug": require_str(story.artist_slug, "story.artistSlug"),
        "chapters": [
            {
                "id": require_str(chapter.id, "chapter.id"),
                "order": require_int(chapter.order, "chapter.order"),
                "title": require_str(chapter.title, "chapter.title"),
                "content": require_str(chapter.content, "chapter.content"),
                "ambience": {
                    "mood": require_str(chapter.ambience.mood, "ambience.mood"),
                    "accentHsl": require_str(
                        chapter.ambience.accent_hsl, "ambience.accentHsl"
                    ),
                    "spotifyTrackId": require_str_or_none(
                        chapter.ambience.spotify_track_id, "ambience.spotifyTrackId"
                    ),
                    "imageryHint": require_str_or_none(
                        chapter.ambience.imagery_hint, "ambience.imageryHint"
                    ),
                },
            }
            for chapter in story.chapters
        ],
    }


def run_pipeline(output_filename: str = DEFAULT_OUTPUT, publish: bool = False) -> ArtistStory:
    """Generate a fresh Frank Ocean story from the cached research.

    Args:
        output_filename: Draft file name inside internal data/stories/.
        publish: When True, also replace the live public artifact
            data/public/stories/frank-ocean.json (a deliberate
            classification decision, only after review).

    Returns:
        The compiled ArtistStory that was written to disk.
    """
    client = ClaudeStorytellingClient()

    narrative = client.create_artist_narrative(ARTIST_NAME)
    if "error" in narrative:
        raise RuntimeError(f"Narrative generation failed: {narrative['error']}")

    story = compile_story(ARTIST_NAME, ARTIST_SLUG, narrative["narrative"])

    output_path = os.path.join(DRAFT_DIR, output_filename)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(story.to_json() + "\n")
    print(f"[SAVED] Draft story written to: {output_path}")

    if publish:
        public_path = write_public_json(
            f"stories/{ARTIST_SLUG}.json", to_public_story(story)
        )
        print(f"[PUBLISHED] Live story replaced at: {public_path}")

    return story


if __name__ == "__main__":
    result = run_pipeline()
    print(f"[OK] {len(result.chapters)} chapters compiled for {ARTIST_NAME}")
