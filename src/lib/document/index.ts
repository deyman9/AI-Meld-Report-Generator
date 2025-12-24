/**
 * Document Module - Main entry point
 */

// Generator
export {
  createDocument,
  createHeading,
  createParagraph,
  createHighlightedText,
  createPlaceholder,
  createFlaggedContent,
  createTable,
  createValuationSummaryTable,
  createPageBreak,
  createCapTablePlaceholder,
  generateDocumentBuffer,
  createReportDocument,
} from "./generator";

// Assembler
export {
  assembleReport,
  saveReport,
  generateReport,
} from "./assembler";

// Footnotes
export {
  addFootnotes,
  formatFootnotesSection,
  addFootnoteMarkers,
  extractCitationsFromContent,
  createBibliography,
} from "./footnotes";

// Styles
export * from "./styles";
