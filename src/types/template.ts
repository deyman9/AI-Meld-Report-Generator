/**
 * Template Types for Document Templates
 */

// Template content structure
export interface TemplateContent {
  id: string;
  name: string;
  type: "FOUR09A" | "FIFTY_NINE_SIXTY";
  filePath: string;
  rawText: string;
  sections: TemplateSection[];
  placeholders: Placeholder[];
  metadata: TemplateMetadata;
}

// Template section
export interface TemplateSection {
  name: string;
  type: TemplateSectionType;
  content: string;
  startPosition: number;
  endPosition: number;
  placeholders: Placeholder[];
  heading?: string;
  headingLevel?: number;
}

// Section types
export type TemplateSectionType = "boilerplate" | "substitution" | "generated";

// Placeholder in template
export interface Placeholder {
  placeholder: string;
  position: number;
  length: number;
  dataKey: string;
  required: boolean;
}

// Template metadata
export interface TemplateMetadata {
  loadedAt: Date;
  fileSize: number;
  paragraphCount: number;
  wordCount: number;
}

// Template validation result
export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingPlaceholders: string[];
  unknownPlaceholders: string[];
}

// Standard placeholders
export const STANDARD_PLACEHOLDERS: Record<string, { dataKey: string; required: boolean; description: string }> = {
  "*COMPANY": { dataKey: "companyName", required: true, description: "Company name" },
  "*VALUATIONDATE": { dataKey: "valuationDate", required: true, description: "Valuation date" },
  "*REPORTDATE": { dataKey: "reportDate", required: false, description: "Report date" },
  "*CONCLUDEDVALUE": { dataKey: "concludedValue", required: false, description: "Concluded value" },
  "*PRICEPERARE": { dataKey: "pricePerShare", required: false, description: "Price per share" },
  "*DLOM": { dataKey: "dlom", required: false, description: "DLOM percentage" },
  "*INDUSTRY": { dataKey: "industry", required: false, description: "Industry name" },
};

// Section identifiers for generated content
export const GENERATED_SECTIONS = {
  COMPANY_OVERVIEW: ["company overview", "company background", "company description"],
  INDUSTRY_OUTLOOK: ["industry overview", "industry outlook", "industry analysis"],
  ECONOMIC_OUTLOOK: ["economic outlook", "economic environment", "economic conditions"],
  VALUATION_ANALYSIS: ["valuation analysis", "valuation methodology", "approaches"],
  CONCLUSION: ["conclusion", "value conclusion", "summary of value"],
};

