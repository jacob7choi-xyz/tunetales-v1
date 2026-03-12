import { NextResponse } from "next/server";
import { getArtists, getArtistStory } from "@/app/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  const artists = await getArtists();
  const artist = artists.find((a) => a.id === slug);

  if (!artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  const story = await getArtistStory(slug);

  return NextResponse.json({ artist, story });
}
