/**
 * Detailed Data Extractor
 * Extracts granular valuation data from Excel models for AI narrative generation
 */

import type { WorkbookData } from '@/types/excel';
import type {
  DetailedModelData,
  CompanyFinancials,
  GuidelineCompany,
  GuidelineTransaction,
  IncomeApproachData,
  BacksolveData,
  WeightingData,
  YearlyProjection,
} from '@/types/excel';
import { getSheetData, getSheetNames } from './parser';

/**
 * Extract all detailed data from the workbook
 */
export function extractDetailedData(workbook: WorkbookData): DetailedModelData {
  const missingData: string[] = [];
  
  console.log('Extracting detailed model data...');
  
  const companyFinancials = extractCompanyFinancials(workbook, missingData);
  const guidelinePublicCompanies = extractGuidelinePublicCompanies(workbook, missingData);
  const guidelineTransactions = extractGuidelineTransactions(workbook, missingData);
  const incomeApproachData = extractIncomeApproachData(workbook, missingData);
  const backsolveData = extractBacksolveData(workbook, missingData);
  const weightingData = extractWeightingData(workbook, missingData);
  
  console.log(`Detailed extraction complete. Missing data: ${missingData.length} items`);
  
  return {
    companyFinancials,
    guidelinePublicCompanies,
    guidelineTransactions,
    incomeApproachData,
    backsolveData,
    weightingData,
    missingData,
  };
}

/**
 * Find sheets matching patterns
 */
function findSheets(workbook: WorkbookData, patterns: RegExp[]): string[] {
  const sheetNames = getSheetNames(workbook);
  return sheetNames.filter(name => 
    patterns.some(pattern => pattern.test(name))
  );
}

/**
 * Search for a value near a label in sheet data
 */
function findValueNearLabel(
  data: unknown[][],
  labelPatterns: RegExp[],
  options: { 
    maxRowsToScan?: number;
    lookRight?: number;
    lookBelow?: number;
    valueType?: 'number' | 'percentage' | 'string' | 'date';
    minValue?: number;
    maxValue?: number;
  } = {}
): unknown | null {
  const { 
    maxRowsToScan = 200,
    lookRight = 5,
    lookBelow = 3,
    valueType = 'number',
    minValue,
    maxValue,
  } = options;
  
  for (let row = 0; row < Math.min(maxRowsToScan, data.length); row++) {
    const rowData = data[row] || [];
    
    for (let col = 0; col < rowData.length; col++) {
      const cell = rowData[col];
      
      if (typeof cell === 'string' && labelPatterns.some(p => p.test(cell))) {
        // Look right first
        for (let c = col + 1; c <= col + lookRight && c < rowData.length; c++) {
          const val = rowData[c];
          if (isValidValue(val, valueType, minValue, maxValue)) {
            return val;
          }
        }
        
        // Look below
        for (let r = row + 1; r <= row + lookBelow && r < data.length; r++) {
          const belowRow = data[r] || [];
          const val = belowRow[col];
          if (isValidValue(val, valueType, minValue, maxValue)) {
            return val;
          }
          // Also check same position + 1
          const valRight = belowRow[col + 1];
          if (isValidValue(valRight, valueType, minValue, maxValue)) {
            return valRight;
          }
        }
      }
    }
  }
  
  return null;
}

function isValidValue(
  val: unknown, 
  valueType: string, 
  minValue?: number, 
  maxValue?: number
): boolean {
  if (val === null || val === undefined) return false;
  
  if (valueType === 'number' || valueType === 'percentage') {
    if (typeof val !== 'number') return false;
    if (minValue !== undefined && val < minValue) return false;
    if (maxValue !== undefined && val > maxValue) return false;
    return true;
  }
  
  if (valueType === 'string') {
    return typeof val === 'string' && val.trim().length > 0;
  }
  
  if (valueType === 'date') {
    return val instanceof Date || (typeof val === 'number' && val > 30000 && val < 60000);
  }
  
  return true;
}

/**
 * Extract company financial data
 */
