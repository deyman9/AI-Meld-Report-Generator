import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/db/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/engagements/[id] - Get single engagement
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

    const engagement = await prisma.engagement.findUnique({
      where: { id },
      include: {
        generatedReports: {
          orderBy: { version: "desc" },
        },
      },
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

    return NextResponse.json({
      success: true,
      data: engagement,
    });
  } catch (error) {
    console.error("Error fetching engagement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch engagement" },
      { status: 500 }
    );
  }
}

// PATCH /api/engagements/[id] - Update engagement
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify ownership first
    const existing = await prisma.engagement.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Engagement not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { voiceTranscript, status, companyName, valuationDate, errorMessage } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (voiceTranscript !== undefined) {
      updateData.voiceTranscript = voiceTranscript;
    }

    if (status !== undefined) {
      if (!["DRAFT", "PROCESSING", "COMPLETE", "ERROR"].includes(status)) {
        return NextResponse.json(
          { success: false, error: "Invalid status" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (companyName !== undefined) {
      updateData.companyName = companyName;
    }

    if (valuationDate !== undefined) {
      updateData.valuationDate = valuationDate ? new Date(valuationDate) : null;
    }

    if (errorMessage !== undefined) {
      updateData.errorMessage = errorMessage;
    }

    const engagement = await prisma.engagement.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: engagement,
    });
  } catch (error) {
    console.error("Error updating engagement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update engagement" },
      { status: 500 }
    );
  }
}

// DELETE /api/engagements/[id] - Delete engagement
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify ownership first
    const existing = await prisma.engagement.findUnique({
      where: { id },
      select: { userId: true, modelFilePath: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Engagement not found" },
        { status: 404 }
      );
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete engagement (cascades to generated reports)
    await prisma.engagement.delete({
      where: { id },
    });

    // TODO: Clean up associated files (model, reports)

    return NextResponse.json({
      success: true,
      message: "Engagement deleted",
    });
  } catch (error) {
    console.error("Error deleting engagement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete engagement" },
      { status: 500 }
    );
  }
}

