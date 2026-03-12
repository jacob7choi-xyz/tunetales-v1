# TuneTales

AI-powered music storytelling platform that turns artist histories into immersive, narrative-driven experiences.

TuneTales combines automated research (via Perplexity AI) with narrative generation (via Claude) to create in-depth artist stories. The MVP focuses on Frank Ocean as the first fully built-out artist experience.

---

## Features

### What's Working
- **Artist storytelling pages** -- Frank Ocean deep-dive with a 6-section interactive narrative modal, tabs for journey/discography/impact/sources
- **AI research pipeline** -- Perplexity API integration that aggregates content from music journalism sources, stores structured JSON with metadata and cost tracking
- **Narrative generation** -- Claude API transforms raw research into readable, story-driven content
- **Animated UI** -- Chromatic gradient backgrounds, floating musical notes with physics-based motion, glassmorphism navigation (Framer Motion, 60fps target)
- **Category filtering** -- Genre/era filtering on the homepage artist grid
- **Responsive design** -- Works across desktop and mobile

### Placeholder / In Progress
- Taylor Swift, Kendrick Lamar, Beyonce artist pages (coming soon stubs)
- No frontend-to-backend API bridge (Python scripts output JSON files; frontend reads them statically)
- No authentication, no database, no deployment

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15.3.3 (App Router), React 18, TypeScript (strict) |
| Styling | Tailwind CSS 3.4.17, Framer Motion 12.10.5 |
| Icons | Heroicons 2.2.0 |
| Research | Perplexity AI (sonar-pro model) via Python |
| Narrative | Claude API (3.5 Sonnet/Haiku) via Python |
| Data | JSON files on disk (`data/research/`, `data/stories/`) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.x
- npm

### Installation
```bash
git clone https://github.com/jacob7choi-xyz/tunetales-v1.git
cd tunetales-v1
npm install
```

### Environment Setup
```bash
cp backend/.env.example backend/.env
```

Add your API keys to `backend/.env`:
```
PERPLEXITY_API_KEY=your_key_here
CLAUDE_API_KEY=your_key_here
```

### Run
```bash
npm run dev
# Open http://localhost:3000
```

---

## Project Structure

```
tunetales-v1/
├── app/                        # Next.js App Router (frontend)
│   ├── artists/                # Artist pages (frank-ocean is the MVP)
│   ├── stories/[id]/           # Dynamic story detail pages
│   ├── components/             # Shared components
│   ├── page.tsx                # Homepage
│   └── layout.tsx              # Root layout
├── backend/
│   ├── api/research/           # Perplexity AI research pipeline
│   └── services/ai/            # Claude narrative generation
├── data/
│   ├── research/               # Cached API responses (JSON)
│   └── stories/                # Generated narratives (JSON)
├── public/                     # Static assets
└── scripts/                    # Build/dev utilities
```

---

## Data Pipeline

```
Perplexity AI  -->  data/research/*.json  -->  Claude API  -->  data/stories/*.json  -->  Frontend
```

There is no HTTP API between frontend and backend. Python scripts generate JSON files; the frontend reads them.

---

## License

MIT -- see [LICENSE](LICENSE) for details.

---

*Embark on an exquisite musical odyssey. Discover the stories behind the music.*

*TuneTales -- where every song becomes a universe.*

---

Built by [Jacob J. Choi](https://jacobjchoi.xyz)
