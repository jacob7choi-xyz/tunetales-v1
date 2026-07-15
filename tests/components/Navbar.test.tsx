import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import Navbar from "@/app/components/Navbar";

afterEach(() => {
  cleanup();
});

describe("Navbar", () => {
  it("renders the wordmark and Beta badge", () => {
    render(<Navbar />);
    expect(screen.getAllByText("TuneTales").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Beta").length).toBeGreaterThan(0);
  });

  it("renders a subtitle when provided", () => {
    render(<Navbar subtitle="Artist Deep Dive" />);
    expect(screen.getAllByText("Artist Deep Dive").length).toBeGreaterThan(0);
  });

  it("omits the back link by default", () => {
    render(<Navbar />);
    expect(screen.queryByText("Back")).toBeNull();
  });

  it("renders a back link when backHref is provided", () => {
    render(<Navbar backHref="/artists/frank-ocean" backLabel="Frank Ocean" />);
    const links = screen.getAllByRole("link", { name: /Frank Ocean/i });
    expect(links[0]).toHaveAttribute("href", "/artists/frank-ocean");
  });

  it("links the wordmark to the homepage", () => {
    render(<Navbar />);
    const homeLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href") === "/");
    expect(homeLinks.length).toBeGreaterThan(0);
  });
});