function extractCompanyFinancials(
  workbook: WorkbookData,
  missingData: string[]
): CompanyFinancials | null {
  const sheets = findSheets(workbook, [
    /balance/i, /income/i, /financial/i, /subject/i, /company/i, /summary/i
  ]);
  
  if (sheets.length === 0) {
    missingData.push('Company financials sheet not found');
    return null;
  }
  
  const financials: CompanyFinancials = {
    ltmRevenue: null,
    currentYearRevenue: null,
    projectedRevenue: null,
    ltmEbitda: null,
    currentYearEbitda: null,
    grossProfit: null,
    grossMargin: null,
    netIncome: null,
    totalAssets: null,
    totalEquity: null,
    totalDebt: null,
    cash: null,
    enterpriseValue: null,
    equityValue: null,
  };
  
  for (const sheetName of sheets) {
    const data = getSheetData(workbook, sheetName);
    
    // Revenue patterns
    financials.ltmRevenue ??= findValueNearLabel(data, [
      /ltm.*revenue/i, /trailing.*twelve.*month.*revenue/i, /ttm.*revenue/i
    ], { minValue: 1000 }) as number | null;
    
    financials.currentYearRevenue ??= findValueNearLabel(data, [
      /(?:20\d{2}|fy\s*\d{2,4}).*revenue/i, /revenue.*(?:20\d{2}|fy)/i, /^revenue$/i
    ], { minValue: 1000 }) as number | null;
    
    // EBITDA patterns
    financials.ltmEbitda ??= findValueNearLabel(data, [
      /ltm.*ebitda/i, /trailing.*ebitda/i, /ttm.*ebitda/i
    ], { minValue: -10000000 }) as number | null;
    
    financials.currentYearEbitda ??= findValueNearLabel(data, [
      /ebitda/i
    ], { minValue: -10000000, maxValue: 100000000 }) as number | null;
    
    // Other metrics
    financials.grossProfit ??= findValueNearLabel(data, [
      /gross\s*profit/i
    ], { minValue: 0 }) as number | null;
    
    financials.netIncome ??= findValueNearLabel(data, [
      /net\s*income/i, /net\s*earnings/i
    ]) as number | null;
    
    financials.totalAssets ??= findValueNearLabel(data, [
      /total\s*assets/i
    ], { minValue: 0 }) as number | null;
    
    financials.totalEquity ??= findValueNearLabel(data, [
      /total\s*equity/i, /shareholders.*equity/i, /stockholders.*equity/i
    ]) as number | null;
    
    financials.enterpriseValue ??= findValueNearLabel(data, [
      /enterprise\s*value/i, /ev\b/i
    ], { minValue: 10000 }) as number | null;
    
    financials.equityValue ??= findValueNearLabel(data, [
      /equity\s*value/i, /market\s*cap/i
    ], { minValue: 10000 }) as number | null;
  }
  
  // Track missing key data
  if (!financials.ltmRevenue && !financials.currentYearRevenue) {
    missingData.push('Subject company revenue not found');
  }
  
  return financials;
}

/**
 * Extract guideline public company data
 */
function extractGuidelinePublicCompanies(
  workbook: WorkbookData,
  missingData: string[]
): GuidelineCompany[] {
  const sheets = findSheets(workbook, [
    /guideline.*public/i, /gpc/i, /public.*comp/i, /market.*approach/i, /comparable/i
  ]);
  
  if (sheets.length === 0) {
    // Try broader patterns
    const allSheets = findSheets(workbook, [/market/i, /comp/i]);
    if (allSheets.length > 0) {
      sheets.push(...allSheets.slice(0, 2));
    }
  }
  
  if (sheets.length === 0) {
    missingData.push('Guideline public company sheet not found');
    return [];
  }
  
  const companies: GuidelineCompany[] = [];
  
  for (const sheetName of sheets) {
    const data = getSheetData(workbook, sheetName);
    
    // Look for table headers indicating comp data
    const headerRow = findHeaderRow(data, [
      /company/i, /ticker/i, /name/i
    ]);
    
    if (headerRow !== null) {
      const headers = data[headerRow] as string[];
      const colIndices = getColumnIndices(headers);
      
      // Extract companies from rows below header
      for (let row = headerRow + 1; row < Math.min(headerRow + 20, data.length); row++) {
        const rowData = data[row] || [];
        
        // Check if this looks like a company row
        const nameCol = colIndices.company ?? colIndices.name ?? 0;
        const name = rowData[nameCol];
        
        if (typeof name === 'string' && name.length > 2 && !isHeaderOrLabel(name)) {
          const company: GuidelineCompany = {
            name: name.trim(),
            ticker: extractTicker(rowData, colIndices),
            description: null,
            revenueMultiple: extractMultiple(rowData, colIndices, 'revenue'),
            ebitdaMultiple: extractMultiple(rowData, colIndices, 'ebitda'),
            grossProfitMultiple: null,
            revenue: extractFinancialValue(rowData, colIndices, 'revenue'),
            ebitda: extractFinancialValue(rowData, colIndices, 'ebitda'),
            marketCap: null,
            enterpriseValue: extractFinancialValue(rowData, colIndices, 'ev'),
          };
          
          // Only add if we have at least a name and one multiple
          if (company.revenueMultiple !== null || company.ebitdaMultiple !== null) {
            companies.push(company);
          } else if (company.name && companies.length < 10) {
            // Still add for context even without multiples
            companies.push(company);
          }
        }
      }
    }
    
    // Also try to find selected/applied multiples
    if (companies.length > 0) {
      break; // Found companies, stop searching
    }
  }
  
  if (companies.length === 0) {
    missingData.push('No guideline public companies extracted');
  }
  
  return companies;
}

