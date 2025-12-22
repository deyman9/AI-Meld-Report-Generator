import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import {
  createDocument,
  createHeading,
  createParagraph,
  createPlaceholder,
  createValuationSummaryTable,
  generateDocumentBuffer,
} from "@/lib/document/generator";
import type { DocumentOptions, ValuationSummaryData } from "@/types/document";

/**
 * GET /api/test-document - Generate a test document
 * 
 * This is a temporary endpoint for testing document generation.
 * Remove before production deployment.
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

    // Create test document options
    const options: DocumentOptions = {
      companyName: "Acme Corporation",
      valuationDate: new Date(),
      reportType: "FOUR09A",
      includeHeader: true,
      includeFooter: true,
    };

    // Create document sections
    const sections = [
      // Title
      createHeading("409A Valuation Report", 1),
      createParagraph("Acme Corporation", { bold: true, alignment: "center" }),
      createParagraph(`As of ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, { alignment: "center" }),

      // Company Overview
      createHeading("Company Overview", 2),
      createParagraph(
        "Acme Corporation is a technology company specializing in innovative software solutions. The Company was founded in 2018 and has grown to serve customers across multiple industries."
      ),
      createParagraph(
        "The Company's primary products include enterprise software platforms and cloud-based services. Acme has demonstrated strong revenue growth and maintains a solid competitive position in its target markets."
      ),

      // Missing data placeholder
      createPlaceholder("Additional company background information"),

      // Industry Overview
      createHeading("Industry Overview", 2),
      createParagraph(
        "The enterprise software industry continues to experience robust growth, driven by digital transformation initiatives across all sectors. According to industry reports, the market is expected to grow at a CAGR of 10-12% over the next five years."
      ),

      // Valuation Approaches
      createHeading("Valuation Analysis", 2),
      createHeading("Guideline Public Company Method", 3),
      createParagraph(
        "The Guideline Public Company Method was applied using a selection of publicly traded companies with similar business characteristics. Relevant valuation multiples were analyzed and applied to the Subject Company's financial metrics."
      ),

      // Test table
      createHeading("Valuation Summary", 2),
    ];

    // Add valuation summary table
    const summaryData: ValuationSummaryData = {
      approaches: [
        { name: "Guideline Public Company Method", indicatedValue: 50000000, weight: 0.4, weightedValue: 20000000 },
        { name: "Guideline Transaction Method", indicatedValue: 55000000, weight: 0.35, weightedValue: 19250000 },
        { name: "Discounted Cash Flow", indicatedValue: 48000000, weight: 0.25, weightedValue: 12000000 },
      ],
      concludedValue: 51250000,
      dlom: 0.15,
      finalValue: 43562500,
    };

    // Create the summary table (used for reference, can be added to sections)
    createValuationSummaryTable(summaryData);

    // Create document with table
    const doc = createDocument(options, sections);
    
    // Note: Tables need to be added to document sections differently
    // For this test, we'll create a simple document without the table
    const buffer = await generateDocumentBuffer(doc);

    // Return as downloadable file
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="test-document.docx"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Document generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

