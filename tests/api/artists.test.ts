import { describe, it, expect } from "vitest";
import {
  readArtists,
  readArtistStory,
  readResearchSources,
  type ReadResult,
} from "@/app/lib/data";

function unwrap<T>(result: ReadResult<T>): T {
  expect(result.status).toBe("available");
  if (result.status !== "available") throw new Error("unreachable");
  return result.data;
}

describe("API data layer - artists", () => {
  it("all artists have valid status values", async () => {
    const artists = unwrap(await readArtists());
    for (const artist of artists) {
      expect(["active", "coming-soon"]).toContain(artist.status);
    }
  });

  it("all artists have non-empty string fields", async () => {
    const artists = unwrap(await readArtists());
    for (const artist of artists) {
      expect(artist.id.length).toBeGreaterThan(0);
      expect(artist.artistName.length).toBeGreaterThan(0);
      expect(artist.coverImageUrl.length).toBeGreaterThan(0);
      expect(artist.category.length).toBeGreaterThan(0);
    }
  });

  it("artist years are reasonable", async () => {
    const artists = unwrap(await readArtists());
    for (const artist of artists) {
      expect(artist.year).toBeGreaterThan(1900);
      expect(artist.year).toBeLessThanOrEqual(new Date().getFullYear());
    }
  });
});

describe("API data layer - stories", () => {
  it("frank-ocean story chapters have non-empty content", async () => {
    const story = unwrap(await readArtistStory("frank-ocean"));
    for (const chapter of story.chapters) {
      expect(chapter.id.length).toBeGreaterThan(0);
      expect(chapter.title.length).toBeGreaterThan(0);
      expect(chapter.content.length).toBeGreaterThan(100);
    }
  });

  it("story chapters have unique IDs", async () => {
    const story = unwrap(await readArtistStory("frank-ocean"));
    const ids = story.chapters.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("API data layer - research", () => {
  it("research index rows carry only the public fields", async () => {
    const sources = unwrap(await readResearchSources("frank-ocean"));
    expect(sources.length).toBeGreaterThan(0);
    for (const source of sources) {
      expect(Object.keys(source).sort()).toEqual(["date", "queryLabel", "tokens"]);
      expect(typeof source.queryLabel).toBe("string");
      expect(typeof source.date).toBe("string");
      expect(typeof source.tokens).toBe("number");
    }
  });

  it("research index rows are sorted newest first", async () => {
    const sources = unwrap(await readResearchSources("frank-ocean"));
    const dates = sources.map((s) => s.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});
