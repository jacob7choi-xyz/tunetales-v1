import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
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
});
