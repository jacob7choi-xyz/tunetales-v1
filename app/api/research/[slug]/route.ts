import { NextResponse } from "next/server";
import { getResearchFiles } from "@/app/lib/data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;
  const research = await getResearchFiles(slug);

  if (research.length === 0) {
    return NextResponse.json(
      { error: "No research found for this artist" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    artist: slug,
    fileCount: research.length,
    research,
  });
}
