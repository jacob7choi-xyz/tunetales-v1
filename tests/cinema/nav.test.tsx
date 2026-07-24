import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent, screen, act } from "@testing-library/react";
import FloatingPillNav, {
  HERO_SENTINEL_ATTR,
} from "@/app/artists/frank-ocean/cinema/FloatingPillNav";
import RoomTint from "@/app/artists/frank-ocean/cinema/RoomTint";
import ConstellationNav from "@/app/artists/frank-ocean/cinema/ConstellationNav";

vi.mock("framer-motion", async () => await import("../helpers/framer-motion-mock"));

// jsdom has no IntersectionObserver; the stub records callbacks so tests
// can drive intersection transitions manually
type IOCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void;
const ioCallbacks: IOCallback[] = [];

class ObserverStub {
  constructor(callback: IOCallback) {
    ioCallbacks.push(callback);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  ioCallbacks.length = 0;
  vi.stubGlobal("IntersectionObserver", ObserverStub);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.querySelectorAll(`[${HERO_SENTINEL_ATTR}]`).forEach((el) => el.remove());
});

const SECTIONS = [
  { id: "journey", label: "Journey" },
  { id: "discography", label: "Songs" },
];

function mountSentinel() {
  const sentinel = document.createElement("div");
  sentinel.setAttribute(HERO_SENTINEL_ATTR, "");
  document.body.appendChild(sentinel);
  return sentinel;
}

function driveSentinel(entry: Partial<IntersectionObserverEntry>) {
  // Deliver to every registered observer inside act(): only the sentinel
  // observer exists here (no [data-pill-section] elements are mounted)
  act(() => {
    for (const callback of ioCallbacks) callback([entry]);
  });
}

describe("FloatingPillNav", () => {
  it("is inert (unfocusable, out of the a11y tree) until the hero passes", () => {
    mountSentinel();
    render(<FloatingPillNav sections={SECTIONS} />);
    const nav = screen.getByLabelText("Page sections", { selector: "nav" });
    expect(nav.hasAttribute("inert")).toBe(true);
  });

  it("becomes interactive once the hero sentinel scrolls above the viewport", () => {
    mountSentinel();
    render(<FloatingPillNav sections={SECTIONS} />);
    driveSentinel({
      isIntersecting: false,
      boundingClientRect: { bottom: -10 } as DOMRectReadOnly,
    });
    const nav = screen.getByLabelText("Page sections", { selector: "nav" });
    expect(nav.hasAttribute("inert")).toBe(false);
  });

  it("hides again when scrolling back up to the hero", () => {
    mountSentinel();
    render(<FloatingPillNav sections={SECTIONS} />);
    driveSentinel({
      isIntersecting: false,
      boundingClientRect: { bottom: -10 } as DOMRectReadOnly,
    });
    driveSentinel({
      isIntersecting: true,
      boundingClientRect: { bottom: 400 } as DOMRectReadOnly,
    });
    const nav = screen.getByLabelText("Page sections", { selector: "nav" });
    expect(nav.hasAttribute("inert")).toBe(true);
  });

  it("scrolls to the section on pill click", () => {
    mountSentinel();
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
