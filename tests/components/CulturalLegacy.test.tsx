import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CulturalLegacy from "@/app/components/CulturalLegacy";
import type { ArtistLegacy } from "@/app/lib/types";

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

beforeAll(() => {
  // jsdom has no scrollIntoView
  Element.prototype.scrollIntoView = vi.fn();
});

const legacy: ArtistLegacy = {
  artist_slug: "frank-ocean",
  pillars: [
    {
      id: "vulnerability",
      numeral: "I",
      title: "Tears in Plain Sight",
      tagline: "The letter that gave a generation permission to feel",
      mood: "introspective",
      accent_hsl: "150, 55%, 45%",
      story: "First paragraph of the story.\n\nSecond paragraph of the story.",
      moments: ["The magazine opened with a personal letter"],
      voices: [{ quote: "Boys do cry", speaker: "Frank Ocean" }],
    },
    {
      id: "independence",
      numeral: "II",
      title: "Choosing the Quiet Road",
      tagline: "One album, zero label",
      mood: "rebellious",
      accent_hsl: "290, 70%, 55%",
      story: "Independence story text goes here.",
      moments: [],
      voices: [],
    },
  ],
};

describe("CulturalLegacy", () => {
  it("renders the constellation with a node per pillar", () => {
    render(<CulturalLegacy legacy={legacy} />);
    expect(
      screen.getAllByRole("button", { name: /Go to Tears in Plain Sight/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /Go to Choosing the Quiet Road/i }).length
    ).toBeGreaterThan(0);
  });

  it("renders pillar stories, taglines, and moments", () => {
    render(<CulturalLegacy legacy={legacy} />);
    expect(screen.getAllByText("First paragraph of the story.").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("The letter that gave a generation permission to feel").length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("The magazine opened with a personal letter").length
    ).toBeGreaterThan(0);
  });

  it("renders verified voices with their speakers", () => {
    render(<CulturalLegacy legacy={legacy} />);
    expect(screen.getAllByText(/Boys do cry/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Frank Ocean").length).toBeGreaterThan(0);
  });

  it("scrolls to a pillar when its constellation node is clicked", () => {
    render(<CulturalLegacy legacy={legacy} />);
    fireEvent.click(
      screen.getAllByRole("button", { name: /Go to Choosing the Quiet Road/i })[0]
    );
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });
});
