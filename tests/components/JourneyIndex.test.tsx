import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import JourneyIndex from "@/app/components/JourneyIndex";
import type { ArtistStory } from "@/app/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/dynamic", () => ({
  default: () => {
    const Noop = () => null;
    return Noop;
  },
}));

// Exit animations never finish under jsdom; render plain elements so the
// journey overlay opens and closes synchronously in tests.
vi.mock("framer-motion", async () => {
  const React = await import("react");
  const stripMotionProps = (props: Record<string, unknown>) => {
    const { initial: _i, animate: _a, exit: _e, transition: _t, ...rest } = props;
    return rest;
  };
  const makeElement =
    (tag: string) =>
    ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) =>
      React.createElement(tag, stripMotionProps(props), children as React.ReactNode);
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: new Proxy({}, { get: (_t, key) => makeElement(String(key)) }),
  };
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
      content: "Origin story content paragraph.",
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
      title: "THE STORM THAT CHANGED EVERYTHING",
      content: "Storm chapter content paragraph.",
      ambience: {
        mood: "intense",
        accentHsl: "220, 80%, 50%",
        spotifyTrackId: null,
        imageryHint: "Rain, floodwater, a one-way road west",
      },
    },
  ],
};

afterEach(() => {
  cleanup();
});

describe("JourneyIndex", () => {
  it("renders a cinematic frame per chapter with number and title only", () => {
    render(<JourneyIndex story={story} />);
    expect(
      screen.getAllByRole("button", { name: /Enter chapter 1/i }).length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("THE BOY FROM LONG BEACH").length).toBeGreaterThan(0);
    // No expository teaser text: chapter content stays out of the reel
    expect(screen.queryByText("Origin story content paragraph.")).toBeNull();
  });

  it("carries the imagery whisper for hover reveal", () => {
    render(<JourneyIndex story={story} />);
    expect(
      screen.getAllByText("Rain, floodwater, a one-way road west").length
    ).toBeGreaterThan(0);
  });

  it("opens the journey overlay at the clicked chapter", () => {
    render(<JourneyIndex story={story} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /Enter chapter 2/i })[0]
    );
    expect(
      screen.getAllByText("Storm chapter content paragraph.").length
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Chapter 2 of 2/).length).toBeGreaterThan(0);
  });

  it("closes the overlay and returns to the reel", () => {
    render(<JourneyIndex story={story} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /Enter chapter 1/i })[0]
    );
    fireEvent.click(
      screen.getAllByRole("button", { name: /Close the journey/i })[0]
    );
    expect(screen.queryByText("Origin story content paragraph.")).toBeNull();
  });
});
