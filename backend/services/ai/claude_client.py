# backend/services/ai/claude_client.py

import glob
import json
import os
import re
from datetime import datetime
from typing import Dict

import anthropic
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Model IDs per provider (STORY_PROVIDER env var selects: anthropic | openai)
NARRATIVE_MODEL = "claude-sonnet-4-6"
MOOD_MODEL = "claude-haiku-4-5"
OPENAI_NARRATIVE_MODEL = "gpt-5-mini"
OPENAI_MOOD_MODEL = "gpt-5-nano"
OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"

MOOD_COLORS = {
    "nostalgic": "#9A6B9A",
    "melancholic": "#4A6FA5",
    "energetic": "#E74C3C",
    "triumphant": "#F39C12",
    "introspective": "#27AE60",
    "romantic": "#E91E63",
    "rebellious": "#8E44AD",
    "peaceful": "#3498DB",
    "intense": "#D35400",
    "playful": "#F1C40F",
}
DEFAULT_MOOD = "introspective"
DEFAULT_BUBBLE_COLOR = "#7F8C8D"


def _build_narrative_prompt(artist_name: str, artist_content: str, timeline_content: str) -> str:
    """Build the Disney-narrator prompt for a full artist narrative."""
    timeline_block = f"TIMELINE DETAILS: {timeline_content}" if timeline_content else ""
    return f"""You are a gentle, wise storyteller in the tradition of Disney's greatest narrators - think Jiminy Cricket or the narrator from classic Disney films. You have a warm, twinkling voice that makes listeners feel like they're gathered around a cozy fireplace, hearing a wonderful story about someone quite special.

        Tell the story of {artist_name} with the heart and wonder of a Disney tale - magical but real, whimsical but grounded, beautiful but never overly dramatic.

        RESEARCH TO WEAVE INTO YOUR STORY:
        {artist_content}

        {timeline_block}

        Create a gentle, enchanting narrative with these sections:

        ## Once Upon a Time...
        Begin like a classic Disney story. Introduce {artist_name} as a person - where they came from, what made them special from the start. Use warm, simple language that makes listeners smile and feel curious to know more.

        ## The Magic They Discovered
        Tell us about their musical gift - not as something grandiose, but as something beautiful they found along the way. How did they discover their voice? What made their music special? Make it feel like watching someone discover they can paint with starlight.

        ## Adventures Along the Way
        Share 3-4 key moments in their journey - the challenges they faced, the friends they met, the choices they made. Tell these like gentle adventures, with wisdom and heart. Even difficult moments should feel like part of a greater story of growth.

        ## The Gift They Share
        Conclude with how their music touches hearts and what makes them special in the world. Keep it warm and hopeful, like the end of a beloved Disney film.

        DISNEY STORYTELLING GUIDELINES:
        - Write in third person with a warm narrator voice ("Now, Frank was the kind of person who...")
        - Use gentle, accessible language - beautiful but not overly poetic
        - Include moments of quiet wonder and gentle humor
        - Focus on heart, hope, and human connection over drama
        - Keep metaphors simple and warm (like comparing music to "painting with sound" rather than complex imagery)
        - Make it feel like a bedtime story told by someone who truly cares about the subject
        - 700-900 words of pure warmth and wonder
        - End on a note that makes listeners feel inspired and happy

        PROSE CRAFT (non-negotiable):
        - Write in full, flowing sentences shaped by commas and periods, the way a storyteller speaks aloud
        - Never use em dashes or en dashes, and avoid hyphenated phrases wherever graceful wording exists instead
        - Avoid stock phrases that sound machine written, such as "little did he know", "a testament to", "in many ways", "it is worth noting"
        - Vary your sentence rhythm the way spoken stories do

        Remember: This isn't a biography - it's a gentle celebration of a remarkable person, told with all the heart and magic of classic Disney storytelling."""


