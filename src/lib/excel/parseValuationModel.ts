import type { ParsedModel, DetailedModelData } from '@/types/excel';
import { 
  loadWorkbook, 
  extractCompanyInfo, 
  extractExhibits, 
  extractSummaryData,
  extractDLOM 
} from './parser';
import { extractDetailedData } from './detailedExtractor';

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
  let detailedData: DetailedModelData | undefined = undefined;

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

    // Extract detailed data for AI narrative generation
    try {
      console.log('Extracting detailed model data for AI narratives...');
      detailedData = extractDetailedData(workbook);
      
      // Add missing data items to warnings
      if (detailedData.missingData.length > 0) {
        console.log(`Missing data for AI narratives: ${detailedData.missingData.join(', ')}`);
        detailedData.missingData.forEach(item => {
          warnings.push(`[AI Data] ${item}`);
        });
      }
      
      // Log extraction summary
      console.log('Detailed extraction summary:', {
        hasFinancials: !!detailedData.companyFinancials,
        gpcCount: detailedData.guidelinePublicCompanies.length,
        transactionCount: detailedData.guidelineTransactions.length,
        hasIncomeData: !!detailedData.incomeApproachData,
        hasBacksolveData: !!detailedData.backsolveData,
        hasWeightingData: !!detailedData.weightingData,
      });
    } catch (error) {
      console.error('Failed to extract detailed data:', error);
      warnings.push(`Failed to extract detailed data for AI: ${error}`);
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
    detailedData,
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

