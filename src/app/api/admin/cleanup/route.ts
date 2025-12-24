import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { cleanupExpiredFiles } from "@/lib/storage/cleanup";

// POST /api/admin/cleanup - Run cleanup job
export async function POST() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log(`Cleanup triggered by user ${session.user.email}`);
    
    const result = await cleanupExpiredFiles();

    return NextResponse.json({
      success: true,
      data: {
        engagementsDeleted: result.engagementsDeleted,
        reportsDeleted: result.reportsDeleted,
        filesDeleted: result.filesDeleted,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error("Error running cleanup:", error);
    return NextResponse.json(
      { success: false, error: "Failed to run cleanup" },
      { status: 500 }
    );
  }
}

// GET /api/admin/cleanup - Get cleanup status
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Just return info about what would be cleaned
    // We could add more detailed stats here in the future
    return NextResponse.json({
      success: true,
      message: "Use POST to trigger cleanup",
    });
  } catch (error) {
    console.error("Error fetching cleanup status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch cleanup status" },
      { status: 500 }
    );
  }
}

