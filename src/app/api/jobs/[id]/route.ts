import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getJobStatus } from "@/lib/jobs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/jobs/[id] - Get job status
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const job = getJobStatus(id);

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    // Return job status
    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        engagementId: job.engagementId,
        status: job.status,
        stage: job.stage,
        progress: job.progress,
        message: job.message,
        createdAt: job.createdAt.toISOString(),
        startedAt: job.startedAt?.toISOString(),
        completedAt: job.completedAt?.toISOString(),
        error: job.error,
        warnings: job.warnings,
      },
    });
  } catch (error) {
    console.error("Error fetching job status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch job status" },
      { status: 500 }
    );
  }
}

