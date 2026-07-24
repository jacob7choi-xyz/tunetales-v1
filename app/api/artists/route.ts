import { NextResponse } from "next/server";
import { getArtists } from "@/app/lib/data";
import { toPublicArtist } from "@/app/lib/public/dto";

export async function GET(): Promise<NextResponse> {
  try {
    const artists = await getArtists();
    return NextResponse.json(artists.map(toPublicArtist));
  } catch {
    return NextResponse.json(
      { error: "Failed to load artists" },
      { status: 500 }
    );
  }
}
