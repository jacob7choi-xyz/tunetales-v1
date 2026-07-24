import { describe, it, expect, vi, afterEach } from "vitest";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import {
  isRegisteredArtist,
  readArtistStory,
  readJsonFile,
  readResearchSources,
  readSongUniverse,
} from "@/app/lib/data";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("readJsonFile tri-state semantics", () => {
  it("reports a nonexistent file as missing, not failed", async () => {
    const result = await readJsonFile(
      path.join(tmpdir(), "does-not-exist-anywhere.json"),
      "test"
    );
    expect(result.status).toBe("missing");
  });

  it("reports corrupt JSON as failed with an opaque errorId", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "tristate-"));
    const corrupt = path.join(dir, "corrupt.json");
    await writeFile(corrupt, "{not json", "utf-8");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      const result = await readJsonFile(corrupt, "test");
      expect(result.status).toBe("failed");
      if (result.status === "failed") {
        // Opaque token: hex only, no paths, no exception text
        expect(result.errorId).toMatch(/^[0-9a-f]{12}$/);
      }
      // The failure is observable server-side
      expect(errorSpy).toHaveBeenCalledOnce();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("returns parsed data when the file is valid", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "tristate-"));
    const valid = path.join(dir, "valid.json");
    await writeFile(valid, '{"ok": true}', "utf-8");
    try {
      const result = await readJsonFile(valid, "test");
      expect(result).toEqual({ status: "available", data: { ok: true } });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe("tri-state readers over real repo data", () => {
  it("readArtistStory: available for frank-ocean, missing for unregistered", async () => {
    const available = await readArtistStory("frank-ocean");
    expect(available.status).toBe("available");
    const missing = await readArtistStory("nonexistent-artist");
    expect(missing.status).toBe("missing");
  });

  it("readSongUniverse: available for frank-ocean", async () => {
    const result = await readSongUniverse("frank-ocean");
    expect(result.status).toBe("available");
  });

  it("readResearchSources: available with projected rows", async () => {
    const result = await readResearchSources("frank-ocean");
    expect(result.status).toBe("available");
    if (result.status === "available") {
      expect(result.data.length).toBeGreaterThan(0);
    }
  });

  it("isRegisteredArtist: true for frank-ocean, false for a well-formed stranger", async () => {
    const known = await isRegisteredArtist("frank-ocean");
    expect(known).toEqual({ status: "available", data: true });
    const stranger = await isRegisteredArtist("unknown-artist");
    expect(stranger).toEqual({ status: "available", data: false });
  });

  it("readers reject malformed slugs before touching the filesystem", async () => {
    await expect(readArtistStory("../../etc/passwd")).rejects.toThrow("Invalid slug");
    await expect(readSongUniverse("UPPER")).rejects.toThrow("Invalid slug");
    await expect(readResearchSources("")).rejects.toThrow("Invalid slug");
    await expect(isRegisteredArtist("a b")).rejects.toThrow("Invalid slug");
  });
});
