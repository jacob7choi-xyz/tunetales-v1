import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import AmbienceLayer from "@/app/components/AmbienceLayer";

afterEach(() => {
  cleanup();
});

describe("AmbienceLayer", () => {
  it("exposes the chapter hue as a CSS custom property", () => {
    const { getAllByTestId } = render(<AmbienceLayer accentHsl="260, 70%, 55%" />);
    const layer = getAllByTestId("ambience-layer")[0];
    expect(layer.style.getPropertyValue("--chapter-hsl")).toBe("260, 70%, 55%");
  });

  it("is decorative: hidden from assistive tech and click-through", () => {
    const { getAllByTestId } = render(<AmbienceLayer accentHsl="195, 75%, 50%" />);
    const layer = getAllByTestId("ambience-layer")[0];
    expect(layer.getAttribute("aria-hidden")).toBe("true");
    expect(layer.className).toContain("pointer-events-none");
    expect(layer.className).toContain("chapter-ambience");
  });
});
