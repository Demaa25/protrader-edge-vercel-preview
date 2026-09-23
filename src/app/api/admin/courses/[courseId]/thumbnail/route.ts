// src/app/api/admin/courses/[courseId]/thumbnail/route.ts

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { putPublicBlob } from "@/lib/blob";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      courseId: string;
    }>;
  }
) {
  try {
    const { courseId } =
      await params;

    // =========================
    // FORM DATA
    // =========================

    const formData =
      await req.formData();

    const file =
      formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        {
          error:
            "No valid file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    const image = new File([await file.arrayBuffer()], (file as File).name || "thumbnail", {
      type: file.type || "application/octet-stream",
    });
    const uploaded = await putPublicBlob("course-thumbnails", image);
    const url = uploaded.url;

    // =========================
    // UPDATE DATABASE
    // =========================

    await prisma.course.update({
      where: {
        id: courseId,
      },

      data: {
        thumbnailUrl: url,
      },
    });

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (e: any) {
    console.error(
      "THUMBNAIL_UPLOAD_ERROR",
      e
    );

    return NextResponse.json(
      {
        error:
          e?.message ||
          "Upload failed",
      },
      {
        status: 500,
      }
    );
  }
}
