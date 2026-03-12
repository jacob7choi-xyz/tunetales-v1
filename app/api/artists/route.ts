import { NextResponse } from "next/server";
import { getArtists } from "@/app/lib/data";

export async function GET(): Promise<NextResponse> {
  const artists = await getArtists();
  return NextResponse.json(artists);
}
