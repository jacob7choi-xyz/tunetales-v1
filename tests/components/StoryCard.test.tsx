import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StoryCard, { createArtistSlug } from "@/app/components/StoryCard";

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

  it("renders category and year metadata", () => {
    render(<StoryCard {...defaultProps} />);
    const meta = screen.getAllByText(/R&B/);
    expect(meta.length).toBeGreaterThan(0);
    expect(meta[0].textContent).toContain("2012");
  });

  it("makes the whole card a link with the correct href", () => {
    render(<StoryCard {...defaultProps} />);
    const links = screen.getAllByRole("link", { name: /frank ocean/i });
    expect(links[0]).toHaveAttribute("href", "/artists/frank-ocean");
  });

  it("renders image with correct alt text", () => {
    render(<StoryCard {...defaultProps} />);
    const images = screen.getAllByAltText("Frank Ocean album cover");
    expect(images.length).toBeGreaterThan(0);
  });

  it("renders a clickable card when status is active", () => {
    render(<StoryCard {...defaultProps} status="active" />);
    const links = screen.getAllByRole("link", { name: /frank ocean/i });
    expect(links.length).toBeGreaterThan(0);
  });

  it("renders a coming-soon label and no link when status is coming-soon", () => {
    render(
      <StoryCard
        {...defaultProps}
        artistName="Kendrick Lamar"
        status="coming-soon"
      />
    );
    expect(screen.getAllByText("Coming soon").length).toBeGreaterThan(0);
    expect(
      screen.queryByRole("link", { name: /kendrick lamar/i })
    ).toBeNull();
  });
});
