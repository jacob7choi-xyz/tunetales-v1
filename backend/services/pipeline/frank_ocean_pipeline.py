# backend/services/pipeline/frank_ocean_pipeline.py

"""End-to-end generation pipeline: research -> narrative -> story JSON.

Writes an internal draft (frank-ocean.generated.json in data/stories/) by
default so a pipeline run never silently overwrites the hand-curated live
story. Publication into data/public/ is a separate, explicit act via
publish=True, only after the draft has been reviewed.
"""

import json
import os

from schemas.story_schema import ArtistStory
from services.ai.claude_client import ClaudeStorytellingClient
from services.ai.story_compiler import compile_story
from services.pipeline.public_artifacts import write_public_json

ARTIST_NAME = "Frank Ocean"
ARTIST_SLUG = "frank-ocean"
DRAFT_DIR = os.path.join(os.path.dirname(__file__), "../../../data/stories")
DEFAULT_OUTPUT = f"{ARTIST_SLUG}.generated.json"


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
            f"stories/{ARTIST_SLUG}.json", json.loads(story.to_json())
        )
        print(f"[PUBLISHED] Live story replaced at: {public_path}")

    return story


if __name__ == "__main__":
    result = run_pipeline()
    print(f"[OK] {len(result.chapters)} chapters compiled for {ARTIST_NAME}")
