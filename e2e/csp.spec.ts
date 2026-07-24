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
  // it actually LOADED every resource class the policy governs, or an
  // unexercised class could break silently at enforcement time (5c).
  const mainFrameUrls: string[] = [];
  page.on("request", (req) => {
    if (req.frame() === page.mainFrame()) mainFrameUrls.push(req.url());
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
  // exist, point at the allowlisted origin, and raise no frame-src
  // violation in the parent
  const embedSrcs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("iframe")).map((f) => f.src)
  );
  expect(embedSrcs.length).toBeGreaterThan(0);
  for (const src of embedSrcs) {
    expect(new URL(src).origin).toBe("https://open.spotify.com");
  }
  await page.keyboard.press("Escape");
  // Song reader (lazy universe API)
  await page.evaluate(() => document.getElementById("discography")?.scrollIntoView());
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /Read the story of/ }).first().click();
  await page.waitForTimeout(2000);

  // Coverage inventory: every governed resource class was exercised
  const coverage: Record<string, (url: string) => boolean> = {
    "optimized image (hero/art)": (u) => u.includes("/_next/image"),
    "static script/chunk": (u) => u.includes("/_next/static/chunks"),
    "self-hosted font": (u) => /\/_next\/static\/media\/.*\.(woff2?|ttf)/.test(u),
    "story API": (u) => u.includes("/api/artists/frank-ocean"),
    "universe API": (u) => u.includes("/api/universe/frank-ocean"),
  };
  for (const [label, match] of Object.entries(coverage)) {
    expect(mainFrameUrls.some(match), `resource class not exercised: ${label}`).toBe(true);
  }

  const violations = await page.evaluate(
    () => (window as unknown as { __cspViolations?: string[] }).__cspViolations ?? []
  );
  expect(violations).toEqual([]);
});
