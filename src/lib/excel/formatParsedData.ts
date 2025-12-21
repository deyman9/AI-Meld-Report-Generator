import type { ParsedModel, ParsedModelResponse } from '@/types/excel';

/**
 * Formats parsed model data for API response
 * Converts dates to ISO strings and summarizes exhibits
 */
export function formatForAPI(parsed: ParsedModel): ParsedModelResponse {
  return {
    companyName: parsed.companyName,
    valuationDate: parsed.valuationDate ? parsed.valuationDate.toISOString() : null,
    exhibitCount: parsed.exhibits.length,
    exhibitNames: parsed.exhibits.map(e => e.sheetName),
    approaches: parsed.summary?.approaches || [],
    concludedValue: parsed.summary?.concludedValue || null,
    dlom: parsed.dlom,
    warnings: parsed.warnings,
    errors: parsed.errors,
  };
}

/**
 * Creates a summary string for display
 */
export function createParseSummary(parsed: ParsedModel): string {
  const lines: string[] = [];

  if (parsed.companyName) {
    lines.push(`Company: ${parsed.companyName}`);
  }

  if (parsed.valuationDate) {
    lines.push(`Valuation Date: ${parsed.valuationDate.toLocaleDateString()}`);
  }

  lines.push(`Exhibits Found: ${parsed.exhibits.length}`);

  if (parsed.summary?.approaches.length) {
    lines.push(`Approaches: ${parsed.summary.approaches.map(a => a.name).join(', ')}`);
  }

  if (parsed.summary?.concludedValue) {
    lines.push(`Concluded Value: $${parsed.summary.concludedValue.toLocaleString()}`);
  }

  if (parsed.dlom) {
    lines.push(`DLOM: ${(parsed.dlom * 100).toFixed(1)}%`);
  }

  if (parsed.warnings.length > 0) {
    lines.push(`\nWarnings: ${parsed.warnings.length}`);
  }

  if (parsed.errors.length > 0) {
    lines.push(`Errors: ${parsed.errors.length}`);
  }

  return lines.join('\n');
}

