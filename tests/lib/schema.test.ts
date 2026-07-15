import { describe, it, expect } from "vitest";
import { normalizeLegacyStory } from "@/app/lib/data";
import type { ArtistStory, LegacyArtistStory } from "@/app/lib/types";

const legacyStory: LegacyArtistStory = {
  title: "Test Artist: A Story",
  sections: [
    { id: "one", title: "CHAPTER ONE", content: "First chapter content." },
    { id: "two", title: "CHAPTER TWO", content: "Second chapter content." },
  ],
};

const v2Story: ArtistStory = {
  schemaVersion: 2,
  title: "Modern Story",
  artistSlug: "modern-artist",
  chapters: [
    {
      id: "b",
      order: 2,
      title: "SECOND",
      content: "later",
      ambience: { mood: "wonder", accentHsl: "195, 75%, 50%" },
    },
    {
      id: "a",
      order: 1,
      title: "FIRST",
      content: "earlier",
      ambience: { mood: "nostalgic", accentHsl: "260, 70%, 55%" },
    },
  ],
};

describe("normalizeLegacyStory", () => {
  it("upgrades a v1 story to schema v2 with default ambience", () => {
    const result = normalizeLegacyStory(legacyStory, "test-artist");
    expect(result.schemaVersion).toBe(2);
    expect(result.artistSlug).toBe("test-artist");
    expect(result.chapters.length).toBe(2);
    expect(result.chapters[0].order).toBe(1);
    expect(result.chapters[1].order).toBe(2);
    for (const chapter of result.chapters) {
      expect(chapter.ambience.mood).toBe("introspective");
      expect(chapter.ambience.accentHsl).toBe("260, 65%, 50%");
      expect(chapter.ambience.spotifyTrackId).toBeNull();
    }
  });

  it("preserves v1 titles and content verbatim", () => {
    const result = normalizeLegacyStory(legacyStory, "test-artist");
    expect(result.title).toBe("Test Artist: A Story");
    expect(result.chapters[0].title).toBe("CHAPTER ONE");
    expect(result.chapters[1].content).toBe("Second chapter content.");
  });

  it("returns v2 stories unchanged apart from sorting chapters by order", () => {
    const result = normalizeLegacyStory(v2Story, "modern-artist");
    expect(result.schemaVersion).toBe(2);
    expect(result.title).toBe("Modern Story");
    expect(result.chapters.map((c) => c.id)).toEqual(["a", "b"]);
    expect(result.chapters[0].ambience.mood).toBe("nostalgic");
  });
});
