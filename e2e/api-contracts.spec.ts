import { test, expect } from "@playwright/test";

// Security contracts proven against the running HTTP stack (S1/S8/S9):
// negative route behavior, exact recursive DTO key sets, and a provider
// vocabulary scan of everything a browser can receive.

const PROVIDER_MARKERS = [
  "model_used",
  "cost_estimate",
  "sonar",
  "perplexity",
  "openai",
  "anthropic",
  "gpt-5",
  "claude-",
];

// Recursive key collection; arrays merge element keys under []
function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    const merged = new Set<string>();
    for (const item of value) for (const p of keyPaths(item, `${prefix}[]`)) merged.add(p);
    return Array.from(merged);
  }
  if (typeof value === "object" && value !== null) {
    const paths: string[] = [];
    for (const key of Object.keys(value)) {
      const path = prefix ? `${prefix}.${key}` : key;
      paths.push(path, ...keyPaths((value as Record<string, unknown>)[key], path));
    }
    return paths;
  }
  return [];
}

test.describe("negative route contracts (S9)", () => {
  const SLUG_ROUTES = ["artists", "universe", "legacy", "research"];

  for (const route of SLUG_ROUTES) {
    test(`unknown slug 404s on /api/${route}`, async ({ request }) => {
      const res = await request.get(`/api/${route}/not-a-real-artist`);
      expect(res.status()).toBe(404);
    });

    test(`malformed slugs 400 on /api/${route}`, async ({ request }) => {
      for (const bad of ["..%2Fetc", "UPPER", "a%20b", "frank_ocean"]) {
        const res = await request.get(`/api/${route}/${bad}`);
        expect(res.status(), `${route}/${bad}`).toBe(400);
      }
    });
  }
});

test.describe("exact public DTO response shapes (S1/S8)", () => {
  test("/api/artists returns exactly the public artist keys", async ({ request }) => {
    const data = await (await request.get("/api/artists")).json();
    // Schema has two optional fields, so the contract is: required keys
    // present on every element AND every encountered key allowed
    const required = ["id", "artistName", "coverImageUrl", "category", "year", "status"];
    const allowed = new Set([...required, "accentHsl", "teaser"]);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    for (const artist of data) {
      const keys = Object.keys(artist);
      for (const key of required) {
        expect(keys, `missing required key ${key}`).toContain(key);
      }
      for (const key of keys) {
        expect(allowed.has(key), `unexpected key: ${key}`).toBe(true);
      }
    }
  });

  test("/api/legacy/frank-ocean returns exactly the public legacy keys", async ({ request }) => {
    const data = await (await request.get("/api/legacy/frank-ocean")).json();
    expect(keyPaths(data).sort()).toEqual(
      [
        "artist_slug",
        "pillars",
        "pillars[].id",
        "pillars[].numeral",
        "pillars[].title",
        "pillars[].tagline",
        "pillars[].mood",
        "pillars[].accent_hsl",
        "pillars[].story",
        "pillars[].moments",
        "pillars[].voices",
        "pillars[].voices[].quote",
        "pillars[].voices[].speaker",
      ].sort()
    );
  });

  test("/api/artists/frank-ocean returns exactly {artist, story} public keys", async ({ request }) => {
    const data = await (await request.get("/api/artists/frank-ocean")).json();
    const allowed = new Set([
      "artist", "artist.id", "artist.artistName", "artist.coverImageUrl",
      "artist.category", "artist.year", "artist.status", "artist.accentHsl", "artist.teaser",
      "story", "story.schemaVersion", "story.title", "story.artistSlug", "story.chapters",
      "story.chapters[].id", "story.chapters[].order", "story.chapters[].title",
      "story.chapters[].content", "story.chapters[].ambience",
      "story.chapters[].ambience.mood", "story.chapters[].ambience.accentHsl",
      "story.chapters[].ambience.spotifyTrackId", "story.chapters[].ambience.imageryHint",
    ]);
    for (const path of keyPaths(data)) {
      expect(allowed.has(path), `unexpected key path: ${path}`).toBe(true);
    }
  });

  test("/api/universe/frank-ocean returns exactly the public universe keys", async ({ request }) => {
    const data = await (await request.get("/api/universe/frank-ocean")).json();
    expect(keyPaths(data).sort()).toEqual(
      [
        "artist_slug", "song_bubbles", "song_bubbles[].song_name",
        "song_bubbles[].story", "song_bubbles[].mood", "song_bubbles[].bubble_color",
      ].sort()
    );
  });

  test("/api/research/frank-ocean returns exactly the public source keys", async ({ request }) => {
    const data = await (await request.get("/api/research/frank-ocean")).json();
    expect(keyPaths(data).sort()).toEqual(
      ["artist", "sources", "sources[].queryLabel", "sources[].date", "sources[].tokens"].sort()
    );
  });
});

test.describe("provider vocabulary never reaches the browser (S1)", () => {
  test("all four API responses are clean", async ({ request }) => {
    for (const path of [
      "/api/artists",
      "/api/artists/frank-ocean",
      "/api/universe/frank-ocean",
      "/api/legacy/frank-ocean",
      "/api/research/frank-ocean",
    ]) {
      const body = (await (await request.get(path)).text()).toLowerCase();
      for (const marker of PROVIDER_MARKERS) {
        expect(body.includes(marker), `${path} contains ${marker}`).toBe(false);
      }
    }
  });

  test("the rendered page HTML is clean", async ({ request }) => {
    const html = (await (await request.get("/artists/frank-ocean")).text()).toLowerCase();
    for (const marker of PROVIDER_MARKERS) {
      expect(html.includes(marker), `page HTML contains ${marker}`).toBe(false);
    }
  });
});
