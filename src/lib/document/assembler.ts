/**
 * Report Assembler
 * Assembles final report document from template and generated content
 */

import { Paragraph } from "docx";
import {
  createDocument,
  createHeading,
  createParagraph,
  createPlaceholder,
  createFlaggedContent,
  createCapTablePlaceholder,
  createPageBreak,
  generateDocumentBuffer,
} from "./generator";
import { buildReportData } from "./placeholders";
import { addFootnotes } from "./footnotes";
import { STORAGE_DIRS, generateFileName, saveFile } from "@/lib/storage";
import type { Engagement } from "@prisma/client";
import type { ReportContent, Flag } from "@/types/generation";
import type { TemplateContent } from "@/types/template";
import type { DocumentOptions, GeneratedDocument } from "@/types/document";

/**
 * Assemble a complete report document
 */
export async function assembleReport(
  template: TemplateContent | null,
  content: ReportContent,
  engagement: Engagement
): Promise<Buffer> {
  // Build report data for placeholder replacement
  const reportData = buildReportData(engagement, content);

  // Create document options
  const docOptions: DocumentOptions = {
    companyName: content.companyName,
    valuationDate: content.valuationDate,
    reportType: content.reportType,
    includeHeader: true,
    includeFooter: true,
  };

  // Build document sections
  const sections: Paragraph[] = [];

  // Title page
  sections.push(...createTitleSection(content, reportData));
  sections.push(createPageBreak());

  // Table of Contents placeholder
  sections.push(createHeading("Table of Contents", 1));
  sections.push(createPlaceholder("Generate Table of Contents in Word"));
  sections.push(createPageBreak());

  // Executive Summary
  sections.push(createHeading("Executive Summary", 1));
  sections.push(...createExecutiveSummary(content, reportData));
  sections.push(createPageBreak());

  // Company Overview
  sections.push(createHeading("Company Overview", 1));
  sections.push(...createCompanySection(content));

  // Industry Outlook
  sections.push(createHeading("Industry Overview", 1));
  sections.push(...createIndustrySection(content));

  // Economic Outlook
  sections.push(createHeading("Economic Environment", 1));
  sections.push(...createEconomicSection(content));
  sections.push(createPageBreak());

  // Valuation Methodology
  sections.push(createHeading("Valuation Analysis", 1));
  sections.push(...createValuationSection(content));

  // Conclusion
  sections.push(createHeading("Conclusion of Value", 1));
  sections.push(...createConclusionSection(content));

  // Flags summary (if any)
  if (content.flags.length > 0) {
    sections.push(createPageBreak());
    sections.push(createHeading("Items Requiring Review", 1));
    sections.push(...createFlagsSection(content.flags));
  }

  // Create and return document
  const doc = createDocument(docOptions, sections);
  return await generateDocumentBuffer(doc);
}

/**
 * Create title section
 */
function createTitleSection(content: ReportContent, reportData: { reportType: string; valuationDate: string }): Paragraph[] {
  const sections: Paragraph[] = [];

  // Add some spacing at top
  sections.push(createParagraph("", { spacing: { before: 2000 } }));

  // Report type title
  const title = content.reportType === "FOUR09A"
    ? "409A Valuation Report"
    : "Business Valuation Report";

  sections.push(
    createParagraph(title, {
      bold: true,
      alignment: "center",
      spacing: { after: 400 },
    })
  );

  // Company name
  sections.push(
    createParagraph(content.companyName, {
      bold: true,
      alignment: "center",
      spacing: { after: 400 },
    })
  );

  // Subtitle
  const subtitle = content.reportType === "FOUR09A"
    ? "Fair Market Value of Common Stock"
    : "Fair Market Value Determination";

  sections.push(
    createParagraph(subtitle, {
      italic: true,
      alignment: "center",
      spacing: { after: 600 },
    })
  );

  // Valuation date
  sections.push(
    createParagraph(`As of ${reportData.valuationDate}`, {
      alignment: "center",
      spacing: { after: 200 },
    })
  );

  // Draft notice
  sections.push(
    createParagraph("CONFIDENTIAL DRAFT", {
      bold: true,
      alignment: "center",
      highlight: true,
      spacing: { before: 1000 },
    })
  );

  return sections;
}

/**
 * Create executive summary
 */
function createExecutiveSummary(content: ReportContent, reportData: { companyName: string; valuationDate: string }): Paragraph[] {
  const sections: Paragraph[] = [];

  sections.push(
    createParagraph(
      `This report presents our opinion of the fair market value of the common stock of ${reportData.companyName} as of ${reportData.valuationDate}.`
    )
  );

  // Add concluded value if available
  if (content.conclusion.content && !content.conclusion.content.includes("FAILED")) {
    sections.push(createParagraph(content.conclusion.content));
  } else {
    sections.push(createPlaceholder("Conclusion summary"));
  }

  return sections;
}

/**
 * Create company overview section
 */
function createCompanySection(content: ReportContent): Paragraph[] {
  const sections: Paragraph[] = [];

  if (content.companyOverview.content && !content.companyOverview.content.includes("not generated")) {
    // Split content into paragraphs
    const paragraphs = content.companyOverview.content.split("\n\n").filter((p) => p.trim());

    for (const para of paragraphs) {
      if (content.companyOverview.confidence < 0.6) {
        sections.push(createFlaggedContent(para, "Low confidence - review required"));
      } else {
        sections.push(createParagraph(para));
      }
    }

    // Add warnings if any
    if (content.companyOverview.warnings && content.companyOverview.warnings.length > 0) {
      sections.push(
        createParagraph(`Note: ${content.companyOverview.warnings.join("; ")}`, {
          italic: true,
          highlight: true,
        })
      );
    }
  } else {
    sections.push(createPlaceholder("Company overview content"));
  }

  // Add cap table placeholder
  sections.push(createHeading("Capitalization", 3));
  sections.push(createCapTablePlaceholder());

  return sections;
}

