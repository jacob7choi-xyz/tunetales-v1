import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import TabAnchor from "@/app/artists/frank-ocean/cinema/TabAnchor";

afterEach(() => {
  cleanup();
});

describe("TabAnchor", () => {
  it("scrolls the target section into view on mount", () => {
    const target = document.createElement("section");
    target.id = "impact";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    render(<TabAnchor anchor="impact" />);
    expect(target.scrollIntoView).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    target.remove();
  });

  it("is harmless when a valid tab points to an omitted optional section", () => {
    // e.g. ?tab=impact while legacy data is unavailable: no #impact exists
    expect(() => render(<TabAnchor anchor="impact" />)).not.toThrow();
  });

  it("does nothing for a null anchor", () => {
    const spy = vi.spyOn(document, "getElementById");
    render(<TabAnchor anchor={null} />);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("re-anchors after fonts settle, unless the user has taken control", async () => {
    const target = document.createElement("section");
    target.id = "impact";
    target.scrollIntoView = vi.fn();
    document.body.appendChild(target);

    let resolveFonts: () => void = () => {};
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: new Promise<void>((resolve) => (resolveFonts = resolve)) },
    });

    // Without user input: settles -> re-anchors
    const first = render(<TabAnchor anchor="impact" />);
    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
    resolveFonts();
    await Promise.resolve();
    await Promise.resolve();
    expect(target.scrollIntoView).toHaveBeenCalledTimes(2);
    first.unmount();

    // With a scroll-intent key pressed: settlement must NOT yank the page
    (target.scrollIntoView as ReturnType<typeof vi.fn>).mockClear();
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready: new Promise<void>((resolve) => (resolveFonts = resolve)) },
    });
    render(<TabAnchor anchor="impact" />);
    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(window, { key: "ArrowDown" });
    resolveFonts();
    await Promise.resolve();
    await Promise.resolve();
    expect(target.scrollIntoView).toHaveBeenCalledTimes(1);

    target.remove();
    delete (document as { fonts?: unknown }).fonts;
  });
});
