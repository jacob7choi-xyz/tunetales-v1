import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import StoryCard, { createArtistSlug } from "@/app/components/StoryCard";

vi.mock("@/app/components/FloatingNotesLayer", () => ({
  default: () => null,
}));

describe("createArtistSlug", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(createArtistSlug("Frank Ocean")).toBe("frank-ocean");
  });

  it("handles accented characters", () => {
    expect(createArtistSlug("Beyoncé")).toBe("beyonce");
  });

  it("strips special characters", () => {
    expect(createArtistSlug("Guns N' Roses")).toBe("guns-n-roses");
  });

  it("collapses multiple spaces", () => {
    expect(createArtistSlug("Kendrick   Lamar")).toBe("kendrick-lamar");
  });

  it("handles multiple accented vowels", () => {
    expect(createArtistSlug("Àngèlique Ünö")).toBe("angelique-uno");
  });

  it("strips leading and trailing hyphens", () => {
    expect(createArtistSlug(" Frank Ocean ")).toBe("frank-ocean");
    expect(createArtistSlug("'Frank Ocean'")).toBe("frank-ocean");
  });

  it("handles names with only numbers", () => {
    expect(createArtistSlug("21 Savage")).toBe("21-savage");
  });

  it("returns empty string for non-latin input", () => {
    expect(createArtistSlug("!!!")).toBe("");
  });
});

describe("StoryCard", () => {
  const defaultProps = {
    artistName: "Frank Ocean",
    coverImageUrl: "https://example.com/frank.jpg",
    category: "R&B",
    year: 2012,
  };

  it("renders artist name", () => {
    render(<StoryCard {...defaultProps} />);
    expect(screen.getByText("Frank Ocean")).toBeInTheDocument();
  });

  it("renders category and year badges", () => {
    render(<StoryCard {...defaultProps} />);
    const categories = screen.getAllByText("R&B");
    expect(categories.length).toBeGreaterThan(0);
    const years = screen.getAllByText("2012");
    expect(years.length).toBeGreaterThan(0);
  });

  it("renders explore link with correct href", () => {
    render(<StoryCard {...defaultProps} />);
    const links = screen.getAllByRole("link", { name: /explore frank ocean/i });
    expect(links[0]).toHaveAttribute("href", "/artists/frank-ocean");
  });

  it("renders image with correct alt text", () => {
    render(<StoryCard {...defaultProps} />);
    const images = screen.getAllByAltText("Frank Ocean album cover");
    expect(images.length).toBeGreaterThan(0);
  });
});
