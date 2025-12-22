import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/db/prisma";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/engagements/[id]/download - Download generated report
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

    // Fetch engagement with latest generated report
    const engagement = await prisma.engagement.findUnique({
      where: { id },
      include: {
        generatedReports: {
          orderBy: { version: "desc" },
          take: 1,
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

    // Check status
    if (engagement.status !== "COMPLETE") {
      return NextResponse.json(
        { success: false, error: "Report is not ready for download" },
        { status: 400 }
      );
    }

    // Get latest report
    const report = engagement.generatedReports[0];
    if (!report) {
      return NextResponse.json(
        { success: false, error: "No generated report found" },
        { status: 404 }
      );
    }

    // Check if file exists
    if (!existsSync(report.filePath)) {
      return NextResponse.json(
        { success: false, error: "Report file not found" },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = await readFile(report.filePath);

    // Generate filename
    const companyName = engagement.companyName || "Company";
    const reportType = engagement.reportType === "FOUR09A" ? "409A" : "59-60";
    const valuationDate = engagement.valuationDate
      ? new Date(engagement.valuationDate).toISOString().split("T")[0]
      : "undated";
    const version = report.version;
    const filename = `${companyName} - ${reportType} - ${valuationDate} - DRAFT_v${version}.docx`;

    // Return file for download
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to download report" },
      { status: 500 }
    );
  }
}

