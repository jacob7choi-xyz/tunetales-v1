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

test("exercising the page produces zero CSP violations", async ({ page }) => {
  const violations: string[] = [];
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
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
  await page.getByRole("button", { name: /Enter chapter 1/ }).click();
  await page.waitForTimeout(2000);
  await page.keyboard.press("Escape");
  await page.evaluate(() => document.getElementById("discography")?.scrollIntoView());
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /Read the story of/ }).first().click();
  await page.waitForTimeout(2000);

  const collected = await page.evaluate(
    () => (window as unknown as { __cspViolations?: string[] }).__cspViolations ?? []
  );
  violations.push(...collected);
  expect(violations).toEqual([]);
});
