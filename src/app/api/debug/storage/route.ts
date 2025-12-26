import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { existsSync, readdirSync } from "fs";
import { STORAGE_DIRS } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check storage directories
    const storageCheck: Record<string, { exists: boolean; files: string[] }> = {};
    
    for (const [name, path] of Object.entries(STORAGE_DIRS)) {
      if (existsSync(path)) {
        try {
          const files = readdirSync(path);
          storageCheck[name] = { exists: true, files };
        } catch {
          storageCheck[name] = { exists: true, files: ["[error reading]"] };
        }
      } else {
        storageCheck[name] = { exists: false, files: [] };
      }
    }

    // Check economic outlooks in database
    const outlooks = await prisma.economicOutlook.findMany({
      select: {
        id: true,
        quarter: true,
        year: true,
        filePath: true,
      },
    });

    // Check if outlook files exist
    const outlookFileCheck = outlooks.map((o) => ({
      ...o,
      fileExists: existsSync(o.filePath),
    }));

    // Check recent engagements
    const engagements = await prisma.engagement.findMany({
      where: { userId: session.user.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        companyName: true,
        valuationDate: true,
        modelFilePath: true,
        selectedApproaches: true,
        status: true,
      },
    });

    // Check if engagement files exist
    const engagementFileCheck = engagements.map((e) => ({
      ...e,
      modelFileExists: e.modelFilePath ? existsSync(e.modelFilePath) : null,
      valuationQuarter: e.valuationDate
        ? `Q${Math.floor(new Date(e.valuationDate).getMonth() / 3) + 1} ${new Date(e.valuationDate).getFullYear()}`
        : null,
    }));

    return NextResponse.json({
      success: true,
      storage: storageCheck,
      economicOutlooks: outlookFileCheck,
      recentEngagements: engagementFileCheck,
      environment: {
        UPLOAD_BASE_PATH: process.env.UPLOAD_BASE_PATH || "./uploads (default)",
        NODE_ENV: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    console.error("Debug storage error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

