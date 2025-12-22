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

// Template
export {
  loadTemplate,
  findPlaceholders,
  identifySections,
  validateTemplate,
  extractTemplateText,
} from "./template";

// Assembler
export {
  assembleReport,
  saveReport,
  generateReport,
} from "./assembler";

// Placeholders
export {
  PLACEHOLDER_MAP,
  buildReportData,
  replacePlaceholder,
  replaceAllPlaceholders,
  findUnreplacedPlaceholders,
  markUnreplacedPlaceholders,
} from "./placeholders";

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

