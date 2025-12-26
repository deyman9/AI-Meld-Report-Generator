import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import mammoth from "mammoth";
import { generateWithPDF } from "@/lib/ai/generateWithPDF";
import { VALUATION_SYSTEM_PROMPT } from "@/lib/ai/prompts/approachPrompts";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results: Record<string, unknown> = {};

    // Test 1: Check economic outlook file reading
    console.log("=== TEST 1: Economic Outlook ===");
    const outlook = await prisma.economicOutlook.findFirst({
      where: { quarter: 2, year: 2025 },
    });

    if (outlook) {
      results.economicOutlook = { found: true, path: outlook.filePath };
      
      const absolutePath = resolve(outlook.filePath);
      results.economicOutlook = { 
        ...results.economicOutlook as object, 
        absolutePath,
        exists: existsSync(absolutePath),
        existsRelative: existsSync(outlook.filePath),
      };

      // Try to read the file
      try {
        const pathToUse = existsSync(outlook.filePath) ? outlook.filePath : absolutePath;
        const buffer = readFileSync(pathToUse);
        results.economicOutlook = { 
          ...results.economicOutlook as object, 
          bufferSize: buffer.length,
        };

        // Try mammoth extraction
        const mammothResult = await mammoth.extractRawText({ buffer });
        results.economicOutlook = { 
          ...results.economicOutlook as object, 
          textLength: mammothResult.value.length,
          textPreview: mammothResult.value.substring(0, 200) + "...",
        };
      } catch (readError) {
        results.economicOutlook = { 
          ...results.economicOutlook as object, 
          readError: readError instanceof Error ? readError.message : String(readError),
        };
      }
    } else {
      results.economicOutlook = { found: false };
    }

    // Test 2: Check most recent engagement PDF
    console.log("=== TEST 2: PDF File ===");
    const engagement = await prisma.engagement.findFirst({
      where: { 
        userId: session.user.id,
        modelFilePath: { not: null },
      },
      orderBy: { createdAt: "desc" },
    });

    if (engagement?.modelFilePath) {
      const pdfPath = engagement.modelFilePath;
      const absolutePdfPath = resolve(pdfPath);
      
      results.pdfFile = {
        path: pdfPath,
        absolutePath: absolutePdfPath,
        exists: existsSync(pdfPath),
        existsAbsolute: existsSync(absolutePdfPath),
      };

      // Try to read PDF and call Claude
      const pathToUse = existsSync(pdfPath) ? pdfPath : absolutePdfPath;
      
      if (existsSync(pathToUse) && pathToUse.toLowerCase().endsWith('.pdf')) {
        try {
          const pdfBuffer = readFileSync(pathToUse);
          results.pdfFile = { 
            ...results.pdfFile as object, 
            bufferSize: pdfBuffer.length,
          };

          // Try a simple Claude call with the PDF
          console.log("Attempting Claude API call with PDF...");
          const response = await generateWithPDF(
            pathToUse,
            VALUATION_SYSTEM_PROMPT,
            "In 2-3 sentences, identify the subject company name and valuation date from this document.",
            undefined
          );
          
          results.pdfFile = { 
            ...results.pdfFile as object, 
            claudeResponse: response.substring(0, 500),
            success: true,
          };
        } catch (pdfError) {
          console.error("PDF test error:", pdfError);
          results.pdfFile = { 
            ...results.pdfFile as object, 
            error: pdfError instanceof Error ? pdfError.message : String(pdfError),
            stack: pdfError instanceof Error ? pdfError.stack : undefined,
          };
        }
      }
    } else {
      results.pdfFile = { found: false };
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Test generation error:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

