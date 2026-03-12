import { NextResponse } from "next/server";
import { getArtists } from "@/app/lib/data";

export async function GET(): Promise<NextResponse> {
  try {
    const artists = await getArtists();
    return NextResponse.json(artists);
  } catch {
    return NextResponse.json(
      { error: "Failed to load artists" },
      { status: 500 }
    );
  }
}
