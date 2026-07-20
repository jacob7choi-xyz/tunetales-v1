import { NextResponse } from "next/server";
import { getResearchFiles } from "@/app/lib/data";
import { SLUG_PATTERN } from "@/app/lib/tokens";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    const research = await getResearchFiles(slug);

    // Provider and cost details are internal; never expose them publicly
    const sanitized = research.map((file) => ({
      ...file,
      metadata: {
        ...file.metadata,
        model_used: undefined,
        cost_estimate: undefined,
      },
      response: {
        ...file.response,
        model: undefined,
      },
    }));

    return NextResponse.json({
      artist: slug,
      fileCount: sanitized.length,
      research: sanitized,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load research" },
      { status: 500 }
    );
  }
}
