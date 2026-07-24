import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/research/[slug]/route";

function call(slug: string) {
  return GET(new Request("http://localhost/api/research/" + encodeURIComponent(slug)), {
    params: Promise.resolve({ slug }),
  });
}

describe("GET /api/research/[slug]", () => {
  it("returns projected research sources for a known artist", async () => {
    const response = await call("frank-ocean");
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.artist).toBe("frank-ocean");
    expect(Array.isArray(data.sources)).toBe(true);
    expect(data.sources.length).toBeGreaterThan(0);
  });

  it("responds with exactly the public row schema and nothing else", async () => {
    const response = await call("frank-ocean");
    const data = await response.json();

    expect(Object.keys(data).sort()).toEqual(["artist", "sources"]);
    for (const source of data.sources) {
      expect(Object.keys(source).sort()).toEqual(["date", "queryLabel", "tokens"]);
      expect(typeof source.queryLabel).toBe("string");
      expect(typeof source.date).toBe("string");
      expect(typeof source.tokens).toBe("number");
    }
  });

  it("never leaks provider vocabulary in the response body", async () => {
    const response = await call("frank-ocean");
    const body = JSON.stringify(await response.json()).toLowerCase();
    for (const marker of ["model_used", "cost_estimate", "sonar", "perplexity", "openai", "anthropic", "gpt"]) {
      expect(body).not.toContain(marker);
    }
  });

  it("rejects an invalid slug with 400", async () => {
    const response = await call("../secrets");
    expect(response.status).toBe(400);
  });

  it("returns 404 for a slug outside the artist registry", async () => {
    const response = await call("unknown-artist");
    expect(response.status).toBe(404);
  });
});
