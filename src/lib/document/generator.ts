/**
 * Word Document Generator
 * Creates .docx files for valuation reports
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
} from "docx";

import {
  FONTS,
  FONT_SIZES,
  COLORS,
  MARGINS,
  SPACING,
  HEADING_STYLES,
  TABLE_STYLES,
  REPORT_TYPE_STYLES,
} from "./styles";

import type {
  DocumentOptions,
  ParagraphOptions,
  TableData,
  ValuationSummaryData,
  GeneratedDocument,
} from "@/types/document";

/**
 * Create a new document with standard formatting
 */
export function createDocument(
  options: DocumentOptions,
  sections: Paragraph[]
): Document {
  const reportStyle = REPORT_TYPE_STYLES[options.reportType];

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FONTS.primary,
            size: FONT_SIZES.body,
          },
          paragraph: {
            spacing: {
              after: SPACING.paragraphAfter,
              line: SPACING.lineSpacing,
            },
          },
        },
        heading1: {
          run: {
            font: FONTS.primary,
            size: FONT_SIZES.heading1,
            bold: true,
            color: COLORS.primary,
          },
          paragraph: {
            spacing: {
              before: HEADING_STYLES.heading1.spacingBefore,
              after: HEADING_STYLES.heading1.spacingAfter,
            },
          },
        },
        heading2: {
          run: {
            font: FONTS.primary,
            size: FONT_SIZES.heading2,
            bold: true,
            color: COLORS.primary,
          },
          paragraph: {
            spacing: {
              before: HEADING_STYLES.heading2.spacingBefore,
              after: HEADING_STYLES.heading2.spacingAfter,
            },
          },
        },
        heading3: {
          run: {
            font: FONTS.primary,
            size: FONT_SIZES.heading3,
            bold: true,
            color: COLORS.secondary,
          },
          paragraph: {
            spacing: {
              before: HEADING_STYLES.heading3.spacingBefore,
              after: HEADING_STYLES.heading3.spacingAfter,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: MARGINS.top,
              bottom: MARGINS.bottom,
              left: MARGINS.left,
              right: MARGINS.right,
            },
          },
        },
        headers: options.includeHeader !== false
          ? {
              default: new Header({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: options.companyName,
                        font: FONTS.primary,
                        size: FONT_SIZES.small,
                        color: COLORS.secondary,
                      }),
                      new TextRun({
                        text: `  |  ${reportStyle.title}`,
                        font: FONTS.primary,
                        size: FONT_SIZES.small,
                        color: COLORS.secondary,
                      }),
                    ],
                    alignment: AlignmentType.RIGHT,
                  }),
                ],
              }),
            }
          : undefined,
        footers: options.includeFooter !== false
          ? {
              default: new Footer({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "CONFIDENTIAL DRAFT",
                        font: FONTS.primary,
                        size: FONT_SIZES.small,
                        color: COLORS.secondary,
                      }),
                      new TextRun({
                        text: "  |  Page ",
                        font: FONTS.primary,
                        size: FONT_SIZES.small,
                        color: COLORS.secondary,
                      }),
                      new TextRun({
                        children: [PageNumber.CURRENT],
                        font: FONTS.primary,
                        size: FONT_SIZES.small,
                        color: COLORS.secondary,
                      }),
                      new TextRun({
                        text: " of ",
                        font: FONTS.primary,
                        size: FONT_SIZES.small,
                        color: COLORS.secondary,
                      }),
                      new TextRun({
                        children: [PageNumber.TOTAL_PAGES],
                        font: FONTS.primary,
                        size: FONT_SIZES.small,
                        color: COLORS.secondary,
                      }),
                    ],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
              }),
            }
          : undefined,
        children: sections,
      },
    ],
  });

  return doc;
}

/**
 * Create a heading paragraph
 */
export function createHeading(text: string, level: 1 | 2 | 3): Paragraph {
  const headingLevel = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
  }[level];

  return new Paragraph({
    text,
    heading: headingLevel,
  });
}

