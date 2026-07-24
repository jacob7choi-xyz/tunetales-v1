import { NextResponse } from "next/server";
import { readArtists } from "@/app/lib/data";
import { toPublicArtist } from "@/app/lib/public/dto";

export async function GET(): Promise<NextResponse> {
  const artists = await readArtists();
  if (artists.status === "failed") {
    return NextResponse.json(
      { error: "Failed to load artists", errorId: artists.errorId },
      { status: 500 }
    );
  }
  if (artists.status === "missing") {
    // The registry is mandatory deployment content; its absence is a
    // server fault, not an empty catalog
    return NextResponse.json(
      { error: "Failed to load artists" },
      { status: 500 }
    );
  }
  return NextResponse.json(artists.data.map(toPublicArtist));
}
