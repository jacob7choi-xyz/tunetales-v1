import { readFile } from "fs/promises";
import path from "path";
import type {
  Artist,
  ArtistLegacy,
  ArtistStory,
  LegacyArtistStory,
  SongUniverse,
  StoryChapter,
} from "./types";
import type { PublicResearchIndex, PublicResearchSource } from "./public/types";
import { SLUG_PATTERN } from "./tokens";

const DATA_DIR = path.join(process.cwd(), "data");
// The public classification boundary: the only data directory that ships.
// See data/public/README.md before adding any reader outside it.
const PUBLIC_DIR = path.join(DATA_DIR, "public");

const DEFAULT_AMBIENCE = {
  mood: "introspective",
  accentHsl: "260, 65%, 50%",
  spotifyTrackId: null,
} as const;

// Accepts either schema version and always returns v2. Unmigrated v1
// stories get a neutral ambience so they still render in the journey.
export function normalizeLegacyStory(
  raw: ArtistStory | LegacyArtistStory,
  slug: string
): ArtistStory {
  if ("schemaVersion" in raw && raw.schemaVersion === 2) {
    return {
      ...raw,
      chapters: [...raw.chapters].sort((a, b) => a.order - b.order),
    };
  }
  const legacy = raw as LegacyArtistStory;
  const chapters: StoryChapter[] = legacy.sections.map((section, i) => ({
    id: section.id,
    order: i + 1,
    title: section.title,
    content: section.content,
    ambience: { ...DEFAULT_AMBIENCE },
  }));
  return {
    schemaVersion: 2,
    title: legacy.title,
    artistSlug: slug,
    chapters,
  };
}

function validateSlug(slug: string): void {
  if (!slug || !SLUG_PATTERN.test(slug)) {
    throw new Error("Invalid slug");
  }
}

export async function getArtists(): Promise<Artist[]> {
  try {
    const raw = await readFile(path.join(PUBLIC_DIR, "artists.json"), "utf-8");
    return JSON.parse(raw) as Artist[];
  } catch {
    return [];
  }
}

export async function getArtistStory(slug: string): Promise<ArtistStory | null> {
  validateSlug(slug);
  try {
    const raw = await readFile(
      path.join(PUBLIC_DIR, "stories", `${slug}.json`),
      "utf-8"
    );
    const parsed = JSON.parse(raw) as ArtistStory | LegacyArtistStory;
    return normalizeLegacyStory(parsed, slug);
  } catch {
    return null;
  }
}

export async function getSongUniverse(slug: string): Promise<SongUniverse | null> {
  validateSlug(slug);
  try {
    const raw = await readFile(
      path.join(PUBLIC_DIR, "stories", `universe_${slug}.json`),
      "utf-8"
    );
    return JSON.parse(raw) as SongUniverse;
  } catch {
    return null;
  }
}

export async function getLegacy(slug: string): Promise<ArtistLegacy | null> {
  validateSlug(slug);
  try {
    const raw = await readFile(
      path.join(PUBLIC_DIR, "stories", `legacy_${slug}.json`),
      "utf-8"
    );
    return JSON.parse(raw) as ArtistLegacy;
  } catch {
    return null;
  }
}

// Runtime never opens raw research. It reads only the pipeline-projected
// public index (see backend/services/pipeline/build_research_index.py).
export async function getResearchIndex(
  slug: string
): Promise<PublicResearchSource[]> {
  validateSlug(slug);
  try {
    const raw = await readFile(
      path.join(PUBLIC_DIR, "research-index.json"),
      "utf-8"
    );
    const index = JSON.parse(raw) as PublicResearchIndex;
    return index[slug] ?? [];
  } catch {
    return [];
  }
}
