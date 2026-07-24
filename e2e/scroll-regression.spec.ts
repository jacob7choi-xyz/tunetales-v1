import { test, expect } from "@playwright/test";

// Guards the platform scrolling model: html/body once made BODY an
// internal scroll container (height:100% + overflow-x:hidden forcing
// overflow-y:auto), freezing window.scrollY and silently breaking every
// viewport primitive. If someone reintroduces that CSS, this fails.
for (const path of ["/", "/artists/frank-ocean"]) {
  test(`${path} scrolls via the viewport, not an inner container`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const heights = await page.evaluate(() => ({
      doc: document.documentElement.scrollHeight,
      viewport: window.innerHeight,
    }));
    expect(heights.doc).toBeGreaterThan(heights.viewport);
    await page.evaluate(() => window.scrollTo(0, 400));
    await expect
      .poll(async () => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(300);
  });
}

test("?tab=impact lands with the Legacy section in the viewport", async ({ page }) => {
  await page.goto("/artists/frank-ocean?tab=impact");
  const impact = page.locator("#impact");
  await expect
    .poll(async () => {
      const box = await impact.boundingBox();
      return box ? Math.abs(box.y) : Number.POSITIVE_INFINITY;
    })
    .toBeLessThan(200);
});

test("an unknown ?tab= value is ignored, landing at the top", async ({ page }) => {
  await page.goto("/artists/frank-ocean?tab=__nonsense__");
  await page.waitForLoadState("networkidle");
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY).toBeLessThan(100);
});
