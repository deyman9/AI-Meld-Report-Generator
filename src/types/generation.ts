/**
 * Generation Types for Report Content Generation
 */

import type { ApproachNarrative } from "./narrative";
import type { Citation } from "./research";

// Content source types
export type ContentSource = "ai" | "template" | "stored" | "manual";

// Flag types for review
export type FlagType = "missing" | "uncertain" | "review" | "error";

// Section content with metadata
export interface SectionContent {
  content: string;
  source: ContentSource;
  confidence: number; // 0-1
  warnings?: string[];
}

// Flag for review items
export interface Flag {
  section: string;
  message: string;
  type: FlagType;
}

// Complete report content
export interface ReportContent {
  // Basic info
  companyName: string;
  valuationDate: Date;
  reportType: "FOUR09A" | "FIFTY_NINE_SIXTY";

  // Generated sections
  companyOverview: SectionContent;
  industryOutlook: SectionContent;
  economicOutlook: SectionContent;
  valuationAnalysis: Record<string, SectionContent>;
  conclusion: SectionContent;

  // Approach narratives
  approachNarratives: ApproachNarrative[];

  // Citations for industry section
  industryCitations: Citation[];

  // Metadata
  flags: Flag[];
  warnings: string[];
  generatedAt: Date;
  generationDuration: number; // milliseconds
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  reviewNeeded: string[];
}

// Generation options
export interface GenerationOptions {
  includeIndustryResearch?: boolean;
  includeCompanyResearch?: boolean;
  maxRetries?: number;
  skipFailedSections?: boolean;
}

// Generation result
export interface GenerationResult {
  success: boolean;
  content?: ReportContent;
  error?: string;
  warnings: string[];
  duration: number;
}

// Economic outlook content
export interface EconomicOutlookContent {
  quarter: number;
  year: number;
  content: string;
  source: "stored" | "generated";
}

