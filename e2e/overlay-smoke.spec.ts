import { test, expect } from "@playwright/test";

// Phase-2 acceptance smoke: the two contracts jsdom structurally cannot
// prove. (1) The overlay's inert -> exit -> focus-restoration ordering
// under real animation timing. (2) The hero sentinel actually toggling
// the pill nav under real IntersectionObserver geometry.

const HARNESS = "/dev/cinema-harness";

test("overlay lifecycle: inert while open, focus restored only after exit", async ({ page }) => {
  await page.goto(HARNESS);

  const trigger = page.getByRole("button", { name: /Enter chapter 1/ });
  await trigger.click();

  // Dialog is open: Close holds focus, background root is inert
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const close = page.getByRole("button", { name: "Close the journey" });
  await expect(close).toBeFocused();
  const cinemaRoot = page.locator("[data-cinema-root]");
  await expect(cinemaRoot).toHaveJSProperty("inert", true);

  // The dialog lives OUTSIDE the inert subtree (S6a topology)
  const dialogInsideRoot = await cinemaRoot
    .locator('[role="dialog"]')
    .count();
  expect(dialogInsideRoot).toBe(0);

  // Escape: exit animation must fully complete, inert must be released,
  // and ONLY THEN focus returns to the invoking scene button
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(cinemaRoot).toHaveJSProperty("inert", false);
  await expect(trigger).toBeFocused();
});

test("escape-then-tab lands in the page, not a focus black hole", async ({ page }) => {
  await page.goto(HARNESS);

  const trigger = page.getByRole("button", { name: /Enter chapter 1/ });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  // Focus restored to the trigger means Tab continues from the scene,
  // proving restoration happened after the background became interactive
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Tab");
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
  expect(focusedTag).not.toBe("BODY");
});

test("hero sentinel toggles the floating pill nav", async ({ page }) => {
  await page.goto(HARNESS);

  const nav = page.locator('nav[aria-label="Page sections"]');
  // At the top of the page the nav is inert: invisible, unfocusable,
  // out of the accessibility tree
  await expect(nav).toHaveJSProperty("inert", true);

  // Scroll well past the billboard hero
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  await expect(nav).toHaveJSProperty("inert", false);

  // Back to the top: the nav retires again
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(nav).toHaveJSProperty("inert", true);
});
