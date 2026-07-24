import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/universe/[slug]/route";

function call(slug: string) {
  return GET(new Request("http://localhost/api/universe/" + encodeURIComponent(slug)), {
    params: Promise.resolve({ slug }),
  });
}

describe("GET /api/universe/[slug]", () => {
  it("returns the song universe for frank-ocean", async () => {
    const response = await call("frank-ocean");
    expect(response.status).toBe(200);

    const universe = await response.json();
    expect(universe.artist_slug).toBe("frank-ocean");
    expect(Array.isArray(universe.song_bubbles)).toBe(true);
    expect(universe.song_bubbles.length).toBeGreaterThan(0);
    for (const bubble of universe.song_bubbles) {
      expect(bubble.song_name.length).toBeGreaterThan(0);
      expect(bubble.story.length).toBeGreaterThan(100);
      expect(bubble.mood.length).toBeGreaterThan(0);
      expect(bubble.bubble_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("rejects an invalid slug with 400", async () => {
    const response = await call("../../etc");
    expect(response.status).toBe(400);
  });

  it("returns 404 when no universe exists", async () => {
    const response = await call("unknown-artist");
    expect(response.status).toBe(404);
  });
});
