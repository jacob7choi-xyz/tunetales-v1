import { describe, it, expect } from "vitest";
import { readFile } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

describe("data/artists.json", () => {
  it("is valid JSON with required fields", async () => {
    const raw = await readFile(path.join(DATA_DIR, "artists.json"), "utf-8");
    const artists = JSON.parse(raw);

    expect(Array.isArray(artists)).toBe(true);
    expect(artists.length).toBeGreaterThan(0);

    for (const artist of artists) {
      expect(artist).toHaveProperty("id");
      expect(artist).toHaveProperty("artistName");
      expect(artist).toHaveProperty("coverImageUrl");
      expect(artist).toHaveProperty("category");
      expect(artist).toHaveProperty("year");
      expect(artist).toHaveProperty("status");
      expect(["active", "coming-soon"]).toContain(artist.status);
    }
  });

  it("has at least one active artist", async () => {
    const raw = await readFile(path.join(DATA_DIR, "artists.json"), "utf-8");
    const artists = JSON.parse(raw);
    const active = artists.filter(
      (a: { status: string }) => a.status === "active"
    );
    expect(active.length).toBeGreaterThan(0);
  });
});

describe("data/stories/frank-ocean.json", () => {
  it("is valid JSON with story sections", async () => {
    const raw = await readFile(
      path.join(DATA_DIR, "stories", "frank-ocean.json"),
      "utf-8"
    );
    const story = JSON.parse(raw);

    expect(story).toHaveProperty("title");
    expect(story).toHaveProperty("sections");
    expect(Array.isArray(story.sections)).toBe(true);
    expect(story.sections.length).toBeGreaterThan(0);

    for (const section of story.sections) {
      expect(section).toHaveProperty("id");
      expect(section).toHaveProperty("title");
      expect(section).toHaveProperty("content");
      expect(section.content.length).toBeGreaterThan(100);
    }
  });
});

describe("data/research/", () => {
  it("has research files for Frank Ocean", async () => {
    const { readdir } = await import("fs/promises");
    const files = await readdir(path.join(DATA_DIR, "research"));
    const frankFiles = files.filter(
      (f) => f.includes("Frank_Ocean") && f.endsWith(".json")
    );
    expect(frankFiles.length).toBeGreaterThan(0);
  });

  it("research files have valid metadata", async () => {
    const { readdir } = await import("fs/promises");
    const researchDir = path.join(DATA_DIR, "research");
    const files = await readdir(researchDir);
    const frankFiles = files.filter(
      (f) => f.includes("Frank_Ocean") && f.endsWith(".json")
    );

    for (const file of frankFiles.slice(0, 3)) {
      const raw = await readFile(path.join(researchDir, file), "utf-8");
      const data = JSON.parse(raw);
      expect(data).toHaveProperty("metadata");
      expect(data.metadata).toHaveProperty("timestamp");
      expect(data.metadata).toHaveProperty("artist_name");
      expect(data.metadata).toHaveProperty("model_used");
    }
  });
});
