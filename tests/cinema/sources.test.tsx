import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import SourcesSection, {
  summarizeArchive,
} from "@/app/artists/frank-ocean/cinema/SourcesSection";

vi.mock("framer-motion", async () => await import("../helpers/framer-motion-mock"));

afterEach(cleanup);

describe("SourcesSection", () => {
  const manySources = [
    ...Array.from({ length: 77 }, (_, i) => ({
      queryLabel: "Song story research",
      date: `2026-07-19T22:${String(i % 60).padStart(2, "0")}:21`,
      tokens: 1200,
    })),
    { queryLabel: "Artist profile research", date: "2026-07-23T17:02:34", tokens: 2537 },
    { queryLabel: "Album deep dive", date: "2025-06-18T10:00:00", tokens: 900 },
  ];

  it("summarizes the archive instead of printing a row per file", () => {
    render(<SourcesSection sources={manySources} />);
    expect(screen.getByRole("heading", { level: 2, name: "How this story was made" })).toBeDefined();
    // One row per KIND of research, not one per file: 79 files, 3 kinds
    expect(screen.getByText("79")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("77 files, Jul 2026")).toBeDefined();
    expect(screen.getByText("1 file, Jun 2025")).toBeDefined();
    expect(screen.getByText(/Jun 2025 to Jul 2026/)).toBeDefined();
  });

  it("never surfaces pipeline volume metrics to readers", () => {
    render(<SourcesSection sources={manySources} />);
    // Token counts measure our machinery, not the story's grounding
    expect(screen.queryByText(/token/i)).toBeNull();
    expect(screen.queryByText(/2,537/)).toBeNull();
  });

  it("shows the empty-archive line when no sources exist", () => {
    render(<SourcesSection sources={[]} />);
    expect(screen.getByText("The archive is being prepared.")).toBeDefined();
  });
});

describe("summarizeArchive", () => {
  it("groups by research kind, largest body of work first", () => {
    const summary = summarizeArchive([
      { queryLabel: "Album deep dive", date: "2025-06-18T10:00:00", tokens: 1 },
      { queryLabel: "Song story research", date: "2026-07-19T10:00:00", tokens: 1 },
      { queryLabel: "Song story research", date: "2026-07-20T10:00:00", tokens: 1 },
    ]);
    expect(summary.total).toBe(3);
    expect(summary.groups.map((g) => [g.label, g.count])).toEqual([
      ["Song story research", 2],
      ["Album deep dive", 1],
    ]);
  });

  it("survives an unparseable date without breaking the summary", () => {
    const summary = summarizeArchive([
      { queryLabel: "Song story research", date: "not-a-date", tokens: 1 },
      { queryLabel: "Song story research", date: "2026-07-19T10:00:00", tokens: 1 },
    ]);
    expect(summary.total).toBe(2);
    expect(summary.groups[0].count).toBe(2);
    // The one valid timestamp still anchors the period
    expect(summary.earliest).not.toBeNull();
    expect(Number.isNaN(summary.groups[0].latest)).toBe(false);
  });

  it("returns an empty summary for an empty archive", () => {
    const summary = summarizeArchive([]);
    expect(summary).toEqual({ total: 0, groups: [], earliest: null, latest: null });
  });
});
