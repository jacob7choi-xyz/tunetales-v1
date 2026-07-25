import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { TRACK_IDS } from "@/app/lib/tracks";

// The song a chapter ends on is an editorial decision, and it drifted once:
// the chapters were populated in a bulk schema migration with IDs sourced
// outside app/lib/tracks.ts, so four of six pointed at a different release
// of the right song than the discography played. These tests pin the
// registry as the single source of truth for every embed on the site.

interface Chapter {
  id: string;
  order: number;
  title: string;
  ambience: { spotifyTrackId: string | null };
}

const story = JSON.parse(
  readFileSync(
    join(process.cwd(), "data/public/stories/frank-ocean.json"),
    "utf8"
  )
) as { chapters: Chapter[] };

const idToSong = new Map(
  Object.entries(TRACK_IDS).map(([song, id]) => [id, song])
);

describe("chapter song pairings", () => {
  it("plays only tracks from the verified registry", () => {
    for (const chapter of story.chapters) {
      const id = chapter.ambience.spotifyTrackId;
      if (id === null) continue;
      expect(
        idToSong.has(id),
        `chapter "${chapter.id}" uses track ${id}, which is not in app/lib/tracks.ts. ` +
          `Chapter embeds and the discography must serve the same release of a song.`
      ).toBe(true);
    }
  });

  it("pairs each chapter with the song its story earns", () => {
    // Locked deliberately, with the reason, so a future edit is a decision
    // rather than an accident:
    //   origins        the chapter text names Crack Rock as what his
    //                  grandfather's meetings inspired
    //   katrina        a car, water, and a road out, against a chapter
    //                  about a flooded studio and the drive west
    //   transformation the breakout that turned Christopher into Frank
    //   breakthrough   the confession released days after the letter
    //   boys_dont_cry  the track that opens the album the chapter is about
    //   legacy         the song most often named as his peak
    const intended: Record<string, string> = {
      origins: "Crack Rock",
      katrina: "Swim Good",
      transformation: "Novacane",
      breakthrough: "Bad Religion",
      boys_dont_cry: "Nikes",
      legacy: "Nights",
    };
    const actual = Object.fromEntries(
      story.chapters.map((c) => [
        c.id,
        c.ambience.spotifyTrackId
          ? idToSong.get(c.ambience.spotifyTrackId)
          : null,
      ])
    );
    expect(actual).toEqual(intended);
  });

  it("gives every chapter a song", () => {
    for (const chapter of story.chapters) {
      expect(
        chapter.ambience.spotifyTrackId,
        `chapter "${chapter.id}" has no song`
      ).not.toBeNull();
    }
  });
});
