import type { ParsedModel } from '@/types/excel';
import { 
  loadWorkbook, 
  extractCompanyInfo, 
  extractExhibits, 
  extractSummaryData,
  extractDLOM 
} from './parser';

/**
 * Main function to parse a valuation model Excel file
 * Orchestrates all extraction functions and collects errors/warnings
 */
export async function parseValuationModel(filePath: string): Promise<ParsedModel> {
  const errors: string[] = [];
  const warnings: string[] = [];

  let companyName: string | null = null;
  let valuationDate: Date | null = null;
  let exhibits: ParsedModel['exhibits'] = [];
  let summary: ParsedModel['summary'] = null;
  let dlom: number | null = null;

  try {
    // Load the workbook
    const workbook = await loadWorkbook(filePath);

    // Extract company info
    try {
      const companyInfo = extractCompanyInfo(workbook);
      companyName = companyInfo.companyName;
      valuationDate = companyInfo.valuationDate;

      if (!companyName) {
        warnings.push('Company name not found in expected location (LEs!G819)');
      }
      if (!valuationDate) {
        warnings.push('Valuation date not found in expected location (LEs!G824)');
      }
    } catch (error) {
      errors.push(`Failed to extract company info: ${error}`);
    }

    // Extract exhibits
    try {
      exhibits = extractExhibits(workbook);
      
      if (exhibits.length === 0) {
        warnings.push('No exhibits found in workbook');
      } else {
        // Log exhibit names for debugging
        const exhibitNames = exhibits.map(e => e.sheetName);
        console.log(`Found ${exhibits.length} exhibits:`, exhibitNames);
      }
    } catch (error) {
      errors.push(`Failed to extract exhibits: ${error}`);
    }

    // Extract summary data
    try {
      summary = extractSummaryData(workbook);
      
      if (!summary) {
        warnings.push('Summary sheet not found or could not be parsed');
      } else {
        if (summary.approaches.length === 0) {
          warnings.push('No valuation approaches found in Summary');
        }
        if (summary.concludedValue === null) {
          warnings.push('Concluded value not found in Summary');
        }
      }
    } catch (error) {
      errors.push(`Failed to extract summary data: ${error}`);
    }

    // Extract DLOM
    try {
      dlom = extractDLOM(workbook);
      
      if (dlom === null) {
        warnings.push('DLOM not found in workbook');
      }
    } catch (error) {
      warnings.push(`Failed to extract DLOM: ${error}`);
    }

  } catch (error) {
    errors.push(`Failed to load workbook: ${error}`);
  }

  return {
    companyName,
    valuationDate,
    exhibits,
    summary,
    dlom,
    errors,
    warnings,
  };
}

/**
 * Validates that a file path points to a valid Excel file
 */
export function validateModelFilePath(filePath: string): { valid: boolean; error?: string } {
  if (!filePath) {
    return { valid: false, error: 'File path is required' };
  }

  const extension = filePath.toLowerCase().split('.').pop();
  if (!extension || !['xlsx', 'xls', 'xlsm'].includes(extension)) {
    return { valid: false, error: 'File must be an Excel file (.xlsx, .xls, or .xlsm)' };
  }

  return { valid: true };
}

