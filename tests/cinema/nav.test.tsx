import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import FloatingPillNav from "@/app/artists/frank-ocean/cinema/FloatingPillNav";
import RoomTint from "@/app/artists/frank-ocean/cinema/RoomTint";
import ConstellationNav from "@/app/artists/frank-ocean/cinema/ConstellationNav";

vi.mock("framer-motion", async () => await import("../helpers/framer-motion-mock"));

// jsdom has no IntersectionObserver; the islands must still render
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
  Object.defineProperty(window, "scrollY", { value: 0, writable: true });
});

const SECTIONS = [
  { id: "journey", label: "Journey" },
  { id: "discography", label: "Songs" },
];

describe("FloatingPillNav", () => {
  it("stays hidden at the top of the page", () => {
    render(<FloatingPillNav sections={SECTIONS} />);
    const nav = screen.getByLabelText("Page sections");
    expect(nav.getAttribute("aria-hidden")).toBe("true");
  });

  it("appears after scrolling past the hero", () => {
    render(<FloatingPillNav sections={SECTIONS} />);
    Object.defineProperty(window, "scrollY", { value: 2000, writable: true });
    fireEvent.scroll(window);
    const nav = screen.getByLabelText("Page sections");
    expect(nav.getAttribute("aria-hidden")).toBe("false");
  });

  it("scrolls to the section on pill click", () => {
    const target = document.createElement("section");
    target.id = "discography";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    render(<FloatingPillNav sections={SECTIONS} />);
    fireEvent.click(screen.getByText("Songs"));
    expect(target.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    target.remove();
  });
});

describe("RoomTint", () => {
  it("renders the ambience layer with the resting tint", () => {
    render(<RoomTint defaultAccentHsl="260, 65%, 50%" />);
    expect(screen.getByTestId("ambience-layer")).toBeDefined();
  });
});

describe("ConstellationNav", () => {
  const pillars = [
    { id: "honesty", numeral: "I", title: "Radical Honesty", accent_hsl: "300, 50%, 60%" },
    { id: "sound", numeral: "II", title: "A New Sound", accent_hsl: "200, 60%, 55%" },
  ];

  it("renders a node per pillar with numeral and title", () => {
    render(<ConstellationNav artistName="Frank Ocean" pillars={pillars} />);
    expect(screen.getAllByText("I").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Radical Honesty").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/A New Sound/).length).toBeGreaterThan(0);
  });

  it("scrolls to the pillar section on node click", () => {
    const target = document.createElement("section");
    target.id = "pillar-honesty";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    render(<ConstellationNav artistName="Frank Ocean" pillars={pillars} />);
    fireEvent.click(screen.getAllByLabelText("Go to Radical Honesty")[0]);
    expect(target.scrollIntoView).toHaveBeenCalled();
    target.remove();
  });
});
