import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import SongOdyssey from "@/app/components/SongOdyssey";

vi.mock("framer-motion", async () => await import("../helpers/framer-motion-mock"));

class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", ObserverStub);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const posterMeta = [
  { song_name: "Ivy", mood: "nostalgic", bubble_color: "#9A6B9A" },
  { song_name: "Godspeed", mood: "peaceful", bubble_color: "#6B9A8A" },
];

describe("SongOdyssey lazy story loading", () => {
  it("renders posters from meta alone, with no story text in the DOM", () => {
    render(<SongOdyssey bubbles={posterMeta} lazyStoriesForArtist="frank-ocean" />);
    expect(screen.getAllByText("Ivy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Godspeed").length).toBeGreaterThan(0);
  });

  it("fetches stories once on first reader open and renders the text", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          song_bubbles: [
            { song_name: "Ivy", story: "The lazily fetched Ivy story body." },
            { song_name: "Godspeed", story: "The Godspeed story body." },
          ],
        }),
      }))
    );

    render(<SongOdyssey bubbles={posterMeta} lazyStoriesForArtist="frank-ocean" />);
    fireEvent.click(screen.getAllByLabelText("Read the story of Ivy")[0]);

    expect(await screen.findByText("The lazily fetched Ivy story body.")).toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/universe/frank-ocean");

    // Second reader reuses the cache
    fireEvent.click(screen.getAllByLabelText("Close story")[0]);
    fireEvent.click(screen.getAllByLabelText("Read the story of Godspeed")[0]);
    expect(await screen.findByText("The Godspeed story body.")).toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("keeps working with full bubbles and no lazy source (backward compatible)", () => {
    render(
      <SongOdyssey
        bubbles={[
          {
            song_name: "Ivy",
            mood: "nostalgic",
            bubble_color: "#9A6B9A",
            story: "Inline story body already provided.",
          },
        ]}
      />
    );
    fireEvent.click(screen.getAllByLabelText("Read the story of Ivy")[0]);
    expect(screen.getAllByText("Inline story body already provided.").length).toBeGreaterThan(0);
  });

  it("shows a loading line while the story is in flight", async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise((resolve) => (resolveFetch = resolve)))
    );

    render(<SongOdyssey bubbles={posterMeta} lazyStoriesForArtist="frank-ocean" />);
    fireEvent.click(screen.getAllByLabelText("Read the story of Ivy")[0]);
    expect(screen.getAllByText(/Opening this song's story/).length).toBeGreaterThan(0);

    resolveFetch({
      ok: true,
      json: async () => ({ song_bubbles: [{ song_name: "Ivy", story: "Arrived." }] }),
    });
    await waitFor(() => expect(screen.queryByText(/Opening this song's story/)).toBeNull());
  });
});