def _build_song_prompt(artist_name: str, song_name: str, song_content: str) -> str:
    """Build the Disney-narrator prompt for a single song's origin story."""
    return f"""You are a warm, wise storyteller in the spirit of the great Disney narrators, about to share the true story of how a special song came to be. Your gift is making listeners feel close to the moment of creation - with wonder and warmth, but always honest to what the song really is. Some songs are joyful; some ache. You tell both truthfully.

        RESEARCH TO WEAVE INTO YOUR STORY:
        {song_content}

        Tell the story of "{song_name}" by {artist_name} with these chapters:

        ## How It All Began
        Open inside a specific real moment from this song's creation. Where was {artist_name} when this song first took shape? What was happening in their world? Make it feel vivid and real.

        ## The Creative Adventure
        Tell us how the song grew and changed, like watching a garden bloom. Who helped along the way? What challenges did they face? What moments of discovery happened? Make it feel like a gentle adventure story.

        ## The Heart of the Song
        Share what the song really means - both to {artist_name} and to those who hear it. But tell it gently, like explaining why a lullaby is special, not like analyzing literature.

        ## Why It Matters
        End with how this song touches hearts and why it's become special to so many people. Keep it warm and hopeful.

        STORYTELLING GUIDELINES:
        - Write as a warm, wise narrator who truly loves this song
        - Use simple, beautiful language that makes people feel something real
        - Honor the song's true emotional weight: if it is heartbroken, aching, fierce, or strange, let the story carry that feeling, held gently. Warmth means honesty told kindly, never avoidance
        - Match the story's energy to the song's energy: a quiet ballad gets a hushed story, an epic gets sweep and momentum
        - Ground the story in 2-3 verified specifics from the research (real names, places, dates, studio moments)
        - Do NOT open with "Once upon" or any stock fairy-tale phrase; begin inside a specific real moment, place, or image from this song's actual story
        - Use warm metaphors sparingly, and only ones this particular song has earned
        - Make listeners feel like they were there watching it happen
        - 500-700 words
        - End with why this song stays with people, in a way that is true to its feeling: hopeful endings for hopeful songs, tender endings for sad ones

        PROSE CRAFT (non-negotiable):
        - Write the way a master storyteller speaks aloud: full, flowing sentences shaped by commas and periods
        - Never use em dashes or en dashes, and avoid hyphenated phrases wherever graceful wording exists instead
        - No lists, no headings inside your sections, no parentheses asides
        - Avoid stock phrases that sound machine written, such as "little did he know", "a testament to", "in many ways", "it is worth noting"
        - Vary your sentence rhythm the way spoken stories do: some sentences long and winding, some short
        - Every sentence should sound natural read aloud by a warm human voice

        Remember: You're not writing a documentary - you're sharing a gentle, magical story about how something beautiful came into the world, told with all the heart of classic Disney storytelling."""


def _polish_prose(text: str) -> str:
    """Deterministic safety net for the no-dash prose rule.

    The prompts forbid em and en dashes, but if one slips through it is
    softened into a comma so published stories never carry the tell.
    """
    import re

    text = re.sub(r"\s*[—–]\s*", ", ", text)
    text = re.sub(r", ,", ",", text)
    text = re.sub(r"  +", " ", text)
    return text


def _build_mood_prompt(story_text: str) -> str:
    """Build the single-word mood classification prompt.

    Reads the full story (not just the opening) and judges the song itself,
    since the narration style is uniformly warm and would otherwise collapse
    every song into the same one or two moods.
    """
    moods = "\n".join(f"- {mood}" for mood in MOOD_COLORS)
    return f"""You are classifying the emotional mood of a SONG, based on the story of how it was made and what it means.

Story:
{story_text[:6000]}

Which single word best captures the emotional character of the song itself -- its sound, its subject matter, and how it makes listeners feel? Ignore the storytelling style of the narration; judge the song underneath it. A song about heartbreak is melancholic even when narrated warmly. An epic, pulsing song is intense even when described gently.

Choose exactly one:
{moods}

Respond with only the mood word."""


