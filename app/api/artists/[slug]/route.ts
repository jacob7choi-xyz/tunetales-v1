import { NextResponse } from "next/server";
import { readArtists, readArtistStory } from "@/app/lib/data";
import { toPublicArtist, toPublicStory } from "@/app/lib/public/dto";
import { SLUG_PATTERN } from "@/app/lib/tokens";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const artists = await readArtists();
  if (artists.status === "missing") {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }
  if (artists.status === "failed") {
    return NextResponse.json(
      { error: "Failed to load artist", errorId: artists.errorId },
      { status: 500 }
    );
  }

  const artist = artists.data.find((a) => a.id === slug);
  if (!artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  const story = await readArtistStory(slug);
  if (story.status === "failed") {
    // Corruption of an existing story is a server fault, never a 404
    return NextResponse.json(
      { error: "Failed to load artist", errorId: story.errorId },
      { status: 500 }
    );
  }

  return NextResponse.json({
    artist: toPublicArtist(artist),
    story: story.status === "available" ? toPublicStory(story.data) : null,
  });
}
