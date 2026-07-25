import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import GradedPhoto from "@/app/artists/frank-ocean/cinema/GradedPhoto";
import { gradeForChapter, HERO_GRADE } from "@/app/artists/frank-ocean/eraGrades";

afterEach(cleanup);

const grade = gradeForChapter("origins")!;

describe("GradedPhoto", () => {
  it("composites the required grade layers in the right relative order", () => {
    const { container } = render(<GradedPhoto src="/x.jpg" grade={grade} />);
    const layers = Array.from(
      container.querySelectorAll("[data-grade-layer]")
    ).map((el) => el.getAttribute("data-grade-layer"));
    // Shadows pulled down before highlights are lifted, grain settled over
    // both, vignette last so it darkens the finished frame. Asserted as
    // RELATIVE order of the required layers, not an exhaustive list: a
    // future layer (halation, bloom) is a design choice, not a regression.
    const required = ["shadow", "highlight", "grain", "vignette"];
    for (const name of required) expect(layers).toContain(name);
    const positions = required.map((name) => layers.indexOf(name));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("blends the tone layers rather than painting over the photograph", () => {
    const { container } = render(<GradedPhoto src="/x.jpg" grade={grade} />);
    const blend = (name: string) =>
      (container.querySelector(`[data-grade-layer="${name}"]`) as HTMLElement)
        .style.mixBlendMode;
    expect(blend("shadow")).toBe("multiply");
    expect(blend("highlight")).toBe("screen");
    expect(blend("grain")).toBe("overlay");
  });

  it("isolates the stack so blend layers never composite against the page", () => {
    const { container } = render(<GradedPhoto src="/x.jpg" grade={HERO_GRADE} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.isolation).toBe("isolate");
    // Purely compositional: the chapter's meaning is carried by its text
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("gives album artwork a lighter hand than a documentary photograph", () => {
    const { container: photo } = render(
      <GradedPhoto src="/x.jpg" grade={grade} treatment="photo" />
    );
    const photoGrain = (
      photo.querySelector('[data-grade-layer="grain"]') as HTMLElement
    ).style.opacity;
    cleanup();
    const { container: art } = render(
      <GradedPhoto src="/x.jpg" grade={grade} treatment="artwork" />
    );
    const artGrain = (
      art.querySelector('[data-grade-layer="grain"]') as HTMLElement
    ).style.opacity;
    expect(Number(artGrain)).toBeLessThan(Number(photoGrain));
  });

  it("sources grain from a same-origin asset, never an inline data URI", () => {
    const { container } = render(<GradedPhoto src="/x.jpg" grade={grade} />);
    const grain = container.querySelector(
      '[data-grade-layer="grain"]'
    ) as HTMLElement;
    // Keeps img-src free of `data:` so the CSP can stay narrow
    expect(grain.style.backgroundImage).toContain("/film-grain.svg");
    expect(grain.style.backgroundImage).not.toContain("data:");
  });
});
