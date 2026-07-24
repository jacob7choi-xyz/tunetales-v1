import { test, expect } from "@playwright/test";
import { rename } from "fs/promises";
import path from "path";

// Failure injection (S7 wiring proof): with the mandatory artist registry
// unavailable, the HTTP stack must answer 500, never 404. A broken
// deployment must not masquerade as a nonexistent resource. Runs serially
// on one browser project; the registry is restored even on failure.

const REGISTRY = path.join(process.cwd(), "data", "public", "artists.json");
const HIDDEN = REGISTRY + ".e2e-hidden";

// These tests mutate shared deployment state (the registry file) and are
// intentionally ordered: serial mode keeps them sequenced in one worker
// even under the globally fullyParallel config, and the dedicated
// Playwright project keeps them after all parallel browser projects.
test.describe.configure({ mode: "serial" });

test.describe("broken registry surfaces as 500, never 404", () => {
  test("every registry-gated API answers 500 while the registry is unavailable", async ({ request }) => {
    await rename(REGISTRY, HIDDEN);
    try {
      for (const path of [
        "/api/artists/frank-ocean",
        "/api/universe/frank-ocean",
        "/api/legacy/frank-ocean",
        "/api/research/frank-ocean",
      ]) {
        const res = await request.get(path);
        expect(res.status(), path).toBe(500);
        const body = await res.json();
        expect(body.error, path).toBeDefined();
        // Opaque correlation token only; no paths or exception text
        if (body.errorId) expect(body.errorId).toMatch(/^[0-9a-f]{12}$/);
      }

      const catalog = await request.get("/api/artists");
      expect(catalog.status()).toBe(500);
    } finally {
      await rename(HIDDEN, REGISTRY);
    }
  });

  test("the registry works again after restoration", async ({ request }) => {
    const res = await request.get("/api/artists/frank-ocean");
    expect(res.status()).toBe(200);
  });
});
