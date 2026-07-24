import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import {
  SceneEnterButton,
  SceneOverlayProvider,
  OVERLAY_ROOT_ID,
} from "@/app/artists/frank-ocean/cinema/SceneOverlay";

vi.mock("framer-motion", async () => await import("../helpers/framer-motion-mock"));

// JourneyClient is irrelevant to the overlay contract under test
vi.mock("next/dynamic", () => ({
  default: () => {
    const Noop = () => <div data-testid="journey-client" />;
    return Noop;
  },
}));

const story = {
  schemaVersion: 2,
  title: "Story",
  artistSlug: "frank-ocean",
  chapters: [
    {
      id: "origins",
      order: 1,
      title: "CHAPTER ONE",
      content: "Content",
      ambience: { mood: "nostalgic", accentHsl: "260, 70%, 55%", spotifyTrackId: null },
    },
  ],
};

function Harness() {
  return (
    <div data-cinema-root="">
      <SceneOverlayProvider storyApiPath="/api/artists/frank-ocean">
        <SceneEnterButton chapterIndex={0} ariaLabel="Enter chapter 1: CHAPTER ONE">
          Enter this chapter
        </SceneEnterButton>
      </SceneOverlayProvider>
    </div>
  );
}

beforeEach(() => {
  const overlayRoot = document.createElement("div");
  overlayRoot.id = OVERLAY_ROOT_ID;
  document.body.appendChild(overlayRoot);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok: true, json: async () => ({ story }) }))
  );
});

afterEach(() => {
  cleanup();
  document.getElementById(OVERLAY_ROOT_ID)?.remove();
  vi.unstubAllGlobals();
});

describe("SceneOverlay (S6/S6a contract)", () => {
  it("opens a dialog portaled OUTSIDE the cinema root and inerts only the root", async () => {
    const { container } = render(<Harness />);
    const cinemaRoot = container.querySelector("[data-cinema-root]") as HTMLElement;

    fireEvent.click(screen.getByLabelText("Enter chapter 1: CHAPTER ONE"));

    const dialog = await screen.findByRole("dialog");
    // S6a topology: the dialog is NOT a descendant of the inert subtree
    expect(cinemaRoot.contains(dialog)).toBe(false);
    expect(document.getElementById(OVERLAY_ROOT_ID)!.contains(dialog)).toBe(true);
    expect(cinemaRoot.hasAttribute("inert")).toBe(true);
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });

  it("moves focus to Close on open; Close stays enabled while background is inert", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByLabelText("Enter chapter 1: CHAPTER ONE"));

    const close = await screen.findByLabelText("Close the journey");
    expect((close as HTMLButtonElement).disabled).toBe(false);
    await waitFor(() => expect(document.activeElement).toBe(close));
  });

  it("lazily fetches the story once and renders the journey", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByLabelText("Enter chapter 1: CHAPTER ONE"));

    await screen.findByTestId("journey-client");
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("/api/artists/frank-ocean");

    // Re-open: cached, no second fetch
    fireEvent.click(screen.getByLabelText("Close the journey"));
    fireEvent.click(screen.getByLabelText("Enter chapter 1: CHAPTER ONE"));
    await screen.findByTestId("journey-client");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("Escape closes, un-inerts the root, and restores focus to the trigger", async () => {
    const { container } = render(<Harness />);
    const cinemaRoot = container.querySelector("[data-cinema-root]") as HTMLElement;
    const trigger = screen.getByLabelText("Enter chapter 1: CHAPTER ONE");

    fireEvent.click(trigger);
    await screen.findByRole("dialog");

    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(cinemaRoot.hasAttribute("inert")).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it("degrades quietly when the story fetch fails and allows retry", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, json: async () => ({}) }))
    );
    render(<Harness />);
    fireEvent.click(screen.getByLabelText("Enter chapter 1: CHAPTER ONE"));

    // Failed fetch closes the overlay instead of trapping the user
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    // Retry is permitted: a second open attempts the fetch again
    fireEvent.click(screen.getByLabelText("Enter chapter 1: CHAPTER ONE"));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  });
});
