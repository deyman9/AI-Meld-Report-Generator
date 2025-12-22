/**
 * Document Generation Types
 */

// Document creation options
export interface DocumentOptions {
  companyName: string;
  valuationDate: Date;
  reportType: "FOUR09A" | "FIFTY_NINE_SIXTY";
  title?: string;
  includeHeader?: boolean;
  includeFooter?: boolean;
  includePageNumbers?: boolean;
}

// Paragraph styling options
export interface ParagraphOptions {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  highlight?: boolean;
  highlightColor?: HighlightColor;
  alignment?: "left" | "center" | "right" | "justified";
  spacing?: {
    before?: number;
    after?: number;
    line?: number;
  };
  indent?: {
    left?: number;
    right?: number;
    firstLine?: number;
  };
}

// Highlight colors
export type HighlightColor = "yellow" | "green" | "cyan" | "magenta" | "red" | "blue" | "darkYellow";

// Table data structure
export interface TableData {
  headers: string[];
  rows: TableRow[];
  widths?: number[];
  headerStyle?: "bold" | "shaded" | "both";
}

// Table row
export interface TableRow {
  cells: TableCell[];
  isHighlighted?: boolean;
}

// Table cell
export interface TableCell {
  content: string;
  bold?: boolean;
  alignment?: "left" | "center" | "right";
  shading?: string;
}

// Valuation summary table data
export interface ValuationSummaryData {
  approaches: ValuationApproachRow[];
  concludedValue: number;
  dlom?: number;
  finalValue?: number;
}

// Valuation approach row
export interface ValuationApproachRow {
  name: string;
  indicatedValue: number | null;
  weight: number | null;
  weightedValue: number | null;
}

// Document section
export interface DocumentSection {
  heading?: string;
  headingLevel?: 1 | 2 | 3;
  content: string[];
  tables?: TableData[];
  pageBreakBefore?: boolean;
}

// Generated document result
export interface GeneratedDocument {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
}

