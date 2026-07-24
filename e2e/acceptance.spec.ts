import { test, expect } from "@playwright/test";

const PAGE = "/artists/frank-ocean";

test("hero fills the viewport with the portrait visible", async ({ page }) => {
  await page.goto(PAGE);
  const heroImg = page.locator('img[src*="hero.jpg"], img[src*="hero"]').first();
  await expect(heroImg).toBeVisible();
  const h1 = page.getByRole("heading", { level: 1, name: "Frank Ocean" });
  await expect(h1).toBeVisible();
  const heroHeight = await page.evaluate(() => {
    const section = document.querySelector("section[aria-label='Frank Ocean']");
    return section ? section.getBoundingClientRect().height : 0;
  });
  const viewport = page.viewportSize()!;
  expect(heroHeight).toBeGreaterThanOrEqual(viewport.height * 0.95);
});

test("pill scrollspy: clicking Songs scrolls there and marks it current", async ({ page }) => {
  await page.goto(PAGE);
  // Reveal the nav by leaving the hero
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  const nav = page.locator('nav[aria-label="Page sections"]');
  await expect(nav).toHaveJSProperty("inert", false);

  await nav.getByRole("button", { name: "Songs" }).click();
  const discography = page.locator("#discography");
  await expect
    .poll(async () => {
      const box = await discography.boundingBox();
      return box ? Math.abs(box.y) : Number.POSITIVE_INFINITY;
    })
    .toBeLessThan(200);
  await expect(nav.getByRole("button", { name: "Songs" })).toHaveAttribute(
    "aria-current",
    "location"
  );
});

test("every pill targets a section that actually exists", async ({ page }) => {
  await page.goto(PAGE);
  const missing = await page.evaluate(() => {
    const nav = document.querySelector('nav[aria-label="Page sections"]');
    if (!nav) return ["nav itself missing"];
    return Array.from(nav.querySelectorAll("button"))
      .map((b) => b.textContent ?? "")
      .filter((label) => {
        const idByLabel: Record<string, string> = {
          Journey: "journey",
          Songs: "discography",
          Legacy: "impact",
          Sources: "sources",
        };
        const id = idByLabel[label];
        return id ? !document.getElementById(id) : true;
      });
  });
  expect(missing).toEqual([]);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("hero title has no scroll transform under prefers-reduced-motion", async ({ page }) => {
    await page.goto(PAGE);
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(400);
    const transform = await page.evaluate(() => {
      const slot = document.querySelector('[data-testid="hero-title-slot"]');
      return slot ? getComputedStyle(slot).transform : "missing";
    });
    // Zeroed motion ranges: identity or none, never a translated matrix
    expect(["none", "matrix(1, 0, 0, 1, 0, 0)"]).toContain(transform);
  });
});

test("390px viewport has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(PAGE);
  await page.waitForLoadState("networkidle");
  for (const y of [0, 0.5, 1.5, 3]) {
    await page.evaluate((mult) => window.scrollTo(0, window.innerHeight * mult), y);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, `at scroll position ${y}vh`).toBeLessThanOrEqual(1);
  }
});

test.describe("lazy content: story text loads only on demand", () => {
  test("the story API is not called until a scene opens", async ({ page }) => {
    const storyCalls: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/artists/frank-ocean")) storyCalls.push(req.url());
    });
    await page.goto(PAGE);
    await page.waitForLoadState("networkidle");
    expect(storyCalls).toEqual([]);

    await page.getByRole("button", { name: /Enter chapter 1/ }).click();
    await expect.poll(() => storyCalls.length).toBe(1);
  });

  test("song stories load only when a reader opens", async ({ page }) => {
    const universeCalls: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/universe/")) universeCalls.push(req.url());
    });
    await page.goto(PAGE);
    await page.waitForLoadState("networkidle");
    expect(universeCalls).toEqual([]);

    await page.evaluate(() => document.getElementById("discography")?.scrollIntoView());
    const poster = page.getByRole("button", { name: /Read the story of/ }).first();
    await poster.click();
    await expect.poll(() => universeCalls.length).toBe(1);
    // The reader shows real story prose once the fetch lands
    await expect(page.getByLabel("Close story")).toBeVisible();
  });
});
