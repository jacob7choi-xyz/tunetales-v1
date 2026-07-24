import { describe, it, expect } from "vitest";
import {
  toPublicArtist,
  toPublicLegacy,
  toPublicStory,
  toPublicUniverse,
} from "@/app/lib/public/dto";
import { validatePublicResearchIndex } from "@/app/lib/public/validate";
import type { Artist, ArtistLegacy, ArtistStory, SongUniverse } from "@/app/lib/types";

// Collects every key path in a value, recursively, arrays included. The
// contract tests assert EXACT key sets: an unexpected extra key anywhere
// in a DTO is a classification failure, not a cosmetic diff.
function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    // Merge element paths so arrays of uniform objects yield one path set
    const merged = new Set<string>();
    for (const item of value) {
      for (const p of keyPaths(item, `${prefix}[]`)) merged.add(p);
    }
    return Array.from(merged);
  }
  if (typeof value === "object" && value !== null) {
    const paths: string[] = [];
    for (const key of Object.keys(value)) {
      const path = prefix ? `${prefix}.${key}` : key;
      paths.push(path);
      paths.push(...keyPaths((value as Record<string, unknown>)[key], path));
    }
    return paths;
  }
  return [];
}

// Internal inputs deliberately polluted with fields that must NOT survive
// projection. The `as` casts simulate internal objects growing new fields
// without the DTO layer knowing.

const pollutedArtist = {
  id: "frank-ocean",
  artistName: "Frank Ocean",
  coverImageUrl: "https://upload.wikimedia.org/x.jpg",
  category: "Alternative R&B",
  year: 2012,
  status: "active",
  accentHsl: "260, 70%, 55%",
  teaser: "A voice like weather",
  model_used: "leak-me",
  internal_notes: "leak-me",
} as unknown as Artist;

const pollutedStory = {
  schemaVersion: 2,
  title: "Story",
  artistSlug: "frank-ocean",
  generation_cost: 1.23,
  chapters: [
    {
      id: "origins",
      order: 1,
      title: "Chapter",
      content: "Content",
      draft_revision: 4,
      ambience: {
        mood: "nostalgic",
        accentHsl: "260, 70%, 55%",
        spotifyTrackId: "abc123",
        imageryHint: "Warm light",
        prompt: "leak-me",
      },
    },
  ],
} as unknown as ArtistStory;

const pollutedUniverse = {
  artist_slug: "frank-ocean",
  metadata: { model_used: "leak-me" },
  song_bubbles: [
    {
      song_name: "Ivy",
      story: "A story",
      mood: "nostalgic",
      bubble_color: "#9A6B9A",
      tokens_used: 900,
    },
  ],
} as unknown as SongUniverse;

const pollutedLegacy = {
  artist_slug: "frank-ocean",
  provider: "leak-me",
  pillars: [
    {
      id: "honesty",
      numeral: "I",
      title: "Honesty",
      tagline: "Tag",
      mood: "tender",
      accent_hsl: "300, 50%, 60%",
      story: "Story",
      moments: ["A moment"],
      voices: [{ quote: "Quote", speaker: "Speaker", source_file: "leak-me" }],
      cost_estimate: 0.5,
    },
  ],
} as unknown as ArtistLegacy;

