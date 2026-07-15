import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/research/[slug]/route";

function call(slug: string) {
  return GET(new Request("http://localhost/api/research/" + encodeURIComponent(slug)), {
    params: Promise.resolve({ slug }),
  });
}

describe("GET /api/research/[slug]", () => {
  it("returns research files for a known artist", async () => {
    const response = await call("frank-ocean");
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.artist).toBe("frank-ocean");
    expect(data.fileCount).toBeGreaterThan(0);
    expect(Array.isArray(data.research)).toBe(true);
    expect(data.research.length).toBe(data.fileCount);
  });

  it("rejects an invalid slug with 400", async () => {
    const response = await call("../secrets");
    expect(response.status).toBe(400);
  });

  it("returns an empty result set for an unknown artist", async () => {
    const response = await call("unknown-artist");
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.fileCount).toBe(0);
  });
});
