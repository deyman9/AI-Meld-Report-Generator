import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

// GET /api/engagements - List user's engagements
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const engagements = await prisma.engagement.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        companyName: true,
        valuationDate: true,
        reportType: true,
        status: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
        expiresAt: true,
        generatedReports: {
          select: {
            id: true,
            version: true,
            createdAt: true,
          },
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: engagements,
    });
  } catch (error) {
    console.error("Error fetching engagements:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch engagements" },
      { status: 500 }
    );
  }
}

// POST /api/engagements - Create new engagement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reportType, modelFilePath, qualitativeContext, companyName, valuationDate, selectedApproaches } = body;

    // Validate required fields
    if (!reportType || !modelFilePath) {
      return NextResponse.json(
        { success: false, error: "Report type and model file are required" },
        { status: 400 }
      );
    }

    // Validate selectedApproaches if provided
    if (selectedApproaches) {
      const hasValidApproach = 
        selectedApproaches.guidelinePublicCompany || 
        selectedApproaches.guidelineTransaction || 
        selectedApproaches.incomeApproach;
      
      if (!hasValidApproach) {
        return NextResponse.json(
          { success: false, error: "At least one valuation approach must be selected" },
          { status: 400 }
        );
      }
    }

    // Validate report type
    if (!["FOUR09A", "FIFTY_NINE_SIXTY"].includes(reportType)) {
      return NextResponse.json(
        { success: false, error: "Invalid report type" },
        { status: 400 }
      );
    }

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Parse valuation date if provided
    let parsedValuationDate: Date | null = null;
    if (valuationDate) {
      parsedValuationDate = new Date(valuationDate);
      if (isNaN(parsedValuationDate.getTime())) {
        parsedValuationDate = null;
      }
    }

    // Create engagement
    const engagement = await prisma.engagement.create({
      data: {
        userId: session.user.id,
        reportType,
        modelFilePath,
        qualitativeContext: qualitativeContext || null,
        companyName: companyName || null,
        valuationDate: parsedValuationDate,
        selectedApproaches: selectedApproaches || null,
        status: "DRAFT",
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      data: engagement,
    });
  } catch (error) {
    console.error("Error creating engagement:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create engagement" },
      { status: 500 }
    );
  }
}

