# TuneTales

Immersive, narrative-driven music storytelling. TuneTales turns an artist's history into a cinematic experience: deeply researched stories, told with warmth, paired with the music itself.

**Live: [tunetales-v1.vercel.app](https://tunetales-v1.vercel.app)**

The theme of the project is connection. Every design and engineering decision serves one goal: making a listener feel closer to the artists and songs they love.

---

## The Experience

### The Homepage
A deep-nebula night sky with a three-layer twinkling starfield. Each artist is a poster card wrapped in their own aura color, and the entire room's ambient light shifts to match whichever artist you hover: violet for Frank Ocean, ember for Kendrick Lamar, rose for Taylor Swift, gold for Beyonce. Story teasers whisper in on hover.

### The Journey
A full-page, chapter-based reading experience for an artist's life story (`/artists/frank-ocean/journey`). Six chapters in true chronological order, each with its own mood: the page's ambient color cross-fades per chapter, entrances are staggered, navigation works by button, progress dot, or arrow key, and each chapter ends with the song that belongs to that moment, playable in place.

### The Musical Odyssey
The complete discography as a film in six acts (`/artists/frank-ocean?tab=discography`): Nostalgia, Ultra / Channel Orange / Endless / Blonde / Singles / Collaborations. Each act has a tagline and its own ambient tint that takes over as you scroll into it. Songs are album-art poster cards in side-scrolling film strips; opening one takes over the entire screen with a mood-tinted story reader and, where the song exists on streaming, the track itself.

### The Catalog
All 77 songs across the artist's career, each with an original researched origin story and a classified emotional mood that drives its color everywhere it appears:

| Era | Songs | Playable |
|-----|-------|----------|
| Nostalgia, Ultra (2011) | 10 | 3 |
| Channel Orange (2012) | 15 | 14 |
| Endless (2016) | 16 | 1 |
| Blonde (2016) | 17 | 17 |
| Singles (2017-2020) | 9 | 9 |
| Collaborations | 10 | 10 |

Songs that have never been released to streaming say so honestly in the reader instead of pretending otherwise.

### Research Transparency
The Research Sources tab shows the actual paper trail: a three-step account of how stories are made (researched, written, finished by hand) and a live archive of every research file behind the content, with dates and source volume. Nothing is written that is not on file.

---

## Architecture

Two halves with a deliberate split: a Next.js app that serves the experience, and a Python pipeline that generates content. The pipeline runs locally and writes JSON; the site reads JSON. They never talk at runtime.

```
Research engine ----> data/research/*.json      (cited source material)
                              |
Story pipeline  ----> data/stories/*.json       (narratives, song stories, universe)
                              |
                      data/artists.json         (registry: identity, aura, teaser)
                              |
                app/lib/data.ts  (slug validation, schema normalization)
                              |
        /api/artists   /api/research   /api/universe
                              |
                   app/ (pages + components)
```

Key properties:

- **Generation is explicit and safe.** The pipeline writes to `*.generated.json` by default and never overwrites hand-curated content. Regeneration is incremental: existing song stories are reused, so growing the catalog only pays for what is new.
- **The registry is the single source of truth.** Each artist's photo, aura color, and teaser live in `data/artists.json`; every page derives from it. Adding an artist is data entry, not page building.
- **Story schema v2** carries per-chapter ambience (mood, accent color, track, imagery hints), with a compatibility normalizer so older story files still render.
- **The API layer sanitizes.** Internal pipeline metadata is stripped at the boundary before anything is served.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS 4 (structural) + inline styles (visual), CSS keyframes for all continuous animation |
| Motion | Framer Motion for entrances, transitions, and interactions |
| Typography | Playfair Display (display serif) + Inter (text), self-hosted via next/font |
| Content pipeline | Python 3.11+, managed with uv (`pyproject.toml` + `uv.lock`), FastAPI generation service |
| Data | JSON on disk (`data/`), validated and normalized at the access layer |
| Music | Official streaming embeds, one verified track ID per available song |
| Artwork | Album art from streaming CDN and Wikipedia; artist photography from Wikimedia Commons |
| Testing | Vitest + Testing Library (81 tests), GitHub Actions CI |
| Hosting | Vercel |

---

## Getting Started

### Frontend

```bash
npm install
npm run dev        # http://localhost:3000
```

That is all the site needs. All content ships as JSON in `data/`, so the frontend runs fully without any keys.

### Content pipeline (optional, for generating new content)

```bash
cd backend
uv sync
cp .env.example .env   # then add your API keys
```

Run the generation service:

```bash
uv run uvicorn api.fastapi_app:app --reload
```

Or drive the pipeline directly from Python (research a song, write its story, rebuild the universe). Generation costs real API credits and is always an explicit, owner-run step.

---

## Quality Gate

Every change must pass all four before merge:

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build
```

CI runs the same gate plus `npm audit --audit-level=high`. Conventions that matter here:

- Inline styles for visual CSS properties (Tailwind v4 utilities are unreliable for them in this project)
- CSS `@keyframes` for anything that animates continuously; JS animation loops are banned
- Slug validation with a strict whitelist before any filesystem access
- Every API route handler has tests covering its 200, 400, and 404 paths
- Generated prose carries no machine tells: no em or en dashes, no stock phrases, enforced in prompts and by a deterministic polish pass

---

## Project Structure

```
tunetales-v1/
├── app/
│   ├── page.tsx                       # Homepage: starfield, aura posters, responsive room
│   ├── artists/
│   │   ├── frank-ocean/page.tsx       # Artist page: hero, tabs, odyssey, sources
│   │   └── frank-ocean/journey/       # The chapter-based Journey experience
│   ├── components/                    # Navbar, Starfield, AmbienceLayer, SongOdyssey,
│   │                                  # StoryCard, SpotifyEmbed, chapter navigation
│   ├── lib/                           # data access, types, design tokens, covers, tracks
│   └── api/                           # artists, research, universe routes
├── backend/
│   ├── api/                           # research client, FastAPI generation service
│   ├── services/                      # storytelling client, story compiler, pipeline
│   └── schemas/                       # Pydantic mirror of the story schema
├── data/
│   ├── artists.json                   # Artist registry (identity, aura, teaser)
│   ├── research/                      # Cited research, saved verbatim
│   └── stories/                       # Journey chapters, song stories, the universe
└── tests/                             # Vitest suite: data, schema, components, routes
```

---

## Roadmap

- Cultural Legacy tab: an interactive map of the artist's influence
- Second artist end to end, powered by the same registry and pipeline
- Remaining artwork for the three songs without clean sources
- Custom domain

---

## Credits

Built by [Jacob J. Choi](https://jacobjchoi.xyz).

Artist photography via Wikimedia Commons (freely licensed). Frank Ocean hero portrait by Andras Ladocsi, licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); pinned locally with full provenance in [ASSET_PROVENANCE.md](ASSET_PROVENANCE.md). Album artwork displayed under fair use via Wikipedia and official streaming CDNs. Music playback through official embeds; all rights to the music belong to the artists and their labels. Stories are original writing grounded in cited music journalism.
