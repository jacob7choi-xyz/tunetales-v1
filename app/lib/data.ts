import { randomBytes } from "crypto";
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
import type { PublicResearchSource } from "./public/types";
import { validatePublicResearchIndex } from "./public/validate";
import { SLUG_PATTERN } from "./tokens";

const DATA_DIR = path.join(process.cwd(), "data");
// The public classification boundary: the only data directory that ships.
// See data/public/README.md before adding any reader outside it.
const PUBLIC_DIR = path.join(DATA_DIR, "public");

// Tri-state read results: absence and failure are different facts and are
// never conflated. Missing is an expected state the UI can degrade on;
// failed carries an opaque errorId that correlates a user-visible outcome
// with a server-side log line. errorIds contain no paths, no exception
// text, no request data.
export type ReadResult<T> =
  | { status: "available"; data: T }
  | { status: "missing" }
  | { status: "failed"; errorId: string };

function fail(context: string, error: unknown): ReadResult<never> {
  const errorId = randomBytes(6).toString("hex");
  console.error(`[data:${errorId}] ${context} read failed:`, error);
  return { status: "failed", errorId };
}

function isFileMissing(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

// Shared bottom layer for all public-artifact reads. Exported for direct
// unit testing of the tri-state semantics.
export async function readJsonFile(
  filePath: string,
  context: string
): Promise<ReadResult<unknown>> {
  let raw: string;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch (error) {
    if (isFileMissing(error)) return { status: "missing" };
    return fail(context, error);
  }
  try {
    return { status: "available", data: JSON.parse(raw) };
  } catch (error) {
    return fail(context, error);
  }
}

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

// The registry is mandatory deployment content: its absence is
// infrastructure corruption, never a legitimate empty state, and must not
// cascade into 404s downstream (S7). The registry is also authorization
// input (S9 slug allowlist), so each entry's identity field is runtime
// validated before anything trusts it; a malformed entry fails the whole
// read closed. Exported so the mapping is unit-testable without
// filesystem mocking.
export function normalizeRegistryRead(
  result: ReadResult<unknown>
): ReadResult<Artist[]> {
  if (result.status === "missing") {
    return fail("artists registry", new Error("registry file is missing"));
  }
  if (result.status === "failed") return result;
  if (!Array.isArray(result.data)) {
    return fail("artists registry", new Error("registry is not an array"));
  }
  for (const entry of result.data) {
    if (
      typeof entry !== "object" ||
      entry === null ||
      typeof (entry as { id?: unknown }).id !== "string" ||
      !SLUG_PATTERN.test((entry as { id: string }).id)
    ) {
      return fail("artists registry", new Error("registry entry has invalid identity"));
    }
  }
  return { status: "available", data: result.data as Artist[] };
}

export async function readArtists(): Promise<ReadResult<Artist[]>> {
  return normalizeRegistryRead(
    await readJsonFile(path.join(PUBLIC_DIR, "artists.json"), "artists registry")
  );
}

// The canonical slug allowlist (S9): a slug that passes the syntax gate
// still resolves to nothing unless it names a registered artist.
export async function isRegisteredArtist(slug: string): Promise<ReadResult<boolean>> {
  validateSlug(slug);
  const artists = await readArtists();
  if (artists.status !== "available") return artists;
  return {
    status: "available",
    data: artists.data.some((artist) => artist.id === slug),
  };
}

export async function readArtistStory(
  slug: string
): Promise<ReadResult<ArtistStory>> {
  validateSlug(slug);
  const result = await readJsonFile(
    path.join(PUBLIC_DIR, "stories", `${slug}.json`),
    "artist story"
  );
  if (result.status !== "available") return result;
  try {
    return {
      status: "available",
      data: normalizeLegacyStory(result.data as ArtistStory | LegacyArtistStory, slug),
    };
  } catch (error) {
    return fail("artist story", error);
  }
}

export async function readSongUniverse(
  slug: string
): Promise<ReadResult<SongUniverse>> {
  validateSlug(slug);
  const result = await readJsonFile(
    path.join(PUBLIC_DIR, "stories", `universe_${slug}.json`),
    "song universe"
  );
  if (result.status !== "available") return result;
  return { status: "available", data: result.data as SongUniverse };
}

export async function readLegacy(
  slug: string
): Promise<ReadResult<ArtistLegacy>> {
  validateSlug(slug);
  const result = await readJsonFile(
    path.join(PUBLIC_DIR, "stories", `legacy_${slug}.json`),
    "artist legacy"
  );
  if (result.status !== "available") return result;
  return { status: "available", data: result.data as ArtistLegacy };
}

// Runtime never opens raw research. It reads only the pipeline-projected
// public index (see backend/services/pipeline/build_research_index.py).
// A structurally invalid index is corruption, not absence: failed.
export async function readResearchSources(
  slug: string
): Promise<ReadResult<PublicResearchSource[]>> {
  validateSlug(slug);
  const result = await readJsonFile(
    path.join(PUBLIC_DIR, "research-index.json"),
    "research index"
  );
  if (result.status !== "available") return result;
  try {
    const index = validatePublicResearchIndex(result.data);
    return { status: "available", data: index[slug] ?? [] };
  } catch (error) {
    return fail("research index", error);
  }
}

