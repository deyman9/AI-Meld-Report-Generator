import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fix economic outlook paths
    const outlooks = await prisma.economicOutlook.findMany();
    const fixedOutlooks: string[] = [];

    for (const outlook of outlooks) {
      // Remove leading tab characters and fix double path issues
      let cleanPath = outlook.filePath.trim().replace(/^\t+/, '');
      
      // Fix paths like "\t/app/uploads/..." -> "/app/uploads/..."
      // Also fix paths that might have become "/app/\t/app/..."
      cleanPath = cleanPath.replace(/\/app\/\t\/app\//, '/app/');
      
      if (cleanPath !== outlook.filePath) {
        await prisma.economicOutlook.update({
          where: { id: outlook.id },
          data: { filePath: cleanPath },
        });
        fixedOutlooks.push(`${outlook.id}: "${outlook.filePath}" -> "${cleanPath}"`);
      }
    }

    // Fix engagement model paths
    const engagements = await prisma.engagement.findMany({
      where: { modelFilePath: { not: null } },
    });
    const fixedEngagements: string[] = [];

    for (const engagement of engagements) {
      if (!engagement.modelFilePath) continue;
      
      let cleanPath = engagement.modelFilePath.trim().replace(/^\t+/, '');
      cleanPath = cleanPath.replace(/\/app\/\t\/app\//, '/app/');
      
      if (cleanPath !== engagement.modelFilePath) {
        await prisma.engagement.update({
          where: { id: engagement.id },
          data: { modelFilePath: cleanPath },
        });
        fixedEngagements.push(`${engagement.id}: "${engagement.modelFilePath}" -> "${cleanPath}"`);
      }
    }

    return NextResponse.json({
      success: true,
      fixedOutlooks,
      fixedEngagements,
      message: fixedOutlooks.length + fixedEngagements.length > 0 
        ? "Paths fixed! Please re-upload files if they still don't work." 
        : "No paths needed fixing.",
    });
  } catch (error) {
    console.error("Fix paths error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