/**
 * Create a body paragraph
 */
export function createParagraph(text: string, options?: ParagraphOptions): Paragraph {
  const alignment = options?.alignment
    ? {
        left: AlignmentType.LEFT,
        center: AlignmentType.CENTER,
        right: AlignmentType.RIGHT,
        justified: AlignmentType.JUSTIFIED,
      }[options.alignment]
    : AlignmentType.JUSTIFIED;

  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: options?.bold,
        italics: options?.italic,
        underline: options?.underline ? {} : undefined,
        highlight: options?.highlight ? "yellow" : undefined,
        font: FONTS.primary,
        size: FONT_SIZES.body,
      }),
    ],
    alignment,
    spacing: {
      before: options?.spacing?.before,
      after: options?.spacing?.after ?? SPACING.paragraphAfter,
      line: options?.spacing?.line ?? SPACING.lineSpacing,
    },
    indent: options?.indent
      ? {
          left: options.indent.left,
          right: options.indent.right,
          firstLine: options.indent.firstLine,
        }
      : undefined,
  });
}

/**
 * Create highlighted text run
 */
export function createHighlightedText(text: string): TextRun {
  return new TextRun({
    text,
    highlight: "yellow",
    font: FONTS.primary,
    size: FONT_SIZES.body,
  });
}

/**
 * Create a placeholder paragraph for missing content
 */
export function createPlaceholder(message: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `[MISSING: ${message}]`,
        highlight: "yellow",
        bold: true,
        font: FONTS.primary,
        size: FONT_SIZES.body,
      }),
    ],
    spacing: {
      before: 100,
      after: 100,
    },
  });
}

/**
 * Create a flagged content paragraph (needs review)
 */
export function createFlaggedContent(text: string, flagMessage: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        font: FONTS.primary,
        size: FONT_SIZES.body,
      }),
      new TextRun({
        text: ` [REVIEW: ${flagMessage}]`,
        highlight: "cyan",
        italics: true,
        font: FONTS.primary,
        size: FONT_SIZES.small,
      }),
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: {
      after: SPACING.paragraphAfter,
    },
  });
}

/**
 * Create a table from data
 */
export function createTable(data: TableData): Table {
  // Calculate column widths
  const columnCount = data.headers.length;
  const defaultWidth = Math.floor(9000 / columnCount); // ~6.25 inches total
  const widths = data.widths || Array(columnCount).fill(defaultWidth);

  // Create header row
  const headerRow = new TableRow({
    children: data.headers.map(
      (header, index) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: header,
                  bold: true,
                  font: FONTS.primary,
                  size: FONT_SIZES.body,
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
          width: { size: widths[index], type: WidthType.DXA },
          shading:
            data.headerStyle === "shaded" || data.headerStyle === "both"
              ? { fill: TABLE_STYLES.headerBackground, type: ShadingType.CLEAR }
              : undefined,
        })
    ),
    tableHeader: true,
  });

  // Create data rows
  const dataRows = data.rows.map(
    (row) =>
      new TableRow({
        children: row.cells.map(
          (cell, index) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cell.content,
                      bold: cell.bold,
                      font: FONTS.primary,
                      size: FONT_SIZES.body,
                    }),
                  ],
                  alignment: cell.alignment
                    ? {
                        left: AlignmentType.LEFT,
                        center: AlignmentType.CENTER,
                        right: AlignmentType.RIGHT,
                      }[cell.alignment]
                    : AlignmentType.LEFT,
                }),
              ],
              width: { size: widths[index], type: WidthType.DXA },
              shading: cell.shading
                ? { fill: cell.shading, type: ShadingType.CLEAR }
                : row.isHighlighted
                ? { fill: "FFFF99", type: ShadingType.CLEAR }
                : undefined,
            })
        ),
      })
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: TABLE_STYLES.borderColor },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: TABLE_STYLES.borderColor },
      left: { style: BorderStyle.SINGLE, size: 1, color: TABLE_STYLES.borderColor },
      right: { style: BorderStyle.SINGLE, size: 1, color: TABLE_STYLES.borderColor },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: TABLE_STYLES.borderColor },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: TABLE_STYLES.borderColor },
    },
  });
}

