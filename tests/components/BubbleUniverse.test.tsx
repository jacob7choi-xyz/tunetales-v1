import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import BubbleUniverse from "@/app/components/BubbleUniverse";
import type { SongBubble } from "@/app/lib/types";

// Exit animations never finish under jsdom; render plain elements so
// open/close of the story overlay is synchronous in tests.
vi.mock("framer-motion", async () => {
  const React = await import("react");
  const stripMotionProps = (props: Record<string, unknown>) => {
    const {
      initial: _i,
      animate: _a,
      exit: _e,
      transition: _t,
      whileHover: _wh,
      whileTap: _wt,
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
    motion: new Proxy({}, { get: (_t, key) => makeElement(String(key)) }),
  };
});

const bubbles: SongBubble[] = [
  {
    song_name: "Pyramids",
    story: "## How It All Began\n\nA rented house in Los Angeles.\n\n## The Heart of the Song\n\nGrandeur and ache.",
    mood: "intense",
    bubble_color: "#D35400",
  },
  {
    song_name: "Nikes",
    story: "## How It All Began\n\nA video played in reverse.",
    mood: "introspective",
    bubble_color: "#27AE60",
  },
  {
    song_name: "Some Unmapped Song",
    story: "A story without an era.",
    mood: "playful",
    bubble_color: "#F1C40F",
  },
];

afterEach(() => {
  cleanup();
});

describe("BubbleUniverse", () => {
  it("renders bubbles grouped under their album eras", () => {
    render(<BubbleUniverse bubbles={bubbles} />);
    expect(screen.getAllByText("Channel Orange").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Blonde").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pyramids").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Nikes").length).toBeGreaterThan(0);
  });

  it("shows songs outside known eras in a fallback section", () => {
    render(<BubbleUniverse bubbles={bubbles} />);
    expect(screen.getAllByText("More Songs").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Some Unmapped Song").length).toBeGreaterThan(0);
  });

  it("opens the story overlay when a bubble is clicked", () => {
    render(<BubbleUniverse bubbles={bubbles} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /Read the story of Pyramids/i })[0]
    );
    expect(screen.getAllByText("How It All Began").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("A rented house in Los Angeles.").length
    ).toBeGreaterThan(0);
  });

  it("shows a Spotify embed for songs with known track IDs", () => {
    const { container } = render(<BubbleUniverse bubbles={bubbles} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /Read the story of Nikes/i })[0]
    );
    expect(container.querySelector('iframe[src*="19YKaevk2bce4odJkP5L22"]')).not.toBeNull();
  });

  it("closes the overlay via the close button", () => {
    render(<BubbleUniverse bubbles={bubbles} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /Read the story of Pyramids/i })[0]
    );
    fireEvent.click(screen.getAllByRole("button", { name: /Close story/i })[0]);
    expect(screen.queryByText("A rented house in Los Angeles.")).toBeNull();
  });
});