function findHeaderRow(data: unknown[][], patterns: RegExp[]): number | null {
  for (let row = 0; row < Math.min(30, data.length); row++) {
    const rowData = data[row] || [];
    const rowText = rowData.map(c => String(c ?? '')).join(' ');
    
    if (patterns.some(p => p.test(rowText))) {
      return row;
    }
  }
  return null;
}

function getColumnIndices(headers: unknown[]): Record<string, number> {
  const indices: Record<string, number> = {};
  
  headers.forEach((h, i) => {
    if (typeof h !== 'string') return;
    const hLower = h.toLowerCase();
    
    if (/company|name/i.test(hLower) && !indices.company) indices.company = i;
    if (/ticker|symbol/i.test(hLower)) indices.ticker = i;
    if (/ev\/rev|revenue\s*mult|rev\s*mult/i.test(hLower)) indices.revMultiple = i;
    if (/ev\/ebitda|ebitda\s*mult/i.test(hLower)) indices.ebitdaMultiple = i;
    if (/\brevenue\b/i.test(hLower) && !/mult/i.test(hLower)) indices.revenue = i;
    if (/\bebitda\b/i.test(hLower) && !/mult/i.test(hLower)) indices.ebitda = i;
    if (/enterprise.*value|\bev\b/i.test(hLower)) indices.ev = i;
  });
  
  return indices;
}

function extractTicker(row: unknown[], indices: Record<string, number>): string | null {
  if (indices.ticker !== undefined) {
    const val = row[indices.ticker];
    if (typeof val === 'string' && val.length <= 6) {
      return val.trim().toUpperCase();
    }
  }
  
  // Try to find ticker pattern in row
  for (const cell of row) {
    if (typeof cell === 'string' && /^[A-Z]{2,5}$/.test(cell.trim())) {
      return cell.trim();
    }
  }
  
  return null;
}

function extractMultiple(
  row: unknown[],
  indices: Record<string, number>,
  type: 'revenue' | 'ebitda'
): number | null {
  const key = type === 'revenue' ? 'revMultiple' : 'ebitdaMultiple';
  
  if (indices[key] !== undefined) {
    const val = row[indices[key]];
    if (typeof val === 'number' && val > 0 && val < 100) {
      return Math.round(val * 100) / 100;
    }
  }
  
  return null;
}

function extractFinancialValue(
  row: unknown[],
  indices: Record<string, number>,
  type: string
): number | null {
  if (indices[type] !== undefined) {
    const val = row[indices[type]];
    if (typeof val === 'number') {
      return val;
    }
  }
  return null;
}

function isHeaderOrLabel(text: string): boolean {
  const labelPatterns = [
    /^total/i, /^average/i, /^median/i, /^mean/i, /^selected/i,
    /^applied/i, /^conclusion/i, /^summary/i, /^notes/i
  ];
  return labelPatterns.some(p => p.test(text.trim()));
}

/**
 * Extract guideline transaction data
 */
