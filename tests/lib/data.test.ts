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

describe("readArtists", () => {
  it("returns an available array of artists", async () => {
    const artists = unwrap(await readArtists());
    expect(Array.isArray(artists)).toBe(true);
    expect(artists.length).toBeGreaterThan(0);
  });

  it("each artist has required fields", async () => {
    const artists = unwrap(await readArtists());
    for (const artist of artists) {
      expect(typeof artist.id).toBe("string");
      expect(typeof artist.artistName).toBe("string");
      expect(typeof artist.coverImageUrl).toBe("string");
      expect(typeof artist.category).toBe("string");
      expect(typeof artist.year).toBe("number");
    }
  });
});

describe("readArtistStory", () => {
  it("returns the story for frank-ocean", async () => {
    const story = unwrap(await readArtistStory("frank-ocean"));
    expect(story.title).toBe("Frank Ocean: The Beautiful Mystery");
    expect(story.schemaVersion).toBe(2);
    expect(story.chapters.length).toBe(6);
    expect(story.chapters[0].ambience.mood).toBeDefined();
  });

  it("reports missing for an unknown artist, never a silent null", async () => {
    const result = await readArtistStory("nonexistent-artist");
    expect(result).toEqual({ status: "missing" });
  });

  it("rejects path traversal attempts", async () => {
    await expect(readArtistStory("../../etc/passwd")).rejects.toThrow(
      "Invalid slug"
    );
  });

  it("rejects slugs with special characters", async () => {
    await expect(readArtistStory("frank_ocean")).rejects.toThrow("Invalid slug");
    await expect(readArtistStory("frank ocean")).rejects.toThrow("Invalid slug");
    await expect(readArtistStory("frank/ocean")).rejects.toThrow("Invalid slug");
    await expect(readArtistStory("")).rejects.toThrow("Invalid slug");
  });
});

describe("readResearchSources", () => {
  it("returns projected sources for frank-ocean", async () => {
    const sources = unwrap(await readResearchSources("frank-ocean"));
    expect(sources.length).toBeGreaterThan(0);
  });

  it("returns an empty available list for a registered-shape stranger", async () => {
    const result = await readResearchSources("nonexistent-artist");
    expect(result).toEqual({ status: "available", data: [] });
  });

  it("rejects path traversal attempts", async () => {
    await expect(readResearchSources("../../etc/passwd")).rejects.toThrow(
      "Invalid slug"
    );
  });

  it("rejects empty slug", async () => {
    await expect(readResearchSources("")).rejects.toThrow("Invalid slug");
  });
});
