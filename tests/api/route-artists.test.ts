import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/artists/route";

describe("GET /api/artists", () => {
  it("returns the artist registry with a 200", async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const artists = await response.json();
    expect(Array.isArray(artists)).toBe(true);
    expect(artists.length).toBeGreaterThan(0);
    expect(artists[0]).toHaveProperty("id");
    expect(artists[0]).toHaveProperty("artistName");
    expect(artists[0]).toHaveProperty("status");
  });
});