function extractGuidelineTransactions(
  workbook: WorkbookData,
  missingData: string[]
): GuidelineTransaction[] {
  const sheets = findSheets(workbook, [
    /transaction/i, /m&a/i, /merger/i, /acquisition/i, /gtm/i, /deal/i
  ]);
  
  if (sheets.length === 0) {
    missingData.push('Guideline transaction sheet not found');
    return [];
  }
  
  const transactions: GuidelineTransaction[] = [];
  
  for (const sheetName of sheets) {
    const data = getSheetData(workbook, sheetName);
    
    const headerRow = findHeaderRow(data, [/target/i, /company/i, /deal/i]);
    
    if (headerRow !== null) {
      const headers = data[headerRow] as string[];
      
      for (let row = headerRow + 1; row < Math.min(headerRow + 25, data.length); row++) {
        const rowData = data[row] || [];
        
        // Find target name column
        let targetName: string | null = null;
        const targetIdx = headers.findIndex(h => /target|company|name/i.test(String(h)));
        if (targetIdx >= 0 && typeof rowData[targetIdx] === 'string') {
          targetName = (rowData[targetIdx] as string).trim();
        }
        
        if (targetName && targetName.length > 2 && !isHeaderOrLabel(targetName)) {
          const transaction: GuidelineTransaction = {
            targetName,
            acquirerName: null,
            transactionDate: null,
            dealValue: null,
            revenueMultiple: null,
            ebitdaMultiple: null,
            targetRevenue: null,
            targetEbitda: null,
            description: null,
          };
          
          // Look for multiples in the row
          for (let col = 0; col < rowData.length; col++) {
            const val = rowData[col];
            const header = String(headers[col] ?? '').toLowerCase();
            
            if (typeof val === 'number') {
              if (/ev\/rev|rev.*mult/i.test(header) && val > 0 && val < 50) {
                transaction.revenueMultiple = val;
              }
              if (/ev\/ebitda|ebitda.*mult/i.test(header) && val > 0 && val < 50) {
                transaction.ebitdaMultiple = val;
              }
              if (/deal.*value|transaction.*value|ev\b/i.test(header) && val > 1000000) {
                transaction.dealValue = val;
              }
            }
          }
          
          if (transaction.revenueMultiple || transaction.ebitdaMultiple) {
            transactions.push(transaction);
          }
        }
      }
    }
    
    if (transactions.length > 0) break;
  }
  
  if (transactions.length === 0) {
    missingData.push('No guideline transactions extracted');
  }
  
  return transactions;
}

/**
 * Extract income approach (DCF) data
 */
function extractIncomeApproachData(
  workbook: WorkbookData,
  missingData: string[]
): IncomeApproachData | null {
  const sheets = findSheets(workbook, [
    /income/i, /dcf/i, /discount.*cash/i, /cash.*flow/i
  ]);
  
  if (sheets.length === 0) {
    missingData.push('Income approach / DCF sheet not found');
    return null;
  }
  
  const incomeData: IncomeApproachData = {
    projectionYears: null,
    projectionStartYear: null,
    revenueProjections: [],
    ebitdaProjections: [],
    cashFlowProjections: [],
    discountRate: null,
    wacc: null,
    terminalGrowthRate: null,
    terminalMultiple: null,
    terminalMethodology: null,
    presentValueCashFlows: null,
    terminalValue: null,
    presentValueTerminal: null,
    indicatedValue: null,
    keyAssumptions: [],
  };
  
  for (const sheetName of sheets) {
    const data = getSheetData(workbook, sheetName);
    
    // Find discount rate / WACC
    incomeData.discountRate ??= findValueNearLabel(data, [
      /discount\s*rate/i, /wacc/i, /weighted.*average.*cost/i
    ], { minValue: 0.05, maxValue: 0.50 }) as number | null;
    
    incomeData.wacc ??= incomeData.discountRate;
    
    // Terminal growth rate
    incomeData.terminalGrowthRate ??= findValueNearLabel(data, [
      /terminal.*growth/i, /perpetuity.*growth/i, /long.*term.*growth/i
    ], { minValue: 0.01, maxValue: 0.10 }) as number | null;
    
    // Terminal multiple
    incomeData.terminalMultiple ??= findValueNearLabel(data, [
      /exit.*multiple/i, /terminal.*multiple/i
    ], { minValue: 1, maxValue: 30 }) as number | null;
    
    // Indicated value
    incomeData.indicatedValue ??= findValueNearLabel(data, [
      /indicated.*value/i, /enterprise.*value/i, /equity.*value/i, /concluded/i
    ], { minValue: 100000 }) as number | null;
    
    // Determine terminal methodology
    if (incomeData.terminalGrowthRate) {
      incomeData.terminalMethodology = 'perpetuity';
    } else if (incomeData.terminalMultiple) {
      incomeData.terminalMethodology = 'exitMultiple';
    }
    
    // Extract projections
    incomeData.revenueProjections = extractProjections(data, /revenue/i);
    incomeData.cashFlowProjections = extractProjections(data, /cash\s*flow|fcf|cf/i);
  }
  
  if (!incomeData.discountRate) {
    missingData.push('Discount rate / WACC not found');
  }
  
  return incomeData;
}

