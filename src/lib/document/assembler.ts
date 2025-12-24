/**
 * Report Section Assembler
 * Creates a clean Word document containing all generated sections
 * for easy copy/paste into existing templates
 */

import { Paragraph, Table } from "docx";
import {
  createDocument,
  createHeading,
  createParagraph,
  createPlaceholder,
  createFlaggedContent,
  generateDocumentBuffer,
  createTable,
} from "./generator";

type DocumentChild = Paragraph | Table;
import { addFootnotes } from "./footnotes";
import { STORAGE_DIRS, generateFileName, saveFile } from "@/lib/storage";
import type { Engagement } from "@prisma/client";
import type { ReportContent, Flag } from "@/types/generation";
import type { DocumentOptions, GeneratedDocument } from "@/types/document";

/**
 * Create a horizontal separator line
 */
function createSeparator(): Paragraph {
  return createParagraph("─".repeat(60), {
    spacing: { before: 400, after: 400 },
    alignment: "center",
  });
}

/**
 * Assemble a sections document with all generated content
 */
export async function assembleReport(
  content: ReportContent
): Promise<Buffer> {
  const docOptions: DocumentOptions = {
    companyName: content.companyName,
    valuationDate: content.valuationDate,
    reportType: content.reportType,
    includeHeader: false,
    includeFooter: true,
  };

  const sections: DocumentChild[] = [];

  // Header Section
  sections.push(...createHeaderSection(content));
  sections.push(createSeparator());

  // Company Overview
  sections.push(createHeading("COMPANY OVERVIEW", 1));
  sections.push(...createCompanySection(content));
  sections.push(createSeparator());

  // Industry Outlook
  sections.push(createHeading("INDUSTRY OUTLOOK", 1));
  sections.push(...createIndustrySection(content));
  sections.push(createSeparator());

  // Economic Outlook
  sections.push(createHeading("ECONOMIC OUTLOOK", 1));
  sections.push(...createEconomicSection(content));
  sections.push(createSeparator());

  // Valuation Analysis Sections
  for (const narrative of content.approachNarratives) {
    sections.push(createHeading(`VALUATION ANALYSIS - ${narrative.approachName.toUpperCase()}`, 1));
    sections.push(...createApproachSection(narrative));
    sections.push(createSeparator());
  }

  // Conclusion & Weighting
  sections.push(createHeading("CONCLUSION & WEIGHTING RATIONALE", 1));
  sections.push(...createConclusionSection(content));
  sections.push(createSeparator());

  // Flags & Review Notes
  sections.push(createHeading("FLAGS & REVIEW NOTES", 1));
  sections.push(...createFlagsSection(content.flags, content));

  // Create and return document
  const doc = createDocument(docOptions, sections);
  return await generateDocumentBuffer(doc);
}

/**
 * Create header section with metadata
 */
function createHeaderSection(content: ReportContent): DocumentChild[] {
  const sections: DocumentChild[] = [];
  const reportTypeLabel = content.reportType === "FOUR09A" ? "409A Valuation" : "Gift & Estate (59-60)";
  const dateStr = content.valuationDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const generatedStr = new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  sections.push(
    createParagraph("GENERATED REPORT SECTIONS", {
      bold: true,
      alignment: "center",
      spacing: { after: 400 },
    })
  );

  sections.push(createParagraph(`Company Name: ${content.companyName}`, { bold: true }));
  sections.push(createParagraph(`Valuation Date: ${dateStr}`));
  sections.push(createParagraph(`Report Type: ${reportTypeLabel}`));
  sections.push(createParagraph(`Generated: ${generatedStr}`, { spacing: { after: 200 } }));

  sections.push(
    createParagraph(
      "This document contains AI-generated sections for your valuation report. " +
      "Copy each section into your Word template as needed.",
      { italic: true, spacing: { before: 200, after: 200 } }
    )
  );

  return sections;
}

/**
 * Create company overview section
 */
function createCompanySection(content: ReportContent): DocumentChild[] {
  const sections: DocumentChild[] = [];

  if (content.companyOverview.content && !content.companyOverview.content.includes("not generated")) {
    const paragraphs = content.companyOverview.content.split("\n\n").filter((p) => p.trim());

    for (const para of paragraphs) {
      if (content.companyOverview.confidence < 0.6) {
        sections.push(createFlaggedContent(para, "Low confidence - verify this information"));
      } else {
        sections.push(createParagraph(para));
      }
    }
  } else {
    sections.push(createPlaceholder("Company overview could not be generated"));
  }

  return sections;
}

/**
 * Create industry outlook section with citations
 */
function createIndustrySection(content: ReportContent): DocumentChild[] {
  const sections: DocumentChild[] = [];

  if (content.industryOutlook.content && !content.industryOutlook.content.includes("not generated")) {
    const { content: footnotedContent, footnotes } = addFootnotes(
      content.industryOutlook.content,
      content.industryCitations
    );

    const paragraphs = footnotedContent.split("\n\n").filter((p) => p.trim());

    for (const para of paragraphs) {
      if (para.startsWith("**") && para.endsWith("**")) {
        sections.push(createHeading(para.replace(/\*\*/g, ""), 2));
      } else if (para.startsWith("•") || para.startsWith("-")) {
        sections.push(createParagraph(para, { indent: { left: 720 } }));
      } else {
        sections.push(createParagraph(para));
      }
    }

    // Add footnotes at end of section
    if (footnotes.length > 0) {
      sections.push(createParagraph("", { spacing: { before: 300 } }));
      sections.push(createParagraph("Sources:", { bold: true, spacing: { after: 100 } }));
      for (const footnote of footnotes) {
        sections.push(createParagraph(footnote, { spacing: { after: 50 } }));
      }
    }
  } else {
    sections.push(createPlaceholder("Industry outlook could not be generated"));
  }

  return sections;
}

