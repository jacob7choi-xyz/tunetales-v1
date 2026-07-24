import { describe, it, expect } from "vitest";
import { resolveTabAnchor } from "@/app/artists/frank-ocean/cinema/tabs";
import { planSections } from "@/app/artists/frank-ocean/cinema/pageSections";
import type { ReadResult } from "@/app/lib/data";
import type { ArtistLegacy, SongUniverse } from "@/app/lib/types";
import type { PublicResearchSource } from "@/app/lib/public/types";

describe("resolveTabAnchor (S4 lookup table)", () => {
  it("maps every known tab to its anchor", () => {
    expect(resolveTabAnchor("journey")).toBe("journey");
    expect(resolveTabAnchor("discography")).toBe("discography");
    expect(resolveTabAnchor("impact")).toBe("impact");
    expect(resolveTabAnchor("sources")).toBe("sources");
  });

  it("resolves unknown, hostile, and prototype-key values to null", () => {
    expect(resolveTabAnchor(undefined)).toBeNull();
    expect(resolveTabAnchor("")).toBeNull();
    expect(resolveTabAnchor("not-a-tab")).toBeNull();
    expect(resolveTabAnchor("<script>alert(1)</script>")).toBeNull();
    expect(resolveTabAnchor("../../../etc/passwd")).toBeNull();
    expect(resolveTabAnchor("__proto__")).toBeNull();
    expect(resolveTabAnchor("constructor")).toBeNull();
    expect(resolveTabAnchor("toString")).toBeNull();
  });
});

const universeData: SongUniverse = {
  artist_slug: "frank-ocean",
  song_bubbles: [{ song_name: "Ivy", story: "s", mood: "nostalgic", bubble_color: "#9A6B9A" }],
};
const legacyData: ArtistLegacy = {
  artist_slug: "frank-ocean",
  pillars: [
    {
      id: "honesty",
      numeral: "I",
      title: "T",
      tagline: "t",
      mood: "tender",
      accent_hsl: "1, 1%, 1%",
      story: "s",
      moments: [],
      voices: [],
    },
  ],
};
const researchData: PublicResearchSource[] = [
  { queryLabel: "Artist profile research", date: "2026-01-01", tokens: 100 },
];

const available = <T,>(data: T): ReadResult<T> => ({ status: "available", data });
const missing = { status: "missing" } as const;
const failed = { status: "failed", errorId: "abc123def456" } as const;

describe("planSections (S7 degradation)", () => {
  it("shows every section and pill when all reads are available", () => {
    const plan = planSections(available(universeData), available(legacyData), available(researchData));
    expect(plan).toEqual({
      showSongs: true,
      showLegacy: true,
      showSources: true,
      pills: [
        { id: "journey", label: "Journey" },
        { id: "discography", label: "Songs" },
        { id: "impact", label: "Legacy" },
        { id: "sources", label: "Sources" },
      ],
    });
  });

  it("omits sections for missing AND failed reads alike (users see absence)", () => {
    const plan = planSections(missing, failed, missing);
    expect(plan.showSongs).toBe(false);
    expect(plan.showLegacy).toBe(false);
    expect(plan.showSources).toBe(false);
    expect(plan.pills).toEqual([{ id: "journey", label: "Journey" }]);
  });

  it("omits songs when the universe is available but empty", () => {
    const empty: SongUniverse = { artist_slug: "frank-ocean", song_bubbles: [] };
    const plan = planSections(available(empty), missing, missing);
    expect(plan.showSongs).toBe(false);
  });

  it("keeps sources visible with an empty archive (available but no rows)", () => {
    const plan = planSections(missing, missing, available([]));
    expect(plan.showSources).toBe(true);
    expect(plan.pills).toEqual([
      { id: "journey", label: "Journey" },
      { id: "sources", label: "Sources" },
    ]);
  });
});
