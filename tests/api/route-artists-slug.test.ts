import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/artists/[slug]/route";

function call(slug: string) {
  return GET(new Request("http://localhost/api/artists/" + encodeURIComponent(slug)), {
    params: Promise.resolve({ slug }),
  });
}

describe("GET /api/artists/[slug]", () => {
  it("returns artist and v2 story for a known slug", async () => {
    const response = await call("frank-ocean");
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.artist.id).toBe("frank-ocean");
    expect(data.story.schemaVersion).toBe(2);
    expect(data.story.chapters.length).toBeGreaterThan(0);
  });

  it("rejects an invalid slug with 400", async () => {
    const response = await call("../../etc/passwd");
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid slug");
  });

  it("rejects an empty slug with 400", async () => {
    const response = await call("");
    expect(response.status).toBe(400);
  });

  it("returns 404 for an unknown artist", async () => {
    const response = await call("unknown-artist");
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("Artist not found");
  });
});
