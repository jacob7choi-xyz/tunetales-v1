import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SpotifyEmbed from "@/app/components/SpotifyEmbed";

describe("SpotifyEmbed", () => {
  it("renders an iframe pointing at the Spotify embed player", () => {
    const { container } = render(
      <SpotifyEmbed trackId="7DfFc7a6Rwfi3YQMRbDMau" label="THE BOY FROM LONG BEACH" />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe!.getAttribute("src")).toContain(
      "open.spotify.com/embed/track/7DfFc7a6Rwfi3YQMRbDMau"
    );
  });

  it("lazy-loads and has an accessible title", () => {
    const { container } = render(
      <SpotifyEmbed trackId="abc123" label="Chapter Title" />
    );
    const iframe = container.querySelector("iframe");
    expect(iframe!.getAttribute("loading")).toBe("lazy");
    expect(iframe!.getAttribute("title")).toBe("Listen: Chapter Title");
  });
});
