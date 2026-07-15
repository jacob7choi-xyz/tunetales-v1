import { readFile, readdir } from "fs/promises";
import path from "path";
import type {
  Artist,
  ArtistStory,
  LegacyArtistStory,
  ResearchFile,
  StoryChapter,
} from "./types";
import { SLUG_PATTERN } from "./tokens";

const DATA_DIR = path.join(process.cwd(), "data");

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
    const raw = await readFile(path.join(DATA_DIR, "artists.json"), "utf-8");
    return JSON.parse(raw) as Artist[];
  } catch {
    return [];
  }
}

export async function getArtistStory(slug: string): Promise<ArtistStory | null> {
  validateSlug(slug);
  try {
    const raw = await readFile(
      path.join(DATA_DIR, "stories", `${slug}.json`),
      "utf-8"
    );
    const parsed = JSON.parse(raw) as ArtistStory | LegacyArtistStory;
    return normalizeLegacyStory(parsed, slug);
  } catch {
    return null;
  }
}

export async function getResearchFiles(slug: string): Promise<ResearchFile[]> {
  validateSlug(slug);
  const researchDir = path.join(DATA_DIR, "research");
  const artistName = slug.replace(/-/g, "_").toLowerCase();

  try {
    const files = await readdir(researchDir);
    const matching = files.filter(
      (f) => f.toLowerCase().includes(artistName) && f.endsWith(".json")
    );

    const results: ResearchFile[] = [];
    for (const file of matching) {
      try {
        const raw = await readFile(path.join(researchDir, file), "utf-8");
        results.push(JSON.parse(raw) as ResearchFile);
      } catch {
        // Skip malformed files
      }
    }

    return results;
  } catch {
    return [];
  }
}