class ClaudeStorytellingClient:
    """Storytelling client. Anthropic by default; set STORY_PROVIDER=openai
    to route generation through the OpenAI API with the same prompts."""

    def __init__(self, api_key: str | None = None):
        self.provider = (os.getenv("STORY_PROVIDER") or "anthropic").lower()
        self.openai_key = os.getenv("OPENAI_API_KEY")
        if self.provider == "openai":
            self.client = None
        else:
            resolved_key = api_key or os.getenv("ANTHROPIC_API_KEY") or os.getenv("CLAUDE_API_KEY")
            self.client = anthropic.Anthropic(api_key=resolved_key)

        # Paths for reading research data and saving stories
        self.research_dir = os.path.join(os.path.dirname(__file__), "../../../data/research")
        self.stories_dir = os.path.join(os.path.dirname(__file__), "../../../data/stories")
        os.makedirs(self.stories_dir, exist_ok=True)

    def _model_for(self, tier: str) -> str:
        """Resolve the concrete model for a task tier on the active provider."""
        if self.provider == "openai":
            return OPENAI_NARRATIVE_MODEL if tier == "narrative" else OPENAI_MOOD_MODEL
        return NARRATIVE_MODEL if tier == "narrative" else MOOD_MODEL

    def _load_research_data(self, artist_name: str) -> Dict:
        """Load all Perplexity research data for an artist.

        Files are sorted by name, which ends in a timestamp, so when multiple
        files exist for the same query type the newest one wins.
        """
        research_files = sorted(
            glob.glob(f"{self.research_dir}/*{artist_name.replace(' ', '_')}*.json"),
            key=os.path.basename,
        )

        if not research_files:
            raise FileNotFoundError(f"No research data found for {artist_name}")

        combined_research: Dict = {
            "artist_info": None,
            "timeline": None,
            "albums": [],
            "songs": [],
        }

        for file_path in research_files:
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)

                query_type = data.get("metadata", {}).get("query_type", "")

                if query_type == "artist_info":
                    combined_research["artist_info"] = data
                elif query_type == "timeline":
                    combined_research["timeline"] = data
                elif query_type == "album_info":
                    combined_research["albums"].append(data)
                elif query_type == "song_story":
                    combined_research["songs"].append(data)

            except (OSError, json.JSONDecodeError) as e:
                print(f"Error loading {file_path}: {e}")
                continue

        return combined_research

    def _save_story(
        self, story_type: str, artist_name: str, content_name: str, story_data: Dict
    ) -> str:
        """Save generated story to file."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_artist = artist_name.replace(" ", "_")
        safe_content = content_name.replace(" ", "_")
        filename = f"{story_type}_{safe_artist}_{safe_content}_{timestamp}.json"

        filepath = os.path.join(self.stories_dir, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(story_data, f, indent=2, ensure_ascii=False)

        print(f"[SAVED] Story saved to: {filename}")
        return filepath

    def _generate_text(self, tier: str, prompt: str, max_tokens: int, temperature: float) -> tuple[str, int, str]:
        """Generate text on the active provider.

        Args:
            tier: "narrative" or "mood" -- resolved to a concrete model.

        Returns:
            (text, output_tokens, model_used)
        """
        model = self._model_for(tier)

        if self.provider == "openai":
            payload: Dict = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
            }
            if model.startswith("gpt-5"):
                # GPT-5 models run at fixed default temperature and spend
                # hidden reasoning tokens from the completion budget
                payload["max_completion_tokens"] = max_tokens
                payload["reasoning_effort"] = "minimal"
            else:
                payload["max_tokens"] = max_tokens
                payload["temperature"] = temperature
            response = httpx.post(
                OPENAI_CHAT_URL,
                headers={"Authorization": f"Bearer {self.openai_key}"},
                json=payload,
                timeout=120,
            )
            response.raise_for_status()
            data = response.json()
            text = data["choices"][0]["message"]["content"]
            tokens = data.get("usage", {}).get("completion_tokens", 0)
            return text, tokens, model

        message = self.client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[{"role": "user", "content": prompt}],
        )
        text = "".join(block.text for block in message.content if block.type == "text")
        return text, message.usage.output_tokens, model

    def create_artist_narrative(self, artist_name: str, narrative_style: str = "disney") -> Dict:
        """Transform artist research into a compelling narrative overview."""
        research_data = self._load_research_data(artist_name)

        if not research_data["artist_info"]:
            raise ValueError(f"No artist info found for {artist_name}")

        artist_content = research_data["artist_info"]["response"]["choices"][0]["message"]["content"]
        timeline_content = (
            research_data["timeline"]["response"]["choices"][0]["message"]["content"]
            if research_data["timeline"]
            else ""
        )

        prompt = _build_narrative_prompt(artist_name, artist_content, timeline_content)

        try:
            narrative_text, tokens_used, model_used = self._generate_text(
                "narrative", prompt, max_tokens=3000, temperature=0.7
            )
            narrative_text = _polish_prose(narrative_text)
        except (anthropic.APIError, httpx.HTTPError) as e:
            print(f"Error calling story API: {e}")
            return {"error": str(e)}

        story_data = {
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "artist_name": artist_name,
                "story_type": "artist_narrative",
                "narrative_style": narrative_style,
                "model_used": model_used,
                "tokens_used": tokens_used,
            },
            "narrative": narrative_text,
            "source_research": {
                "artist_info_file": research_data["artist_info"]["metadata"],
                "timeline_file": (
                    research_data["timeline"]["metadata"] if research_data["timeline"] else None
                ),
            },
        }

        self._save_story("narrative", artist_name, "overview", story_data)
        return story_data

    def create_song_story(self, artist_name: str, song_name: str) -> Dict:
        """Transform song research into an intimate story about the song's creation."""
        research_data = self._load_research_data(artist_name)

        # Exact match first: at catalog scale, substring matching confuses
        # "Solo" with "Solo (Reprise)" and "White" with "White Ferrari"
        song_research = None
        for song_data in research_data["songs"]:
            if song_data["metadata"]["query_details"].strip().lower() == song_name.strip().lower():
                song_research = song_data
                break
        if not song_research:
            for song_data in research_data["songs"]:
                if song_name.lower() in song_data["metadata"]["query_details"].lower():
                    song_research = song_data
                    break

        if not song_research:
            raise ValueError(f"No research found for song: {song_name}")

        song_content = song_research["response"]["choices"][0]["message"]["content"]
        prompt = _build_song_prompt(artist_name, song_name, song_content)

        try:
            story_text, tokens_used, model_used = self._generate_text(
                "narrative", prompt, max_tokens=2500, temperature=0.7
            )
            story_text = _polish_prose(story_text)
        except (anthropic.APIError, httpx.HTTPError) as e:
            print(f"Error creating song story: {e}")
            return {"error": str(e)}

        story_data = {
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "artist_name": artist_name,
                "song_name": song_name,
                "story_type": "song_story",
                "model_used": model_used,
                "tokens_used": tokens_used,
            },
            "story": story_text,
            "source_research": song_research["metadata"],
        }

        self._save_story("song", artist_name, song_name, story_data)
        return story_data

    def _load_existing_song_story(self, artist_name: str, song_name: str) -> str | None:
        """Return the newest saved story text for a song, if one exists."""
        safe_artist = artist_name.replace(" ", "_")
        safe_song = song_name.replace(" ", "_")
        matches = sorted(
            glob.glob(f"{self.stories_dir}/song_{safe_artist}_{safe_song}_*.json"),
            key=os.path.basename,
        )
        if not matches:
            return None
        try:
            with open(matches[-1], "r", encoding="utf-8") as f:
                return json.load(f).get("story")
        except (OSError, json.JSONDecodeError):
            return None

    def create_bubble_universe(
        self, artist_name: str, skip_existing: bool = True, publish: bool = False
    ) -> Dict:
        """Create the complete bubble universe data structure for the artist.

        Incremental by default: songs that already have a saved story are
        reused instead of regenerated, so growing the catalog only pays for
        the new songs.

        Generation and publication are separate acts: the universe is
        always saved internally; it reaches data/public only when
        publish=True, after the generated stories have been reviewed.
        """
        research_data = self._load_research_data(artist_name)

        # Files are sorted oldest-first, so keeping the last occurrence per
        # song means re-researched songs use their newest research
        unique_songs: Dict[str, Dict] = {}
        for song_data in research_data["songs"]:
            unique_songs[song_data["metadata"]["query_details"].strip().lower()] = song_data

        song_bubbles = []
        for song_data in unique_songs.values():
            song_name = song_data["metadata"]["query_details"]
            try:
                story_text = (
                    self._load_existing_song_story(artist_name, song_name)
                    if skip_existing
                    else None
                )
                if story_text is None:
                    song_story = self.create_song_story(artist_name, song_name)
                    if "error" in song_story:
                        continue
                    story_text = song_story["story"]
                mood = self._extract_song_mood(story_text)
                song_bubbles.append(
                    {
                        "song_name": song_name,
                        "story": story_text,
                        "mood": mood,
                        "bubble_color": self._get_bubble_color(mood),
                    }
                )
            except (ValueError, KeyError) as e:
                print(f"Error creating story for {song_name}: {e}")
                continue

        artist_narrative = self.create_artist_narrative(artist_name)

        bubble_universe = {
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "artist_name": artist_name,
                "total_bubbles": len(song_bubbles),
                "universe_type": "complete",
            },
            "artist_overview": artist_narrative.get("narrative", ""),
            "song_bubbles": song_bubbles,
        }

        self._save_story("universe", artist_name, "complete", bubble_universe)
        if publish:
            self.publish_universe(artist_name, song_bubbles)
        return bubble_universe

    def publish_universe(self, artist_name: str, song_bubbles: list[Dict]) -> None:
        """Project the universe into its public artifact and publish it.

        A deliberate classification act, called only after review.
        Field-by-field projection with strict type validation: only the
        four public bubble fields cross into data/public, and malformed
        values fail the publish instead of being repaired into
        superficially valid public data. Internal metadata (models, token
        counts, the artist overview) never crosses.
        """
        from services.pipeline.public_artifacts import (
            require_exact_keys,
            require_str,
            write_public_json,
        )

        def validate_public_universe(obj: object) -> None:
            universe = require_exact_keys(
                obj, {"artist_slug", "song_bubbles"}, "universe"
            )
            require_str(universe["artist_slug"], "universe.artist_slug")
            if not isinstance(universe["song_bubbles"], list) or not universe["song_bubbles"]:
                raise ValueError("universe.song_bubbles must be a non-empty list")
            for entry in universe["song_bubbles"]:
                bubble = require_exact_keys(
                    entry, {"song_name", "story", "mood", "bubble_color"}, "bubble"
                )
                for field in ("song_name", "story", "mood", "bubble_color"):
                    require_str(bubble[field], f"bubble.{field}")

        slug = artist_name.strip().lower().replace(" ", "-")
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            raise ValueError(f"Cannot derive a publishable slug from {artist_name!r}")
        public_universe = {
            "artist_slug": slug,
            "song_bubbles": [
                {
                    "song_name": require_str(bubble["song_name"], "bubble.song_name"),
                    "story": require_str(bubble["story"], "bubble.story"),
                    "mood": require_str(bubble["mood"], "bubble.mood"),
                    "bubble_color": require_str(bubble["bubble_color"], "bubble.bubble_color"),
                }
                for bubble in song_bubbles
            ],
        }
        path = write_public_json(
            f"stories/universe_{slug}.json", public_universe, validate_public_universe
        )
        print(f"[PUBLISHED] Universe published to: {path}")

    def _extract_song_mood(self, story_text: str) -> str:
        """Extract the emotional mood from a song story using Claude."""
        try:
            mood_text, _, _ = self._generate_text(
                "mood", _build_mood_prompt(story_text), max_tokens=64, temperature=0.3
            )
            mood = mood_text.strip().lower()
            return mood if mood in MOOD_COLORS else DEFAULT_MOOD
        except (anthropic.APIError, httpx.HTTPError) as e:
            print(f"Error extracting mood: {e}")
            return DEFAULT_MOOD

    def _get_bubble_color(self, mood: str) -> str:
        """Map moods to bubble color schemes for UI theming."""
        return MOOD_COLORS.get(mood, DEFAULT_BUBBLE_COLOR)


# Test function
if __name__ == "__main__":
    client = ClaudeStorytellingClient()

    print("[INFO] Testing Claude Storytelling Client...")
    print("=" * 60)

    try:
        print("\n1. Creating Frank Ocean narrative...")
        narrative = client.create_artist_narrative("Frank Ocean")

        if "error" not in narrative:
            print("[OK] Artist narrative created successfully!")
            print(f"[STATS] Tokens used: {narrative['metadata']['tokens_used']}")
            print(f"[INFO] Story length: {len(narrative['narrative'])} characters")
            print("\n[PREVIEW] Preview:")
            print(narrative["narrative"][:200] + "...")
        else:
            print("[FAIL] Error:", narrative["error"])

    except Exception as e:
        print(f"[FAIL] Error testing narrative creation: {e}")

    print("\n" + "=" * 60)
    print("Check the data/stories/ folder for generated narratives!")