function extractProjections(data: unknown[][], metricPattern: RegExp): YearlyProjection[] {
  const projections: YearlyProjection[] = [];
  
  for (let row = 0; row < Math.min(50, data.length); row++) {
    const rowData = data[row] || [];
    const firstCell = rowData[0];
    
    if (typeof firstCell === 'string' && metricPattern.test(firstCell)) {
      // Look for year headers and values
      for (let col = 1; col < Math.min(15, rowData.length); col++) {
        const val = rowData[col];
        if (typeof val === 'number' && Math.abs(val) > 100) {
          // Check if there's a year in the header row
          const headerRow = data[row - 1] || data[0] || [];
          const yearCell = headerRow[col];
          let year = 2024 + col; // Default guess
          
          if (typeof yearCell === 'number' && yearCell > 2000 && yearCell < 2100) {
            year = yearCell;
          } else if (typeof yearCell === 'string') {
            const yearMatch = yearCell.match(/20\d{2}/);
            if (yearMatch) year = parseInt(yearMatch[0]);
          }
          
          projections.push({ year, value: val });
        }
      }
      break;
    }
  }
  
  return projections;
}

/**
 * Extract backsolve / recent transaction data
 */
function extractBacksolveData(
  workbook: WorkbookData,
  missingData: string[]
): BacksolveData | null {
  const sheets = findSheets(workbook, [
    /backsolve/i, /opm/i, /option.*pricing/i, /recent.*transaction/i, /funding/i
  ]);
  
  if (sheets.length === 0) {
    missingData.push('Backsolve / OPM sheet not found');
    return null;
  }
  
  const backsolve: BacksolveData = {
    transactionDate: null,
    securityType: null,
    pricePerShare: null,
    sharesIssued: null,
    transactionAmount: null,
    preMoneyValuation: null,
    postMoneyValuation: null,
    impliedEquityValue: null,
    volatility: null,
    riskFreeRate: null,
    timeToLiquidity: null,
    indicatedCommonValue: null,
    indicatedPerShareValue: null,
    methodology: null,
  };
  
  for (const sheetName of sheets) {
    const data = getSheetData(workbook, sheetName);
    
    // Volatility
    backsolve.volatility ??= findValueNearLabel(data, [
      /volatility/i
    ], { minValue: 0.20, maxValue: 1.50 }) as number | null;
    
    // Risk-free rate
    backsolve.riskFreeRate ??= findValueNearLabel(data, [
      /risk.*free/i, /rf/i
    ], { minValue: 0.01, maxValue: 0.10 }) as number | null;
    
    // Time to liquidity
    backsolve.timeToLiquidity ??= findValueNearLabel(data, [
      /time.*liquidity/i, /term/i, /years/i
    ], { minValue: 0.5, maxValue: 10 }) as number | null;
    
    // Transaction details
    backsolve.pricePerShare ??= findValueNearLabel(data, [
      /price.*share/i, /pps/i
    ], { minValue: 0.01 }) as number | null;
    
    backsolve.postMoneyValuation ??= findValueNearLabel(data, [
      /post.*money/i, /post-money/i
    ], { minValue: 100000 }) as number | null;
    
    backsolve.indicatedCommonValue ??= findValueNearLabel(data, [
      /common.*value/i, /indicated.*value/i, /fair.*value/i
    ], { minValue: 0.01 }) as number | null;
    
    // Determine methodology
    if (sheetName.toLowerCase().includes('opm') || backsolve.volatility) {
      backsolve.methodology = 'opm';
    } else if (sheetName.toLowerCase().includes('backsolve')) {
      backsolve.methodology = 'backsolve';
    }
  }
  
  if (!backsolve.volatility && !backsolve.pricePerShare) {
    missingData.push('Backsolve key inputs not found');
  }
  
  return backsolve;
}

