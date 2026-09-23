import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { publicBlobToken } from "@/lib/blob";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  // Vercel's signed completion callback has no browser session. Only the token
  // generation request needs our user/role check.
  if (body.type === "blob.generate-client-token") {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const response = await handleUpload({
      body,
      request,
      token: publicBlobToken(),
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("lesson-videos/")) throw new Error("Invalid upload path");
        return {
          allowedContentTypes: ["video/*"],
          addRandomSuffix: true,
          maximumSizeInBytes: 5 * 1024 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not authorize upload" },
      { status: 400 }
    );
  }
}
