import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import HeroScene from "@/app/artists/frank-ocean/cinema/HeroScene";
import JourneyScenesSection from "@/app/artists/frank-ocean/cinema/JourneyScenesSection";
import SongsSection from "@/app/artists/frank-ocean/cinema/SongsSection";
import LegacySection from "@/app/artists/frank-ocean/cinema/LegacySection";
import SourcesSection from "@/app/artists/frank-ocean/cinema/SourcesSection";
import type { ArtistLegacy, ArtistStory } from "@/app/lib/types";

vi.mock("framer-motion", async () => await import("../helpers/framer-motion-mock"));

vi.mock("next/dynamic", () => ({
  default: () => {
    const Noop = () => null;
    return Noop;
  },
}));

class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", ObserverStub);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const story: ArtistStory = {
  schemaVersion: 2,
  title: "Frank Ocean: The Beautiful Mystery",
  artistSlug: "frank-ocean",
  chapters: [
    {
      id: "origins",
      order: 1,
      title: "THE BOY FROM LONG BEACH",
      content: "Full origin chapter text that must stay out of the scene shells.",
      ambience: {
        mood: "nostalgic",
        accentHsl: "260, 70%, 55%",
        spotifyTrackId: null,
        imageryHint: "Warm California sun, old photographs",
      },
    },
    {
      id: "katrina",
      order: 2,
      title: "THE STORM",
      content: "Storm chapter body text.",
      ambience: { mood: "intense", accentHsl: "220, 80%, 50%", spotifyTrackId: null },
    },
  ],
};

const legacy: ArtistLegacy = {
  artist_slug: "frank-ocean",
  pillars: [
    {
      id: "honesty",
      numeral: "I",
      title: "Radical Honesty",
      tagline: "The letter that opened a door",
      mood: "tender",
      accent_hsl: "300, 50%, 60%",
      story: "Pillar prose rendered on the server.\n\nSecond paragraph.",
      moments: ["A moment that mattered"],
      voices: [{ quote: "A verified quote", speaker: "A Real Person" }],
    },
  ],
};

describe("HeroScene", () => {
  it("renders the billboard with the pinned local portrait and h1", () => {
    const { container } = render(<HeroScene />);
    expect(screen.getByRole("heading", { level: 1, name: "Frank Ocean" })).toBeDefined();
    const img = container.querySelector("img");
    // next/image routes through the optimizer; decode to see the source
    expect(decodeURIComponent(img?.getAttribute("src") ?? "")).toContain(
      "/artists/frank-ocean/hero.jpg"
    );
    const cta = screen.getByText("Begin the Journey");
    expect(cta.closest("a")?.getAttribute("href")).toBe("#journey");
  });
});

describe("JourneyScenesSection", () => {
  it("renders a scene per chapter with numeral, title, and whisper", () => {
    render(<JourneyScenesSection story={story} />);
    expect(screen.getByText("THE BOY FROM LONG BEACH")).toBeDefined();
    expect(screen.getByText("THE STORM")).toBeDefined();
    expect(screen.getByText("Warm California sun, old photographs")).toBeDefined();
    expect(
      screen.getByLabelText("Enter chapter 1: THE BOY FROM LONG BEACH")
    ).toBeDefined();
  });

  it("keeps full chapter text OUT of the scene shells", () => {
    render(<JourneyScenesSection story={story} />);
    expect(
      screen.queryByText(/Full origin chapter text that must stay out/)
    ).toBeNull();
    expect(screen.queryByText("Storm chapter body text.")).toBeNull();
  });

  it("marks each scene with its accent for the room tint", () => {
    const { container } = render(
      <JourneyScenesSection story={story} />
    );
    const scenes = container.querySelectorAll("[data-accent]");
    expect(scenes.length).toBe(story.chapters.length);
    expect(scenes[0].getAttribute("data-accent")).toBe("260, 70%, 55%");
  });
});

describe("SongsSection", () => {
  it("renders the section chrome and passes poster meta only", () => {
    render(
      <SongsSection
        bubbles={[
          {
            song_name: "Ivy",
            story: "The full Ivy story text that must not reach the island props.",
            mood: "nostalgic",
            bubble_color: "#9A6B9A",
          },
        ]}
        artistSlug="frank-ocean"
      />
    );
    expect(screen.getByRole("heading", { level: 2, name: "Musical Creations" })).toBeDefined();
    expect(screen.getAllByText("Ivy").length).toBeGreaterThan(0);
    // The story text never renders and never enters the island
    expect(screen.queryByText(/full Ivy story text/)).toBeNull();
  });
});

describe("LegacySection", () => {
  it("server-renders pillar prose, moments, and voices", () => {
    render(<LegacySection artistName="Frank Ocean" legacy={legacy} />);
    expect(screen.getByRole("heading", { level: 2, name: "Cultural Legacy" })).toBeDefined();
    expect(screen.getByText("Pillar prose rendered on the server.")).toBeDefined();
    expect(screen.getByText("A moment that mattered")).toBeDefined();
    expect(screen.getByText(/A verified quote/)).toBeDefined();
    expect(screen.getByText("A Real Person")).toBeDefined();
  });

  it("anchors each pillar for the constellation nav", () => {
    const { container } = render(<LegacySection artistName="Frank Ocean" legacy={legacy} />);
    expect(container.querySelector("#pillar-honesty")).not.toBeNull();
    expect(container.querySelector("#pillar-honesty")?.getAttribute("data-accent")).toBe(
      "300, 50%, 60%"
    );
  });
});

describe("SourcesSection", () => {
  it("renders the making-of steps and the projected archive rows", () => {
    render(
      <SourcesSection
        sources={[
          { queryLabel: "Artist profile research", date: "2026-07-19T22:40:21", tokens: 1200 },
        ]}
      />
    );
    expect(screen.getByRole("heading", { level: 2, name: "How this story was made" })).toBeDefined();
    expect(screen.getByText("Artist profile research")).toBeDefined();
    expect(screen.getByText(/1,200 tokens of source material/)).toBeDefined();
  });

  it("shows the empty-archive line when no sources exist", () => {
    render(<SourcesSection sources={[]} />);
    expect(screen.getByText("The archive is being prepared.")).toBeDefined();
  });
});