/**
 * Extract weighting and conclusion data
 */
function extractWeightingData(
  workbook: WorkbookData,
  missingData: string[]
): WeightingData | null {
  const sheets = findSheets(workbook, [
    /summary/i, /conclusion/i, /valuation/i, /weight/i
  ]);
  
  if (sheets.length === 0) {
    missingData.push('Valuation summary sheet not found');
    return null;
  }
  
  const weighting: WeightingData = {
    approaches: [],
    concludedEnterpriseValue: null,
    concludedEquityValue: null,
    dlomPercentage: null,
    dlomMethod: null,
    valueAfterDlom: null,
    sharesOutstanding: null,
    perShareValue: null,
    perShareValueAfterDlom: null,
  };
  
  // Approach patterns to look for
  const approachPatterns = [
    { pattern: /guideline.*public|gpc/i, name: 'Guideline Public Company Method' },
    { pattern: /guideline.*transaction|m&a|gtm/i, name: 'Guideline Transaction Method' },
    { pattern: /income.*approach|dcf/i, name: 'Income Approach (DCF)' },
    { pattern: /backsolve|opm/i, name: 'OPM Backsolve' },
    { pattern: /market.*approach/i, name: 'Market Approach' },
  ];
  
  for (const sheetName of sheets) {
    const data = getSheetData(workbook, sheetName);
    
    for (let row = 0; row < Math.min(100, data.length); row++) {
      const rowData = data[row] || [];
      
      for (let col = 0; col < rowData.length; col++) {
        const cell = rowData[col];
        
        if (typeof cell === 'string') {
          // Check for approach patterns
          for (const { pattern, name } of approachPatterns) {
            if (pattern.test(cell) && !weighting.approaches.find(a => a.name === name)) {
              let indicatedValue: number | null = null;
              let weight: number | null = null;
              
              // Look for values in same row
              for (let c = col + 1; c < Math.min(col + 8, rowData.length); c++) {
                const val = rowData[c];
                if (typeof val === 'number') {
                  if (!indicatedValue && val > 10000) {
                    indicatedValue = val;
                  } else if (!weight && val > 0 && val <= 1) {
                    weight = val;
                  } else if (!weight && val > 0 && val <= 100) {
                    weight = val / 100;
                  }
                }
              }
              
              if (indicatedValue !== null) {
                weighting.approaches.push({
                  name,
                  indicatedValue,
                  weight: weight ?? 0,
                  weightedValue: indicatedValue * (weight ?? 0),
                });
              }
            }
          }
          
          // Concluded value
          if (/concluded.*value|weighted.*average|total.*value/i.test(cell)) {
            for (let c = col + 1; c < Math.min(col + 5, rowData.length); c++) {
              const val = rowData[c];
              if (typeof val === 'number' && val > 10000) {
                weighting.concludedEnterpriseValue = val;
                break;
              }
            }
          }
          
          // DLOM
          if (/dlom|discount.*lack.*marketability/i.test(cell)) {
            for (let c = col + 1; c < Math.min(col + 5, rowData.length); c++) {
              const val = rowData[c];
              if (typeof val === 'number') {
                if (val > 0 && val < 1) {
                  weighting.dlomPercentage = val;
                } else if (val > 0 && val < 100) {
                  weighting.dlomPercentage = val / 100;
                }
                break;
              }
            }
          }
          
          // Value after DLOM
          if (/after.*dlom|marketable.*minority/i.test(cell)) {
            for (let c = col + 1; c < Math.min(col + 5, rowData.length); c++) {
              const val = rowData[c];
              if (typeof val === 'number' && val > 1000) {
                weighting.valueAfterDlom = val;
                break;
              }
            }
          }
          
          // Per share value
          if (/per.*share|price.*share/i.test(cell)) {
            for (let c = col + 1; c < Math.min(col + 5, rowData.length); c++) {
              const val = rowData[c];
              if (typeof val === 'number' && val > 0 && val < 10000) {
                weighting.perShareValue = val;
                break;
              }
            }
          }
        }
      }
    }
    
    if (weighting.approaches.length > 0) break;
  }
  
  if (weighting.approaches.length === 0) {
    missingData.push('No valuation approach weightings found');
  }
  
  return weighting;
}

