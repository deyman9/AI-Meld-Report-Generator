/**
 * Placeholder Replacement Utilities
 */

import type { Engagement } from "@prisma/client";
import type { ReportContent } from "@/types/generation";

// Placeholder mapping to data keys
export const PLACEHOLDER_MAP: Record<string, string> = {
  "*COMPANY": "companyName",
  "*VALUATIONDATE": "valuationDate",
  "*REPORTDATE": "reportDate",
  "*CONCLUDEDVALUE": "concludedValue",
  "*PRICEPERSHARE": "pricePerShare",
  "*DLOM": "dlom",
  "*INDUSTRY": "industry",
  "*REPORTTYPE": "reportType",
  "*QUARTER": "quarter",
  "*YEAR": "year",
};

// Report data for placeholder replacement
export interface ReportData {
  companyName: string;
  valuationDate: string;
  reportDate: string;
  concludedValue?: string;
  pricePerShare?: string;
  dlom?: string;
  industry?: string;
  reportType: string;
  quarter?: string;
  year?: string;
  [key: string]: string | undefined;
}

/**
 * Build report data from engagement and content
 */
export function buildReportData(
  engagement: Engagement,
  content: ReportContent
): ReportData {
  const valuationDate = engagement.valuationDate || new Date();
  const quarter = Math.floor(valuationDate.getMonth() / 3) + 1;

  return {
    companyName: content.companyName || engagement.companyName || "Subject Company",
    valuationDate: formatDate(valuationDate),
    reportDate: formatDate(new Date()),
    reportType: engagement.reportType === "FOUR09A" ? "409A Valuation" : "Gift & Estate Valuation",
    quarter: `Q${quarter}`,
    year: valuationDate.getFullYear().toString(),
    industry: extractIndustry(content),
  };
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Extract industry from content
 */
function extractIndustry(content: ReportContent): string {
  // Try to extract from industry outlook
  if (content.industryOutlook.content) {
    // Simple extraction - first sentence might contain industry name
    const match = content.industryOutlook.content.match(/^The\s+([^.]+?)\s+(industry|market|sector)/i);
    if (match) {
      return match[1].trim();
    }
  }
  return "Technology"; // Default
}

/**
 * Replace a single placeholder in text
 */
export function replacePlaceholder(
  text: string,
  placeholder: string,
  value: string
): string {
  // Replace all occurrences
  const regex = new RegExp(escapeRegExp(placeholder), "g");
  return text.replace(regex, value);
}

/**
 * Replace all placeholders in text
 */
export function replaceAllPlaceholders(text: string, data: ReportData): string {
  let result = text;

  for (const [placeholder, dataKey] of Object.entries(PLACEHOLDER_MAP)) {
    const value = data[dataKey];
    if (value !== undefined) {
      result = replacePlaceholder(result, placeholder, value);
    }
  }

  return result;
}

/**
 * Find unreplaced placeholders in text
 */
export function findUnreplacedPlaceholders(text: string): string[] {
  const regex = /\*[A-Z][A-Z0-9_]*/g;
  const matches = text.match(regex);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Highlight unreplaced placeholders
 */
export function markUnreplacedPlaceholders(text: string): string {
  const regex = /\*[A-Z][A-Z0-9_]*/g;
  return text.replace(regex, (match) => `[MISSING: ${match}]`);
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

