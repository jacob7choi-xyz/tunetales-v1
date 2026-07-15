import { describe, it, expect } from "vitest";
import { SLUG_PATTERN, COLORS, FONTS } from "@/app/lib/tokens";

describe("SLUG_PATTERN", () => {
  it("accepts valid slugs", () => {
    expect(SLUG_PATTERN.test("frank-ocean")).toBe(true);
    expect(SLUG_PATTERN.test("beyonce")).toBe(true);
    expect(SLUG_PATTERN.test("artist-123")).toBe(true);
  });

  it("rejects path traversal attempts", () => {
    expect(SLUG_PATTERN.test("../../etc/passwd")).toBe(false);
    expect(SLUG_PATTERN.test("..%2F..%2Fetc")).toBe(false);
    expect(SLUG_PATTERN.test("frank/../ocean")).toBe(false);
  });

  it("rejects special characters, underscores, spaces, and empty strings", () => {
    expect(SLUG_PATTERN.test("")).toBe(false);
    expect(SLUG_PATTERN.test("frank_ocean")).toBe(false);
    expect(SLUG_PATTERN.test("frank ocean")).toBe(false);
    expect(SLUG_PATTERN.test("Frank-Ocean")).toBe(false);
    expect(SLUG_PATTERN.test("-frank")).toBe(false);
    expect(SLUG_PATTERN.test("frank-")).toBe(false);
  });
});

describe("design tokens", () => {
  it("exposes the core palette", () => {
    expect(COLORS.purplePrimary).toContain("147, 51, 234");
    expect(COLORS.borderGlow).toBe("#c084fc");
    expect(COLORS.cardBg).toContain("15, 5, 30");
  });

  it("exposes font variables for inline styles", () => {
    expect(FONTS.display).toBe("var(--font-display)");
    expect(FONTS.body).toBe("var(--font-body)");
  });
});
