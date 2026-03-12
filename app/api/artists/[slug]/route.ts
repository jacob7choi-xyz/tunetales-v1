import { NextResponse } from "next/server";
import { getArtists, getArtistStory } from "@/app/lib/data";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    const artists = await getArtists();
    const artist = artists.find((a) => a.id === slug);

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const story = await getArtistStory(slug);

    return NextResponse.json({ artist, story });
  } catch {
    return NextResponse.json(
      { error: "Failed to load artist" },
      { status: 500 }
    );
  }
}
