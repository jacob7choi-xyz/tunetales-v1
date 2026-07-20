import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import SongOdyssey from "@/app/components/SongOdyssey";
import type { SongBubble } from "@/app/lib/types";

// Exit animations never finish under jsdom; render plain elements so
// open/close of the story reader is synchronous in tests.
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
    song_name: "Rushes",
    story: "A song from the staircase album.",
    mood: "peaceful",
    bubble_color: "#3498DB",
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

describe("SongOdyssey", () => {
  it("renders songs under their era acts", () => {
    render(<SongOdyssey bubbles={bubbles} />);
    expect(screen.getAllByText("Channel Orange").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Endless").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pyramids").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Rushes").length).toBeGreaterThan(0);
  });

  it("hides acts with no available songs and shows unmapped songs in More Songs", () => {
    render(<SongOdyssey bubbles={bubbles} />);
    expect(screen.queryByText("Nostalgia, Ultra")).toBeNull();
    expect(screen.getAllByText("More Songs").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Some Unmapped Song").length).toBeGreaterThan(0);
  });

  it("opens the full-screen story reader when a poster is clicked", () => {
    render(<SongOdyssey bubbles={bubbles} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /Read the story of Pyramids/i })[0]
    );
    expect(screen.getAllByText("How It All Began").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("A rented house in Los Angeles.").length
    ).toBeGreaterThan(0);
  });

  it("plays the song inside the reader when a track ID is known", () => {
    const { container } = render(<SongOdyssey bubbles={bubbles} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /Read the story of Nikes/i })[0]
    );
    expect(container.querySelector('iframe[src*="19YKaevk2bce4odJkP5L22"]')).not.toBeNull();
  });

  it("closes the reader with the close button and Escape", () => {
    render(<SongOdyssey bubbles={bubbles} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /Read the story of Pyramids/i })[0]
    );
    fireEvent.click(screen.getAllByRole("button", { name: /Close story/i })[0]);
    expect(screen.queryByText("A rented house in Los Angeles.")).toBeNull();

    fireEvent.click(
      screen.getAllByRole("button", { name: /Read the story of Pyramids/i })[0]
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("A rented house in Los Angeles.")).toBeNull();
  });
});
