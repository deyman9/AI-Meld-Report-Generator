import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { generateText, validateApiKey, AIError } from "@/lib/ai";
import { VALUATION_SYSTEM_PROMPT, buildTestPrompt } from "@/lib/ai/prompts";

/**
 * POST /api/test-ai - Test AI generation endpoint
 * 
 * This is a temporary endpoint for testing AI integration.
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

    // Get optional prompt from request body
    const body = await request.json().catch(() => ({}));
    const customPrompt = body.prompt as string | undefined;
    const topic = body.topic as string | undefined;

    // Build prompt
    const prompt = customPrompt || buildTestPrompt(topic || "market approach valuation");

    console.log("Testing AI generation with prompt:", prompt.substring(0, 100) + "...");

    // Generate response
    const startTime = Date.now();
    const response = await generateText(prompt, {
      systemPrompt: VALUATION_SYSTEM_PROMPT,
      maxTokens: 1024,
      temperature: 0.7,
    });
    const duration = Date.now() - startTime;

    console.log(`AI generation completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: {
        response,
        duration,
        promptLength: prompt.length,
        responseLength: response.length,
      },
    });
  } catch (error) {
    console.error("AI test error:", error);

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
 * GET /api/test-ai - Check AI configuration status
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
          ? "AI service is configured and ready"
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

