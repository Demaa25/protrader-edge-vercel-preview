// src/app/api/progress/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { lessonId } = await req.json();

  const userId = (session.user as any).id as string;

  // ✅ GET APPLICATION RESULT
  const application = await prisma.applicationSubmission.findFirst({
    where: {
      userId,
      application: {
        lessonId,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const applicationPassed = application?.passed === true;
  const completed = applicationPassed;
  const progress = applicationPassed ? 100 : 0;

  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: { userId, lessonId },
    },
    update: {
      completed,
      progress,
    },
    create: {
      userId,
      lessonId,
      completed,
      progress,
    },
  });

  return NextResponse.json({
    completed,
    progress,
  });
}
