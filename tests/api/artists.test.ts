import { describe, it, expect } from "vitest";
import { getArtists, getArtistStory, getResearchFiles } from "@/app/lib/data";

describe("API data layer - artists", () => {
  it("all artists have valid status values", async () => {
    const artists = await getArtists();
    for (const artist of artists) {
      expect(["active", "coming-soon"]).toContain(artist.status);
    }
  });

  it("all artists have non-empty string fields", async () => {
    const artists = await getArtists();
    for (const artist of artists) {
      expect(artist.id.length).toBeGreaterThan(0);
      expect(artist.artistName.length).toBeGreaterThan(0);
      expect(artist.coverImageUrl.length).toBeGreaterThan(0);
      expect(artist.category.length).toBeGreaterThan(0);
    }
  });

  it("artist years are reasonable", async () => {
    const artists = await getArtists();
    for (const artist of artists) {
      expect(artist.year).toBeGreaterThan(1900);
      expect(artist.year).toBeLessThanOrEqual(new Date().getFullYear());
    }
  });
});

describe("API data layer - stories", () => {
  it("frank-ocean story sections have non-empty content", async () => {
    const story = await getArtistStory("frank-ocean");
    expect(story).not.toBeNull();
    for (const section of story!.sections) {
      expect(section.id.length).toBeGreaterThan(0);
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.content.length).toBeGreaterThan(100);
    }
  });

  it("story sections have unique IDs", async () => {
    const story = await getArtistStory("frank-ocean");
    const ids = story!.sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("API data layer - research", () => {
  it("research files have required metadata fields", async () => {
    const files = await getResearchFiles("frank-ocean");
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      expect(file.metadata).toBeDefined();
      expect(typeof file.metadata.timestamp).toBe("string");
      expect(typeof file.metadata.artist_name).toBe("string");
      expect(typeof file.metadata.model_used).toBe("string");
      expect(typeof file.metadata.tokens_used).toBe("number");
    }
  });

  it("research files have response data", async () => {
    const files = await getResearchFiles("frank-ocean");
    for (const file of files) {
      expect(file.response).toBeDefined();
      expect(typeof file.response).toBe("object");
    }
  });
});
