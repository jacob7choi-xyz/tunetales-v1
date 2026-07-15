import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import NotFound from "@/app/not-found";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/dynamic", () => ({
  default: () => {
    const Noop = () => null;
    return Noop;
  },
}));

afterEach(() => {
  cleanup();
});

describe("NotFound", () => {
  it("renders the 404 heading and message", () => {
    render(<NotFound />);
    expect(screen.getAllByText("404").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Lost in the Musical Cosmos").length
    ).toBeGreaterThan(0);
  });

  it("renders both navigation buttons", () => {
    render(<NotFound />);
    expect(
      screen.getAllByRole("button", { name: /Return to TuneTales/i }).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: /Explore Frank Ocean/i }).length
    ).toBeGreaterThan(0);
  });

  it("does not start any JS animation intervals", () => {
    const intervalSpy = vi.spyOn(globalThis, "setInterval");
    render(<NotFound />);
    expect(intervalSpy).not.toHaveBeenCalled();
    intervalSpy.mockRestore();
  });

  it("uses the shared animated background class", () => {
    const { container } = render(<NotFound />);
    expect(container.querySelector(".animated-bg")).not.toBeNull();
  });
});