/**
 * Create industry section
 */
function createIndustrySection(content: ReportContent): Paragraph[] {
  const sections: Paragraph[] = [];

  if (content.industryOutlook.content && !content.industryOutlook.content.includes("not generated")) {
    // Add footnotes to industry content
    const { content: footnotedContent, footnotes } = addFootnotes(
      content.industryOutlook.content,
      content.industryCitations
    );

    // Split into paragraphs
    const paragraphs = footnotedContent.split("\n\n").filter((p) => p.trim());

    for (const para of paragraphs) {
      // Handle markdown-style headers
      if (para.startsWith("**") && para.endsWith("**")) {
        sections.push(createHeading(para.replace(/\*\*/g, ""), 3));
      } else if (para.startsWith("•") || para.startsWith("-")) {
        // Bullet points
        sections.push(createParagraph(para, { indent: { left: 720 } }));
      } else {
        sections.push(createParagraph(para));
      }
    }

    // Add footnotes section
    if (footnotes.length > 0) {
      sections.push(createHeading("Sources", 3));
      for (const footnote of footnotes) {
        sections.push(createParagraph(footnote, { spacing: { after: 100 } }));
      }
    }
  } else {
    sections.push(createPlaceholder("Industry outlook content"));
  }

  return sections;
}

/**
 * Create economic outlook section
 */
function createEconomicSection(content: ReportContent): Paragraph[] {
  const sections: Paragraph[] = [];

  if (content.economicOutlook.content && !content.economicOutlook.content.includes("not loaded")) {
    const paragraphs = content.economicOutlook.content.split("\n\n").filter((p) => p.trim());

    for (const para of paragraphs) {
      sections.push(createParagraph(para));
    }
  } else {
    sections.push(createPlaceholder("Economic outlook content - load from stored document"));
  }

  return sections;
}

/**
 * Create valuation analysis section
 */
function createValuationSection(content: ReportContent): Paragraph[] {
  const sections: Paragraph[] = [];

  // Introduction
  sections.push(
    createParagraph(
      "The following valuation approaches were considered and applied in determining the fair market value:"
    )
  );

  // Add narrative for each approach
  for (const narrative of content.approachNarratives) {
    sections.push(createHeading(narrative.approachName, 2));

    const paragraphs = narrative.narrative.split("\n\n").filter((p) => p.trim());

    for (const para of paragraphs) {
      if (narrative.confidence === "low") {
        sections.push(createFlaggedContent(para, "Low confidence"));
      } else {
        sections.push(createParagraph(para));
      }
    }
  }

  // If no narratives
  if (content.approachNarratives.length === 0) {
    sections.push(createPlaceholder("Valuation approach narratives"));
  }

  return sections;
}

/**
 * Create conclusion section
 */
function createConclusionSection(content: ReportContent): Paragraph[] {
  const sections: Paragraph[] = [];

  // Valuation summary table
  sections.push(createHeading("Summary of Value Indications", 2));

  // Note: Table would be added here - for now using placeholder
  sections.push(createPlaceholder("Insert valuation summary table"));

  // Conclusion narrative
  sections.push(createHeading("Reconciliation and Conclusion", 2));

  if (content.conclusion.content && !content.conclusion.content.includes("FAILED")) {
    const paragraphs = content.conclusion.content.split("\n\n").filter((p) => p.trim());

    for (const para of paragraphs) {
      sections.push(createParagraph(para));
    }
  } else {
    sections.push(createPlaceholder("Conclusion narrative"));
  }

  return sections;
}

/**
 * Create flags section for items needing review
 */
function createFlagsSection(flags: Flag[]): Paragraph[] {
  const sections: Paragraph[] = [];

  sections.push(
    createParagraph(
      "The following items require review or additional input before finalizing this report:",
      { bold: true }
    )
  );

  for (const flag of flags) {
    const prefix = flag.type === "error" ? "❌" : flag.type === "missing" ? "⚠️" : "📝";
    sections.push(
      createParagraph(`${prefix} ${flag.section}: ${flag.message}`, {
        indent: { left: 360 },
        spacing: { after: 100 },
      })
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
  // Generate filename
  const companyName = engagement.companyName || "Company";
  const reportType = engagement.reportType === "FOUR09A" ? "409A" : "59-60";
  const dateStr = engagement.valuationDate
    ? new Date(engagement.valuationDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const baseName = `${companyName} - ${reportType} - ${dateStr} - DRAFT_v1.docx`;
  const fileName = generateFileName(baseName, "report");

  // Save to reports directory
  const filePath = await saveFile(buffer, STORAGE_DIRS.reports, fileName);

  return filePath;
}

/**
 * Generate complete report document
 */
export async function generateReport(
  template: TemplateContent | null,
  content: ReportContent,
  engagement: Engagement
): Promise<GeneratedDocument> {
  const buffer = await assembleReport(template, content, engagement);

  // Generate filename
  const companyName = content.companyName || "Company";
  const reportType = content.reportType === "FOUR09A" ? "409A" : "59-60";
  const dateStr = content.valuationDate.toISOString().split("T")[0];
  const filename = `${companyName} - ${reportType} - ${dateStr} - DRAFT.docx`;

  return {
    buffer,
    filename,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: buffer.length,
  };
}

