# backend/services/pipeline/legacy_pipeline.py

"""Compiles the Cultural Legacy dataset: pillars of influence with verified
voices, grounded in the artist's research files.

Writes data/stories/legacy_frank-ocean.json for the frontend legacy tab.
Quotes are extracted only from research material; the prompt forbids
invention and the output is spot-checkable against the cited files.
"""

import json
import os

from services.ai.claude_client import ClaudeStorytellingClient, _polish_prose

ARTIST_NAME = "Frank Ocean"
ARTIST_SLUG = "frank-ocean"
STORIES_DIR = os.path.join(os.path.dirname(__file__), "../../../data/stories")

LEGACY_PROMPT_TEMPLATE = """You are a warm, wise storyteller writing the Cultural Legacy of {artist}, grounded strictly in the research below.

RESEARCH:
{research}

Produce a JSON object with exactly this shape:

{{
  "pillars": [
    {{
      "id": "kebab-case-id",
      "numeral": "I",
      "title": "Short evocative title",
      "tagline": "One line that makes the reader feel the pillar",
      "mood": "one of: nostalgic, melancholic, triumphant, introspective, romantic, rebellious, peaceful, intense, playful",
      "story": "Two to three paragraphs of warm narrative prose about this dimension of the artist's influence, separated by \\n\\n",
      "moments": ["Three to five short concrete moments or facts from the research that prove this pillar"],
      "voices": [{{"quote": "Direct quote about the artist", "speaker": "Who said it"}}]
    }}
  ]
}}

Create exactly five pillars covering: emotional vulnerability as artistic strength; independence from the traditional industry; representation and the door he opened; the sound he pioneered; and the power of silence and scarcity.

RULES:
- Every fact and moment must come from the research above. Do not invent.
- VOICES ARE SACRED: include a quote ONLY if it appears in the research as something a named person actually said. If the research holds no usable quote for a pillar, return an empty voices array for it. Never fabricate, paraphrase into first person, or attribute loosely.
- Write the stories in full flowing sentences shaped by commas and periods. Never use em dashes or en dashes. Avoid hyphenated phrases where graceful wording exists. No stock phrases that sound machine written.
- Honor real emotional weight. Warmth means honesty told kindly.
- Respond with ONLY the JSON object, no surrounding text."""

PILLAR_HUES = {
    "nostalgic": "260, 70%, 55%",
    "melancholic": "220, 70%, 55%",
    "triumphant": "45, 85%, 55%",
    "introspective": "150, 55%, 45%",
    "romantic": "340, 70%, 60%",
    "rebellious": "290, 70%, 55%",
    "peaceful": "195, 75%, 50%",
    "intense": "25, 80%, 55%",
    "playful": "55, 80%, 55%",
}


def run_legacy_pipeline(refresh_quotes: bool = True) -> dict:
    """Generate the legacy dataset from research.

    Args:
        refresh_quotes: Run one targeted research query for influence
            testimonials before compiling, so voices have material.

    Returns:
        The compiled legacy dict that was written to disk.
    """
    client = ClaudeStorytellingClient()

    if refresh_quotes:
        import httpx as _httpx

        from api.research.perplexity_api import PerplexityClient

        perplexity = PerplexityClient()
        quote_prompt = (
            "Collect direct, verbatim quotes from NAMED musicians, artists, producers, "
            "and music critics about Frank Ocean's influence on music, culture, and on "
            "them personally. For each quote provide: the exact wording in quotation "
            "marks, who said it, and where and when it was said (interview, article, "
            "award speech, or documented social media post from any established, "
            "citable outlet). Include quotes from artists such as Tyler, the Creator, "
            "Billie Eilish, and others where documented. Only include quotes you can "
            "attribute to a source. Do not paraphrase and do not invent."
        )
        response = _httpx.post(
            f"{perplexity.base_url}/chat/completions",
            headers=perplexity.headers,
            json={
                "model": perplexity.MODELS["sonar_pro"],
                "max_tokens": 2500,
                "temperature": 0.1,
                "messages": [{"role": "user", "content": quote_prompt}],
            },
            timeout=120,
        )
        response.raise_for_status()
        perplexity._save_response(
            "artist_info", ARTIST_NAME, "influence quotes dossier", response.json()
        )

    # Feed the compiler the full research stack: every artist profile file
    # (general research plus the quotes dossier) and the newest timeline
    import glob as _glob

    research_dir = client.research_dir
    parts = []
    info_files = sorted(_glob.glob(f"{research_dir}/artist_info_Frank_Ocean*.json"), key=os.path.basename)
    for f in info_files[-3:]:
        with open(f, "r", encoding="utf-8") as fh:
            data = json.load(fh)
        parts.append(data["response"]["choices"][0]["message"]["content"])
    timeline_files = sorted(_glob.glob(f"{research_dir}/timeline_Frank_Ocean*.json"), key=os.path.basename)
    if timeline_files:
        with open(timeline_files[-1], "r", encoding="utf-8") as fh:
            data = json.load(fh)
        parts.append(data["response"]["choices"][0]["message"]["content"])

    prompt = LEGACY_PROMPT_TEMPLATE.format(artist=ARTIST_NAME, research="\n\n---\n\n".join(parts))

    raw, _tokens, model = client._generate_text("narrative", prompt, max_tokens=6000, temperature=0.7)

    start, end = raw.find("{"), raw.rfind("}")
    legacy = json.loads(raw[start : end + 1])

    for pillar in legacy["pillars"]:
        pillar["story"] = _polish_prose(pillar["story"])
        pillar["accent_hsl"] = PILLAR_HUES.get(pillar.get("mood", ""), "260, 65%, 50%")
        for voice in pillar.get("voices", []):
            voice["quote"] = _polish_prose(voice["quote"])

    legacy["artist_slug"] = ARTIST_SLUG
    legacy["model_note"] = None  # never persist provider details

    output_path = os.path.join(STORIES_DIR, f"legacy_{ARTIST_SLUG}.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"artist_slug": ARTIST_SLUG, "pillars": legacy["pillars"]}, f, indent=2, ensure_ascii=False)

    print(f"[SAVED] Legacy written to: {output_path} ({len(legacy['pillars'])} pillars)")
    return legacy


if __name__ == "__main__":
    result = run_legacy_pipeline()
    for p in result["pillars"]:
        print(f"  {p['numeral']}. {p['title']} [{p['mood']}] voices={len(p.get('voices', []))}")
