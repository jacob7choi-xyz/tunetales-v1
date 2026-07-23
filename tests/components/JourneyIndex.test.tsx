import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import JourneyIndex from "@/app/components/JourneyIndex";
import type { ArtistStory } from "@/app/lib/types";

const story: ArtistStory = {
  schemaVersion: 2,
  title: "Frank Ocean: The Beautiful Mystery",
  artistSlug: "frank-ocean",
  chapters: [
    {
      id: "origins",
      order: 1,
      title: "THE BOY FROM LONG BEACH",
      content:
        "Christopher Edwin Breaux was born on October 28, 1987, in Long Beach, California. More text follows here.",
      ambience: { mood: "nostalgic", accentHsl: "260, 70%, 55%", spotifyTrackId: "abc" },
    },
    {
      id: "katrina",
      order: 2,
      title: "THE STORM THAT CHANGED EVERYTHING",
      content: "In 2005, after graduating high school, everything changed. And then more.",
      ambience: { mood: "intense", accentHsl: "220, 80%, 50%", spotifyTrackId: null },
    },
  ],
};

describe("JourneyIndex", () => {
  it("renders every chapter title as a link to its journey position", () => {
    render(<JourneyIndex story={story} />);
    const ch2 = screen
      .getAllByRole("link")
      .find((l) => l.getAttribute("href") === "/artists/frank-ocean/journey?chapter=2");
    expect(ch2).toBeDefined();
    expect(
      screen.getAllByText("THE STORM THAT CHANGED EVERYTHING").length
    ).toBeGreaterThan(0);
  });

  it("shows the real first sentence of each chapter as its teaser", () => {
    render(<JourneyIndex story={story} />);
    expect(
      screen.getAllByText(
        "Christopher Edwin Breaux was born on October 28, 1987, in Long Beach, California."
      ).length
    ).toBeGreaterThan(0);
  });

  it("shows the paired song for chapters that have one", () => {
    render(<JourneyIndex story={story} />);
    expect(screen.getAllByText(/with Thinkin Bout You/).length).toBeGreaterThan(0);
  });

  it("has a begin-at-the-beginning call to action", () => {
    render(<JourneyIndex story={story} />);
    const begin = screen
      .getAllByRole("link")
      .find((l) => l.getAttribute("href") === "/artists/frank-ocean/journey");
    expect(begin).toBeDefined();
  });
});
