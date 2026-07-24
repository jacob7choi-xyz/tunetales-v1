import { test, expect } from "@playwright/test";

// Phase 5a: CSP ships REPORT-ONLY first. These tests pin the staged
// rollout (observation header present, enforcement absent until 5c) and
// prove the policy is violation-free across the exercised surfaces, so
// enforcement later cannot break the product.

test("CSP is present as Report-Only and NOT yet enforcing", async ({ request }) => {
  const res = await request.get("/artists/frank-ocean");
  const reportOnly = res.headers()["content-security-policy-report-only"];
  expect(reportOnly).toBeDefined();
  expect(reportOnly).toContain("default-src 'self'");
  expect(reportOnly).toContain("frame-src https://open.spotify.com");
  expect(reportOnly).toContain("frame-ancestors 'none'");
  expect(reportOnly).toContain("object-src 'none'");
  // Enforcement is a separate, later classification decision (5c)
  expect(res.headers()["content-security-policy"]).toBeUndefined();
});

test("the full security header set is what users actually receive", async ({ request }) => {
  // The delivered response is the truth, especially through a hosting
  // platform/CDN; this runs identically against localhost and the
  // deployed target (E2E_TARGET_URL)
  const headers = (await request.get("/artists/frank-ocean")).headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["content-security-policy-report-only"]).toBeDefined();
  expect(headers["content-security-policy"]).toBeUndefined();
});

test("zero CSP violations across ALL intentional resource classes", async ({ page }) => {
  // Zero violations is necessary but not sufficient: the run must prove
  // it actually LOADED every intentional application resource class, or
  // an unexercised class could break silently at enforcement time (5c).
  // (Precision: this covers the intended positive resource flows; the
  // restrictive directives with no positive flow, like object-src and
  // base-uri, are not exercised here.) Coverage counts SUCCESSFUL
  // responses, not merely started requests, which also catches
  // CSP-clean-but-404 product failures.
  // "Delivered" means not an error response (<400): 304 revalidations
  // are legitimate delivery, and treating them as failures would create
  // flaky security tests out of harmless caching semantics
  const deliveredUrls: string[] = [];
  const spotifyFrameResponses: string[] = [];
  page.on("response", (res) => {
    const req = res.request();
    if (req.frame() === page.mainFrame() && res.status() < 400) {
      deliveredUrls.push(res.url());
    }
    // Child-frame DOCUMENT responses from the allowlisted origin: the
    // strongest signal that the embed frame's navigation actually
    // succeeded, not just that a frame URL was assigned. 2xx only here:
    // an intermediate redirect hop must not count as the final delivered
    // document (the general inventory above stays <400 deliberately).
    if (
      req.resourceType() === "document" &&
      req.frame() !== page.mainFrame() &&
      res.status() >= 200 &&
      res.status() < 300
    ) {
      try {
        if (new URL(res.url()).origin === "https://open.spotify.com") {
          spotifyFrameResponses.push(res.url());
        }
      } catch {
        // Non-URL responses are irrelevant here
      }
    }
  });

  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      const e = event as SecurityPolicyViolationEvent;
      (window as unknown as { __cspViolations: string[] }).__cspViolations ??= [];
      (window as unknown as { __cspViolations: string[] }).__cspViolations.push(
        `${e.violatedDirective}: ${e.blockedURI}`
      );
    });
  });

  await page.goto("/artists/frank-ocean");
  await page.waitForLoadState("networkidle").catch(() => {});
  for (const m of [1, 3, 6]) {
    await page.evaluate((mult) => window.scrollTo(0, window.innerHeight * mult), m);
    await page.waitForTimeout(300);
  }
  // Journey overlay (lazy story API + embedded Spotify player)
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
  await page.getByRole("button", { name: /Enter chapter 1/ }).click();
  await page.waitForTimeout(2500);
  // The Spotify iframe is the ONLY intentional cross-origin surface, so
  // its instantiation is the highest-value CSP observation: it must
  // exist, point at the allowlisted origin, ACTUALLY NAVIGATE (a DOM src
  // attribute alone does not prove the browser loaded the frame), and
  // raise no frame-src violation in the parent
  const embedSrcs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("iframe")).map((f) => f.src)
  );
  expect(embedSrcs.length).toBeGreaterThan(0);
  for (const src of embedSrcs) {
    expect(new URL(src).origin).toBe("https://open.spotify.com");
  }
  // The embed is loading="lazy" below the fold inside the overlay: it
  // will not navigate until scrolled into view, so the exercise must
  // genuinely reach it (this exact gap is why src-attribute presence
  // alone was insufficient evidence)
  await page.evaluate(() => {
    document.querySelector('[role="dialog"] iframe')?.scrollIntoView({ block: "center" });
  });
  await expect
    .poll(
      () =>
        page
          .frames()
          .filter((f) => f !== page.mainFrame())
          .map((f) => {
            try {
              return new URL(f.url()).origin;
            } catch {
              return "";
            }
          })
          .filter((origin) => origin === "https://open.spotify.com").length,
      { message: "Spotify frame never navigated to the allowlisted origin" }
    )
    .toBeGreaterThan(0);
  // ...and the navigation received a successful (2xx) HTTP document
  // response BOUND to the embed we exercised: frame.url() alone is a
  // proxy, and "some Spotify document loaded somewhere" would age badly
  // if a second embed ever appears. The delivered document's path must
  // match an exercised iframe src (CONTRACT: the Spotify embed is
  // currently the only intentional cross-origin iframe on the page; the
  // every-iframe origin assertion above encodes that assumption).
  const exercisedPaths = embedSrcs.map((src) => new URL(src).pathname);
  await expect
    .poll(
      () =>
        spotifyFrameResponses.filter((url) =>
          exercisedPaths.some((p) => new URL(url).pathname === p)
        ).length,
      { message: "the exercised Spotify embed's document was never successfully delivered" }
    )
    .toBeGreaterThan(0);
  await page.keyboard.press("Escape");
  // Song reader (lazy universe API)
  await page.evaluate(() => document.getElementById("discography")?.scrollIntoView());
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /Read the story of/ }).first().click();
  await page.waitForTimeout(2000);

  // Coverage inventory: every intentional resource class was exercised
  // AND successfully delivered
  const coverage: Record<string, (url: string) => boolean> = {
    "optimized image (hero/art)": (u) => u.includes("/_next/image"),
    "static script/chunk": (u) => u.includes("/_next/static/chunks"),
    "self-hosted font": (u) => /\/_next\/static\/media\/.*\.(woff2?|ttf)/.test(u),
    "story API": (u) => u.includes("/api/artists/frank-ocean"),
    "universe API": (u) => u.includes("/api/universe/frank-ocean"),
  };
  for (const [label, match] of Object.entries(coverage)) {
    expect(
      deliveredUrls.some(match),
      `resource class not successfully delivered: ${label}`
    ).toBe(true);
  }

  const violations = await page.evaluate(
    () => (window as unknown as { __cspViolations?: string[] }).__cspViolations ?? []
  );
  expect(violations).toEqual([]);
});
