import { readFile, readdir } from "fs/promises";
import path from "path";
import type { Artist, ArtistStory, ResearchFile } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
    return JSON.parse(raw) as ArtistStory;
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
