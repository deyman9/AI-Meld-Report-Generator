import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { researchCompany, getCompanyOverview } from "@/lib/research";
import { validateApiKey, AIError } from "@/lib/ai";

/**
 * POST /api/test-research - Test company research endpoint
 * 
 * This is a temporary endpoint for testing research integration.
 * Remove before production deployment.
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate API key is configured
    if (!validateApiKey()) {
      return NextResponse.json(
        { 
          success: false, 
          error: "ANTHROPIC_API_KEY is not configured" 
        },
        { status: 500 }
      );
    }

    // Get request body
    const body = await request.json();
    const companyName = body.companyName as string;
    const context = body.context as string | undefined;
    const mode = body.mode as "full" | "overview" | undefined;

    if (!companyName) {
      return NextResponse.json(
        { success: false, error: "companyName is required" },
        { status: 400 }
      );
    }

    console.log(`Testing company research for: ${companyName}`);
    const startTime = Date.now();

    let result: unknown;

    if (mode === "overview") {
      // Get simple overview
      const overview = await getCompanyOverview(companyName, context);
      result = { overview };
    } else {
      // Get full research
      const research = await researchCompany(companyName, context);
      result = research;
    }

    const duration = Date.now() - startTime;
    console.log(`Company research completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        duration,
        companyName,
        mode: mode || "full",
      },
    });
  } catch (error) {
    console.error("Research test error:", error);

    if (error instanceof AIError) {
      return NextResponse.json(
        {
          success: false,
          error: error.getUserMessage(),
          details: {
            type: error.type,
            retryable: error.retryable,
          },
        },
        { status: error.type === "rate_limit" ? 429 : 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/test-research - Get research module status
 */
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiKeyConfigured = validateApiKey();

    return NextResponse.json({
      success: true,
      data: {
        apiKeyConfigured,
        message: apiKeyConfigured
          ? "Research module is ready. POST with { companyName: string, context?: string, mode?: 'full' | 'overview' }"
          : "ANTHROPIC_API_KEY is not set",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

