import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent, screen } from "@testing-library/react";
import NavbarScrollShell from "@/app/artists/frank-ocean/cinema/NavbarScrollShell";
import HeroMotion from "@/app/artists/frank-ocean/cinema/HeroMotion";
import SceneMotion from "@/app/artists/frank-ocean/cinema/SceneMotion";

vi.mock("framer-motion", async () => await import("../helpers/framer-motion-mock"));

afterEach(() => {
  cleanup();
  Object.defineProperty(window, "scrollY", { value: 0, writable: true });
});

describe("NavbarScrollShell", () => {
  it("owns a wrapper and toggles data-scrolled with scroll position", () => {
    const { container } = render(
      <NavbarScrollShell>
        <nav>chrome</nav>
      </NavbarScrollShell>
    );
    const shell = container.querySelector("[data-navbar-shell]") as HTMLElement;
    expect(shell).not.toBeNull();
    expect(shell.hasAttribute("data-scrolled")).toBe(false);

    Object.defineProperty(window, "scrollY", { value: 200, writable: true });
    fireEvent.scroll(window);
    expect(shell.hasAttribute("data-scrolled")).toBe(true);

    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    fireEvent.scroll(window);
    expect(shell.hasAttribute("data-scrolled")).toBe(false);
  });

  it("renders its children untouched", () => {
    render(
      <NavbarScrollShell>
        <nav>site chrome</nav>
      </NavbarScrollShell>
    );
    expect(screen.getByText("site chrome")).toBeDefined();
  });
});

describe("HeroMotion", () => {
  it("renders server content through portrait and title slots", () => {
    render(
      <HeroMotion
        portrait={<span>portrait content</span>}
        title={<h1>Frank Ocean</h1>}
      />
    );
    expect(screen.getByText("portrait content")).toBeDefined();
    expect(screen.getByText("Frank Ocean")).toBeDefined();
    expect(screen.getByTestId("hero-portrait-slot")).toBeDefined();
    expect(screen.getByTestId("hero-title-slot")).toBeDefined();
  });
});

describe("SceneMotion", () => {
  it("renders decorative art (aria-hidden) and content slots", () => {
    const { container } = render(
      <SceneMotion decorativeArt={<span>album art</span>}>
        <h3>Chapter title</h3>
      </SceneMotion>
    );
    expect(screen.getByText("album art")).toBeDefined();
    expect(screen.getByText("Chapter title")).toBeDefined();
    const artSlot = container.querySelector('[data-testid="scene-art-slot"]');
    expect(artSlot?.getAttribute("aria-hidden")).toBe("true");
  });
});