/**
 * Create valuation summary table
 */
export function createValuationSummaryTable(data: ValuationSummaryData): Table {
  const formatCurrency = (value: number | null): string => {
    if (value === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number | null): string => {
    if (value === null) return "N/A";
    return `${(value * 100).toFixed(0)}%`;
  };

  const tableData: TableData = {
    headers: ["Valuation Approach", "Indicated Value", "Weight", "Weighted Value"],
    rows: [
      ...data.approaches.map((approach) => ({
        cells: [
          { content: approach.name, alignment: "left" as const },
          { content: formatCurrency(approach.indicatedValue), alignment: "right" as const },
          { content: formatPercent(approach.weight), alignment: "center" as const },
          { content: formatCurrency(approach.weightedValue), alignment: "right" as const },
        ],
      })),
      {
        cells: [
          { content: "Concluded Enterprise Value", bold: true, alignment: "left" as const },
          { content: "", alignment: "right" as const },
          { content: "", alignment: "center" as const },
          { content: formatCurrency(data.concludedValue), bold: true, alignment: "right" as const },
        ],
        isHighlighted: true,
      },
    ],
    headerStyle: "both",
  };

  if (data.dlom !== undefined && data.finalValue !== undefined) {
    tableData.rows.push(
      {
        cells: [
          { content: `Less: DLOM (${formatPercent(data.dlom)})`, alignment: "left" as const },
          { content: "", alignment: "right" as const },
          { content: "", alignment: "center" as const },
          { content: formatCurrency(-data.concludedValue * data.dlom), alignment: "right" as const },
        ],
      },
      {
        cells: [
          { content: "Fair Market Value per Share", bold: true, alignment: "left" as const },
          { content: "", alignment: "right" as const },
          { content: "", alignment: "center" as const },
          { content: formatCurrency(data.finalValue), bold: true, alignment: "right" as const },
        ],
        isHighlighted: true,
      }
    );
  }

  return createTable(tableData);
}

/**
 * Create a page break
 */
export function createPageBreak(): Paragraph {
  return new Paragraph({
    children: [new PageBreak()],
  });
}

/**
 * Create cap table placeholder
 */
export function createCapTablePlaceholder(): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: "[INSERT CAP TABLE IMAGE HERE]",
        highlight: "cyan",
        bold: true,
        font: FONTS.primary,
        size: FONT_SIZES.body,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: {
      before: 200,
      after: 200,
    },
    border: {
      top: { style: BorderStyle.DASHED, size: 1, color: COLORS.border },
      bottom: { style: BorderStyle.DASHED, size: 1, color: COLORS.border },
      left: { style: BorderStyle.DASHED, size: 1, color: COLORS.border },
      right: { style: BorderStyle.DASHED, size: 1, color: COLORS.border },
    },
  });
}

/**
 * Generate document buffer
 */
export async function generateDocumentBuffer(doc: Document): Promise<Buffer> {
  return await Packer.toBuffer(doc);
}

/**
 * Create a complete document and return as buffer
 */
export async function createReportDocument(
  options: DocumentOptions,
  sections: Paragraph[]
): Promise<GeneratedDocument> {
  const doc = createDocument(options, sections);
  const buffer = await generateDocumentBuffer(doc);

  // Generate filename
  const dateStr = options.valuationDate.toISOString().split("T")[0];
  const typeStr = options.reportType === "FOUR09A" ? "409A" : "59-60";
  const filename = `${options.companyName} - ${typeStr} - ${dateStr} - DRAFT.docx`;

  return {
    buffer,
    filename,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: buffer.length,
  };
}

