import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/legacy/[slug]/route";

function call(slug: string) {
  return GET(new Request("http://localhost/api/legacy/" + encodeURIComponent(slug)), {
    params: Promise.resolve({ slug }),
  });
}

describe("GET /api/legacy/[slug]", () => {
  it("returns the legacy pillars for frank-ocean", async () => {
    const response = await call("frank-ocean");
    expect(response.status).toBe(200);

    const legacy = await response.json();
    expect(legacy.artist_slug).toBe("frank-ocean");
    expect(Array.isArray(legacy.pillars)).toBe(true);
    expect(legacy.pillars.length).toBeGreaterThan(0);
    for (const pillar of legacy.pillars) {
      expect(pillar.title.length).toBeGreaterThan(0);
      expect(pillar.story.length).toBeGreaterThan(100);
      expect(pillar.accent_hsl).toMatch(/^\d+,\s*\d+%,\s*\d+%$/);
      expect(Array.isArray(pillar.moments)).toBe(true);
      expect(Array.isArray(pillar.voices)).toBe(true);
    }
  });

  it("rejects an invalid slug with 400", async () => {
    const response = await call("../../etc");
    expect(response.status).toBe(400);
  });

  it("returns 404 when no legacy exists", async () => {
    const response = await call("unknown-artist");
    expect(response.status).toBe(404);
  });
});