/**
 * Create economic outlook section
 */
function createEconomicSection(content: ReportContent): DocumentChild[] {
  const sections: DocumentChild[] = [];

  if (content.economicOutlook.content && !content.economicOutlook.content.includes("not loaded")) {
    const paragraphs = content.economicOutlook.content.split("\n\n").filter((p) => p.trim());

    for (const para of paragraphs) {
      sections.push(createParagraph(para));
    }
  } else {
    sections.push(createPlaceholder("Economic outlook not loaded - check quarterly outlook documents"));
  }

  return sections;
}

/**
 * Create valuation approach section
 */
function createApproachSection(narrative: { approachName: string; narrative: string; confidence: string }): DocumentChild[] {
  const sections: DocumentChild[] = [];

  const paragraphs = narrative.narrative.split("\n\n").filter((p) => p.trim());

  for (const para of paragraphs) {
    if (narrative.confidence === "low") {
      sections.push(createFlaggedContent(para, "Low confidence - review carefully"));
    } else {
      sections.push(createParagraph(para));
    }
  }

  if (paragraphs.length === 0) {
    sections.push(createPlaceholder(`${narrative.approachName} narrative could not be generated`));
  }

  return sections;
}

/**
 * Create conclusion section with weighting table
 */
function createConclusionSection(content: ReportContent): DocumentChild[] {
  const sections: DocumentChild[] = [];

  // Create weighting table
  if (content.approachNarratives.length > 0) {
    sections.push(createParagraph("Valuation Summary:", { bold: true, spacing: { after: 200 } }));
    
    // Build table data
    const tableData = {
      headers: ["Approach", "Indicated Value", "Weight"],
      rows: content.approachNarratives.map(n => ({
        cells: [
          { content: n.approachName },
          { content: "[Value from model]", alignment: "right" as const },
          { content: "[Weight from model]", alignment: "right" as const }
        ]
      })),
      headerStyle: "bold" as const,
    };
    
    sections.push(createTable(tableData));
    sections.push(createParagraph("", { spacing: { before: 200 } }));
  }

  // Conclusion narrative
  if (content.conclusion.content && !content.conclusion.content.includes("FAILED")) {
    const paragraphs = content.conclusion.content.split("\n\n").filter((p) => p.trim());

    for (const para of paragraphs) {
      sections.push(createParagraph(para));
    }
  } else {
    sections.push(createPlaceholder("Conclusion narrative could not be generated"));
  }

  return sections;
}

/**
 * Create flags and review notes section
 */
function createFlagsSection(flags: Flag[], content: ReportContent): DocumentChild[] {
  const sections: DocumentChild[] = [];

  // Collect all items needing review
  const reviewItems: string[] = [];

  // Add explicit flags
  for (const flag of flags) {
    const prefix = flag.type === "error" ? "❌" : flag.type === "missing" ? "⚠️" : "📝";
    reviewItems.push(`${prefix} ${flag.section}: ${flag.message}`);
  }

  // Add missing data warnings
  if (!content.companyName || content.companyName === "Unknown Company") {
    reviewItems.push("⚠️ Company name not found - verify and update");
  }
  
  if (content.companyOverview.confidence < 0.7) {
    reviewItems.push("📝 Company Overview: Low confidence in AI research - verify facts");
  }

  if (content.industryOutlook.confidence < 0.7) {
    reviewItems.push("📝 Industry Outlook: Review citations and verify current");
  }

  if (content.economicOutlook.content?.includes("not loaded")) {
    reviewItems.push("⚠️ Economic Outlook: Quarterly document not found");
  }

  // Display items
  if (reviewItems.length > 0) {
    sections.push(
      createParagraph(
        "The following items were flagged for review:",
        { bold: true, spacing: { after: 200 } }
      )
    );

    for (const item of reviewItems) {
      sections.push(
        createParagraph(item, {
          indent: { left: 360 },
          spacing: { after: 100 },
        })
      );
    }
  } else {
    sections.push(
      createParagraph("No items flagged for review.", { italic: true })
    );
  }

  return sections;
}

/**
 * Save generated report to storage
 */
export async function saveReport(
  buffer: Buffer,
  engagement: Engagement
): Promise<string> {
  const companyName = (engagement.companyName || "Company").replace(/[^a-zA-Z0-9 ]/g, "");
  const reportType = engagement.reportType === "FOUR09A" ? "409A" : "59-60";
  const dateStr = engagement.valuationDate
    ? new Date(engagement.valuationDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const baseName = `${companyName} - ${reportType} - ${dateStr} - SECTIONS.docx`;
  const fileName = generateFileName(baseName, "report");

  const filePath = await saveFile(buffer, STORAGE_DIRS.reports, fileName);

  return filePath;
}

/**
 * Generate complete sections document
 */
export async function generateReport(
  content: ReportContent
): Promise<GeneratedDocument> {
  const buffer = await assembleReport(content);

  const companyName = (content.companyName || "Company").replace(/[^a-zA-Z0-9 ]/g, "");
  const reportType = content.reportType === "FOUR09A" ? "409A" : "59-60";
  const dateStr = content.valuationDate.toISOString().split("T")[0];
  const filename = `${companyName} - ${reportType} - ${dateStr} - SECTIONS.docx`;

  return {
    buffer,
    filename,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: buffer.length,
  };
}
