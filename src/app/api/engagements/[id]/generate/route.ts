import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { queueGenerationJob } from "@/lib/jobs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/engagements/[id]/generate - Trigger report generation
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch engagement
    const engagement = await prisma.engagement.findUnique({
      where: { id },
    });

    if (!engagement) {
      return NextResponse.json(
        { success: false, error: "Engagement not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (engagement.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if already processing
    if (engagement.status === "PROCESSING") {
      return NextResponse.json(
        { success: false, error: "Report is already being generated" },
        { status: 400 }
      );
    }

    // Check required data
    if (!engagement.modelFilePath) {
      return NextResponse.json(
        { success: false, error: "No model file uploaded" },
        { status: 400 }
      );
    }

    // Update status to PROCESSING
    await prisma.engagement.update({
      where: { id },
      data: {
        status: "PROCESSING",
        errorMessage: null,
      },
    });

    // Queue the generation job (runs in background)
    console.log(`Queueing report generation for engagement ${id}`);
    const jobId = queueGenerationJob(id);

    // Return immediately with job ID for polling
    return NextResponse.json({
      success: true,
      message: "Report generation started",
      data: {
        engagementId: id,
        jobId,
        status: "PROCESSING",
      },
    });
  } catch (error) {
    console.error("Error starting generation:", error);
    
    // Try to update status to error
    try {
      const { id } = await params;
      await prisma.engagement.update({
        where: { id },
        data: {
          status: "ERROR",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        },
      });
    } catch (statusError) {
      console.error("Failed to update engagement status:", statusError);
    }

    return NextResponse.json(
      { success: false, error: "Failed to start report generation" },
      { status: 500 }
    );
  }
}
