import { NextResponse } from "next/server";
import { readArtists } from "@/app/lib/data";
import { toPublicArtist } from "@/app/lib/public/dto";

export async function GET(): Promise<NextResponse> {
  // A missing registry file surfaces as failed with an errorId inside
  // readArtists (mandatory deployment content), so any non-available
  // state here is a server fault
  const artists = await readArtists();
  if (artists.status !== "available") {
    return NextResponse.json(
      {
        error: "Failed to load artists",
        ...(artists.status === "failed" ? { errorId: artists.errorId } : {}),
      },
      { status: 500 }
    );
  }
  return NextResponse.json(artists.data.map(toPublicArtist));
}
