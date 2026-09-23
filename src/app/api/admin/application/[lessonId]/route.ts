// src/app/api/admin/application/[lessonId]/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { putPublicBlob } from "@/lib/blob";

export async function POST(
  req: Request,
  ctx: {
    params: Promise<{
      lessonId: string;
    }>;
  }
) {
  try {
    const { lessonId } =
      await ctx.params;

    const formData =
      await req.formData();

    const instruction =
      String(
        formData.get("instruction") ?? ""
      );

    const requirements =
      String(
        formData.get("requirements") ?? ""
      );

    const scenario =
      String(
        formData.get("scenario") ?? ""
      );

    const focusAreas =
      formData
        .getAll("focusAreas")
        .map((f) => String(f))
        .filter(
          (f) => f.trim() !== ""
        );

    let chartImageUrl:
      | string
      | undefined;

    const chart =
      formData.get("chart") as
        | File
        | null;

    // =========================
    // CHART UPLOAD
    // =========================

    if (
      chart &&
      chart.size > 0
    ) {
      const uploaded = await putPublicBlob("application-charts", chart);
      chartImageUrl = uploaded.url;
    }

    const existing =
      await prisma.application.findUnique(
        {
          where: {
            lessonId,
          },
        }
      );

    const application =
      await prisma.application.upsert(
        {
          where: {
            lessonId,
          },

          update: {
            instruction,
            requirements,
            scenario,
            focusAreas,

            ...(chartImageUrl && {
              chartImageUrl,
            }),
          },

          create: {
            lessonId,
            instruction,
            requirements,
            scenario,
            focusAreas,
            chartImageUrl,
          },
        }
      );

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to save application",
      },
      {
        status: 500,
      }
    );
  }
}
