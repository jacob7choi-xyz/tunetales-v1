import { describe, it, expect, vi, afterEach } from "vitest";
import { normalizeRegistryRead } from "@/app/lib/data";

afterEach(() => {
  vi.restoreAllMocks();
});

// Infrastructure absence must surface as failed (opaque errorId, server
// log), NEVER as missing: otherwise a broken deployment with no
// artists.json would cascade into "artist not found" 404s (S7). The
// mapping is a pure exported function so this contract needs no
// filesystem mocking.
describe("registry absence is corruption, not absence (S7)", () => {
  it("maps a missing registry file to failed with an errorId", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result = normalizeRegistryRead({ status: "missing" });
    expect(result.status).toBe("failed");
    if (result.status === "failed") {
      expect(result.errorId).toMatch(/^[0-9a-f]{12}$/);
    }
    expect(errorSpy).toHaveBeenCalled();
  });

  it("maps a non-array registry to failed", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = normalizeRegistryRead({ status: "available", data: { not: "an array" } });
    expect(result.status).toBe("failed");
  });

  it("passes an upstream failure through unchanged", () => {
    const upstream = { status: "failed", errorId: "abc123def456" } as const;
    expect(normalizeRegistryRead(upstream)).toBe(upstream);
  });

  it("passes a healthy registry through as available", () => {
    const result = normalizeRegistryRead({ status: "available", data: [] });
    expect(result).toEqual({ status: "available", data: [] });
  });

  it("fails closed on entries with malformed identity (registry is authorization input)", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const good = { id: "frank-ocean", artistName: "Frank Ocean" };
    expect(
      normalizeRegistryRead({ status: "available", data: [good, { id: 42 }] }).status
    ).toBe("failed");
    expect(
      normalizeRegistryRead({ status: "available", data: [good, { id: "../etc" }] }).status
    ).toBe("failed");
    expect(
      normalizeRegistryRead({ status: "available", data: [good, null] }).status
    ).toBe("failed");
    expect(
      normalizeRegistryRead({ status: "available", data: [good, "frank-ocean"] }).status
    ).toBe("failed");
    expect(normalizeRegistryRead({ status: "available", data: [good] }).status).toBe(
      "available"
    );
  });
});
