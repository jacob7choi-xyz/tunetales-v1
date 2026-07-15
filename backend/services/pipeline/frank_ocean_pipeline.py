# backend/services/pipeline/frank_ocean_pipeline.py

"""End-to-end generation pipeline: research -> narrative -> story JSON.

Writes to frank-ocean.generated.json by default so a pipeline run never
silently overwrites the hand-curated live story (frank-ocean.json). Pass
an explicit output_filename to publish over the live file.
"""

import os

from schemas.story_schema import ArtistStory
from services.ai.claude_client import ClaudeStorytellingClient
from services.ai.story_compiler import compile_story

ARTIST_NAME = "Frank Ocean"
ARTIST_SLUG = "frank-ocean"
STORIES_DIR = os.path.join(os.path.dirname(__file__), "../../../data/stories")
DEFAULT_OUTPUT = f"{ARTIST_SLUG}.generated.json"


def run_pipeline(output_filename: str = DEFAULT_OUTPUT) -> ArtistStory:
    """Generate a fresh Frank Ocean story from the cached research.

    Args:
        output_filename: File name inside data/stories/ to write.

    Returns:
        The compiled ArtistStory that was written to disk.
    """
    client = ClaudeStorytellingClient()

    narrative = client.create_artist_narrative(ARTIST_NAME)
    if "error" in narrative:
        raise RuntimeError(f"Narrative generation failed: {narrative['error']}")

    story = compile_story(ARTIST_NAME, ARTIST_SLUG, narrative["narrative"])

    output_path = os.path.join(STORIES_DIR, output_filename)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(story.to_json() + "\n")

    print(f"[SAVED] Compiled story written to: {output_path}")
    return story


if __name__ == "__main__":
    result = run_pipeline()
    print(f"[OK] {len(result.chapters)} chapters compiled for {ARTIST_NAME}")