describe("public DTO constructors project exact key sets", () => {
  it("toPublicArtist", () => {
    expect(keyPaths(toPublicArtist(pollutedArtist)).sort()).toEqual(
      ["accentHsl", "artistName", "category", "coverImageUrl", "id", "status", "teaser", "year"].sort()
    );
  });

  it("toPublicArtist omits absent optional fields instead of emitting undefined", () => {
    const { accentHsl: _a, teaser: _t, ...bare } = pollutedArtist as unknown as Record<string, unknown>;
    const projected = toPublicArtist(bare as unknown as Artist);
    expect("accentHsl" in projected).toBe(false);
    expect("teaser" in projected).toBe(false);
  });

  it("toPublicStory", () => {
    expect(keyPaths(toPublicStory(pollutedStory)).sort()).toEqual(
      [
        "schemaVersion",
        "title",
        "artistSlug",
        "chapters",
        "chapters[].id",
        "chapters[].order",
        "chapters[].title",
        "chapters[].content",
        "chapters[].ambience",
        "chapters[].ambience.mood",
        "chapters[].ambience.accentHsl",
        "chapters[].ambience.spotifyTrackId",
        "chapters[].ambience.imageryHint",
      ].sort()
    );
  });

  it("toPublicUniverse", () => {
    expect(keyPaths(toPublicUniverse(pollutedUniverse)).sort()).toEqual(
      [
        "artist_slug",
        "song_bubbles",
        "song_bubbles[].song_name",
        "song_bubbles[].story",
        "song_bubbles[].mood",
        "song_bubbles[].bubble_color",
      ].sort()
    );
  });

  it("toPublicLegacy", () => {
    expect(keyPaths(toPublicLegacy(pollutedLegacy)).sort()).toEqual(
      [
        "artist_slug",
        "pillars",
        "pillars[].id",
        "pillars[].numeral",
        "pillars[].title",
        "pillars[].tagline",
        "pillars[].mood",
        "pillars[].accent_hsl",
        "pillars[].story",
        "pillars[].moments",
        "pillars[].voices",
        "pillars[].voices[].quote",
        "pillars[].voices[].speaker",
      ].sort()
    );
  });
});

describe("validatePublicResearchIndex", () => {
  const validRow = { queryLabel: "Artist profile research", date: "2026-07-19T22:40:21", tokens: 1200 };

  it("accepts a valid index", () => {
    const index = validatePublicResearchIndex({ "frank-ocean": [validRow] });
    expect(index["frank-ocean"]).toHaveLength(1);
  });

  it("rejects rows with extra keys (exact equality, not subset)", () => {
    expect(() =>
      validatePublicResearchIndex({ "frank-ocean": [{ ...validRow, model_used: "x" }] })
    ).toThrow(/deviate/);
  });

  it("rejects rows with missing keys", () => {
    const { tokens: _t, ...partial } = validRow;
    expect(() => validatePublicResearchIndex({ "frank-ocean": [partial] })).toThrow(/deviate/);
  });

  it("rejects non-finite and negative token counts", () => {
    expect(() =>
      validatePublicResearchIndex({ "frank-ocean": [{ ...validRow, tokens: Number.NaN }] })
    ).toThrow(/finite/);
    expect(() =>
      validatePublicResearchIndex({ "frank-ocean": [{ ...validRow, tokens: Infinity }] })
    ).toThrow(/finite/);
    expect(() =>
      validatePublicResearchIndex({ "frank-ocean": [{ ...validRow, tokens: -1 }] })
    ).toThrow(/finite/);
  });

  it("rejects null rows, array indexes, and invalid slug keys", () => {
    expect(() => validatePublicResearchIndex({ "frank-ocean": [null] })).toThrow(/object row/);
    expect(() => validatePublicResearchIndex([validRow])).toThrow(/keyed by artist slug/);
    expect(() => validatePublicResearchIndex(null)).toThrow(/keyed by artist slug/);
    expect(() => validatePublicResearchIndex({ "../etc": [validRow] })).toThrow(/invalid artist slug/);
    expect(() => validatePublicResearchIndex({ "frank-ocean": validRow })).toThrow(/array of rows/);
  });

  it("rejects empty string fields", () => {
    expect(() =>
      validatePublicResearchIndex({ "frank-ocean": [{ ...validRow, queryLabel: "" }] })
    ).toThrow(/queryLabel/);
    expect(() =>
      validatePublicResearchIndex({ "frank-ocean": [{ ...validRow, date: "" }] })
    ).toThrow(/date/);
  });
});
