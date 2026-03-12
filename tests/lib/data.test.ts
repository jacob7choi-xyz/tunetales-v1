import { describe, it, expect } from "vitest";
import { getArtists, getArtistStory, getResearchFiles } from "@/app/lib/data";

describe("getArtists", () => {
  it("returns an array of artists", async () => {
    const artists = await getArtists();
    expect(Array.isArray(artists)).toBe(true);
    expect(artists.length).toBe(4);
  });

  it("each artist has required fields", async () => {
    const artists = await getArtists();
    for (const artist of artists) {
      expect(typeof artist.id).toBe("string");
      expect(typeof artist.artistName).toBe("string");
      expect(typeof artist.coverImageUrl).toBe("string");
      expect(typeof artist.category).toBe("string");
      expect(typeof artist.year).toBe("number");
    }
  });
});

describe("getArtistStory", () => {
  it("returns story for frank-ocean", async () => {
    const story = await getArtistStory("frank-ocean");
    expect(story).not.toBeNull();
    expect(story?.title).toBe("Frank Ocean: The Beautiful Mystery");
    expect(story?.sections.length).toBe(6);
  });

  it("returns null for unknown artist", async () => {
    const story = await getArtistStory("nonexistent-artist");
    expect(story).toBeNull();
  });

  it("rejects path traversal attempts", async () => {
    await expect(getArtistStory("../../etc/passwd")).rejects.toThrow(
      "Invalid slug"
    );
  });

  it("rejects slugs with special characters", async () => {
    await expect(getArtistStory("frank_ocean")).rejects.toThrow("Invalid slug");
    await expect(getArtistStory("frank ocean")).rejects.toThrow("Invalid slug");
    await expect(getArtistStory("frank/ocean")).rejects.toThrow("Invalid slug");
    await expect(getArtistStory("")).rejects.toThrow("Invalid slug");
  });
});

describe("getResearchFiles", () => {
  it("returns research files for frank-ocean", async () => {
    const files = await getResearchFiles("frank-ocean");
    expect(files.length).toBeGreaterThan(0);
  });

  it("returns empty array for unknown artist", async () => {
    const files = await getResearchFiles("nonexistent-artist");
    expect(files).toEqual([]);
  });

  it("rejects path traversal attempts", async () => {
    await expect(getResearchFiles("../../etc/passwd")).rejects.toThrow(
      "Invalid slug"
    );
  });

  it("rejects empty slug", async () => {
    await expect(getResearchFiles("")).rejects.toThrow("Invalid slug");
  });
});
