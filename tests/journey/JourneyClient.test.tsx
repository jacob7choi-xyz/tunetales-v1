import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import JourneyClient from "@/app/artists/frank-ocean/journey/JourneyClient";
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

// Exit animations never finish under jsdom, which would leave the previous
// chapter mounted forever inside AnimatePresence mode="wait". Render plain
// elements instead so chapter changes are synchronous in tests.
vi.mock("framer-motion", async () => {
  const React = await import("react");
  const stripMotionProps = (props: Record<string, unknown>) => {
    const {
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      whileHover: _whileHover,
      whileTap: _whileTap,
      ...rest
    } = props;
    return rest;
  };
  const makeElement =
    (tag: string) =>
    ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) =>
      React.createElement(tag, stripMotionProps(props), children as React.ReactNode);
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: new Proxy(
      {},
      { get: (_target, key) => makeElement(String(key)) }
    ),
  };
});

const story: ArtistStory = {
  schemaVersion: 2,
  title: "Frank Ocean: The Beautiful Mystery",
  artistSlug: "frank-ocean",
  chapters: [
    {
      id: "one",
      order: 1,
      title: "CHAPTER ONE TITLE",
      content: "First paragraph.\n\nSecond paragraph.",
      ambience: {
        mood: "nostalgic",
        accentHsl: "260, 70%, 55%",
        spotifyTrackId: "track-one",
      },
    },
    {
      id: "two",
      order: 2,
      title: "CHAPTER TWO TITLE",
      content: "Chapter two content.",
      ambience: { mood: "intense", accentHsl: "220, 80%, 50%", spotifyTrackId: null },
    },
    {
      id: "three",
      order: 3,
      title: "CHAPTER THREE TITLE",
      content: "Chapter three content.",
      ambience: { mood: "wonder", accentHsl: "195, 75%, 50%", spotifyTrackId: null },
    },
  ],
};

afterEach(() => {
  cleanup();
});

describe("JourneyClient", () => {
  it("renders the first chapter on load", () => {
    render(<JourneyClient story={story} />);
    expect(screen.getAllByText("CHAPTER ONE TITLE").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Chapter 1 of 3/).length).toBeGreaterThan(0);
  });

  it("splits chapter content into paragraphs", () => {
    render(<JourneyClient story={story} />);
    expect(screen.getAllByText("First paragraph.").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Second paragraph.").length).toBeGreaterThan(0);
  });

  it("advances to the next chapter on Next click", () => {
    render(<JourneyClient story={story} />);
    fireEvent.click(screen.getAllByRole("button", { name: /Next Chapter/i })[0]);
    expect(screen.getAllByText("CHAPTER TWO TITLE").length).toBeGreaterThan(0);
  });

  it("jumps directly to a chapter via a progress dot", () => {
    render(<JourneyClient story={story} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: "Go to chapter 3" })[0]
    );
    expect(screen.getAllByText("CHAPTER THREE TITLE").length).toBeGreaterThan(0);
  });

  it("renders the Spotify embed only when the chapter has a track", () => {
    const { container } = render(<JourneyClient story={story} />);
    expect(container.querySelector("iframe")).not.toBeNull();
    fireEvent.click(screen.getAllByRole("button", { name: /Next Chapter/i })[0]);
    expect(container.querySelector('iframe[src*="track-one"]')).toBeNull();
  });

  it("navigates chapters with arrow keys", () => {
    render(<JourneyClient story={story} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getAllByText("CHAPTER TWO TITLE").length).toBeGreaterThan(0);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getAllByText("CHAPTER ONE TITLE").length).toBeGreaterThan(0);
  });
});
