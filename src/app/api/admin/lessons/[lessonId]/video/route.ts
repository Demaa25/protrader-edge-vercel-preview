// src/app/api/admin/lessons/[lessonId]/video/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";


export async function POST(
  req: Request,
  ctx: {
    params: Promise<{
      lessonId: string;
    }>;
  }
) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = (session.user as any)?.role;

    if (role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { lessonId } = await ctx.params;

    const body = await req.json();
    const url = typeof body.url === "string" ? body.url : "";
    const title = typeof body.title === "string" ? body.title : "";
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "";
    const sizeBytes = typeof body.sizeBytes === "number" ? body.sizeBytes : 0;

    if (!url || !title || !mimeType) {
      return NextResponse.json(
        { error: "Video upload details are required" },
        { status: 400 }
      );
    }

    if (!mimeType.startsWith("video/")) {
      return NextResponse.json(
        { error: "Invalid video format" },
        { status: 400 }
      );
    }

    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.endsWith(".public.blob.vercel-storage.com") || !parsedUrl.pathname.startsWith("/lesson-videos/")) {
      return NextResponse.json({ error: "Invalid upload URL" }, { status: 400 });
    }

    // ✅ determine next order
    const last = await prisma.lessonMaterial.findFirst({
      where: {
        lessonId,
      },

      orderBy: {
        order: "desc",
      },

      select: {
        order: true,
      },
    });

    // ✅ create DB record
    const material =
      await prisma.lessonMaterial.create({
        data: {
          lessonId,

          type: "VIDEO",

          title,

          url,

          order: (last?.order ?? 0) + 1,

          fileName: title,

          mimeType,

          sizeBytes,
        },
      });

    return NextResponse.json({
      success: true,
      material,
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Upload failed",
        details: String(e?.message || e),
      },
      { status: 500 }
    );
  }
}
