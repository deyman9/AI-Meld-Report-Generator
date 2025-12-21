import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import type { 
  WorkbookData, 
  SheetInfo, 
  CellValue, 
  ExhibitBoundaries,
  CompanyInfo,
  ExhibitData,
  SummaryData,
  ApproachData
} from '@/types/excel';

/**
 * Loads an Excel workbook from disk
 */
export async function loadWorkbook(filePath: string): Promise<WorkbookData> {
  try {
    const buffer = readFileSync(filePath);
    const rawWorkbook = XLSX.read(buffer, { 
      type: 'buffer',
      cellDates: true,
      cellNF: true,
    });

    const sheets: SheetInfo[] = rawWorkbook.SheetNames.map((name, index) => ({
      name,
      index,
    }));

    return {
      sheets,
      rawWorkbook,
    };
  } catch (error) {
    throw new Error(`Failed to load workbook: ${error}`);
  }
}

/**
 * Returns array of all sheet names
 */
export function getSheetNames(workbook: WorkbookData): string[] {
  return workbook.sheets.map(s => s.name);
}

/**
 * Finds sheets named "start" and "end" (case-insensitive)
 * Returns their indices, or null if not found
 */
export function findExhibitBoundaries(workbook: WorkbookData): ExhibitBoundaries | null {
  const sheets = workbook.sheets;
  
  let startIndex = -1;
  let endIndex = -1;

  for (const sheet of sheets) {
    const nameLower = sheet.name.toLowerCase().trim();
    if (nameLower === 'start') {
      startIndex = sheet.index;
    } else if (nameLower === 'end') {
      endIndex = sheet.index;
    }
  }

  if (startIndex === -1 || endIndex === -1) {
    return null;
  }

  return { startIndex, endIndex };
}

/**
 * Gets value from a specific cell
 */
export function getCellValue(
  workbook: WorkbookData, 
  sheetName: string, 
  cellAddress: string
): CellValue {
  const sheet = workbook.rawWorkbook.Sheets[sheetName];
  if (!sheet) {
    return null;
  }

  const cell = sheet[cellAddress];
  if (!cell) {
    return null;
  }

  // Handle different cell types
  if (cell.t === 'd' && cell.v instanceof Date) {
    return cell.v;
  } else if (cell.t === 'n') {
    // Check if it's a date stored as Excel serial number
    if (cell.w && /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(cell.w)) {
      return XLSX.SSF.parse_date_code(cell.v);
    }
    return cell.v as number;
  } else if (cell.t === 's') {
    return cell.v as string;
  } else if (cell.t === 'b') {
    return cell.v ? 'TRUE' : 'FALSE';
  }

  return cell.v ?? null;
}

/**
 * Gets all data from a sheet as 2D array
 */
export function getSheetData(workbook: WorkbookData, sheetName: string): unknown[][] {
  const sheet = workbook.rawWorkbook.Sheets[sheetName];
  if (!sheet) {
    return [];
  }

  const data = XLSX.utils.sheet_to_json(sheet, { 
    header: 1,
    defval: null,
    raw: false,
  }) as unknown[][];

  return data;
}

/**
 * Extracts company name and valuation date from the model
 */
export function extractCompanyInfo(workbook: WorkbookData): CompanyInfo {
  // Try to find LEs sheet
  const leSheetNames = ['LEs', 'LE', 'Les', 'les', 'Liquidation Events'];
  let lesSheet: string | null = null;

  for (const name of leSheetNames) {
    if (workbook.rawWorkbook.Sheets[name]) {
      lesSheet = name;
      break;
    }
  }

  let companyName: string | null = null;
  let valuationDate: Date | null = null;

  if (lesSheet) {
    // Try G819 for company name
    const rawCompanyName = getCellValue(workbook, lesSheet, 'G819');
    if (typeof rawCompanyName === 'string') {
      companyName = rawCompanyName;
    }

    // Try G824 for valuation date
    const rawDate = getCellValue(workbook, lesSheet, 'G824');
    if (rawDate instanceof Date) {
      valuationDate = rawDate;
    } else if (typeof rawDate === 'number') {
      // Excel date serial number
      const excelDate = XLSX.SSF.parse_date_code(rawDate);
      if (excelDate) {
        valuationDate = new Date(excelDate.y, excelDate.m - 1, excelDate.d);
      }
    }
  }

  // If not found in LEs, try to find in other common locations
  if (!companyName) {
    // Try Cover or Summary sheets
    const coverSheets = ['Cover', 'Summary', 'Intro', 'Title'];
    for (const sheetName of coverSheets) {
      if (workbook.rawWorkbook.Sheets[sheetName]) {
        // Search first few rows for company name pattern
        const data = getSheetData(workbook, sheetName);
        for (let row = 0; row < Math.min(20, data.length); row++) {
          for (let col = 0; col < Math.min(10, (data[row] || []).length); col++) {
            const cell = data[row]?.[col];
            if (typeof cell === 'string' && cell.length > 5 && cell.length < 100) {
              // Could be company name if it's a reasonable length string
              if (!cell.toLowerCase().includes('valuation') && 
                  !cell.toLowerCase().includes('date') &&
                  !cell.toLowerCase().includes('prepared')) {
                companyName = cell;
                break;
              }
            }
          }
          if (companyName) break;
        }
        if (companyName) break;
      }
    }
  }

  return { companyName, valuationDate };
}

/**
 * Extracts exhibits between start and end sheets
 */
export function extractExhibits(workbook: WorkbookData): ExhibitData[] {
  const boundaries = findExhibitBoundaries(workbook);
  
  if (!boundaries) {
    // Return all sheets as exhibits if no boundaries found
    return workbook.sheets.map(sheet => ({
      sheetName: sheet.name,
      data: getSheetData(workbook, sheet.name),
      notes: findNotesInSheet(workbook, sheet.name),
    }));
  }

  const exhibits: ExhibitData[] = [];
  
  for (let i = boundaries.startIndex + 1; i < boundaries.endIndex; i++) {
    const sheet = workbook.sheets[i];
    if (sheet) {
      exhibits.push({
        sheetName: sheet.name,
        data: getSheetData(workbook, sheet.name),
        notes: findNotesInSheet(workbook, sheet.name),
      });
    }
  }

  return exhibits;
}

/**
 * Finds notes in a sheet by looking for "notes" label
 */
export function findNotesInSheet(workbook: WorkbookData, sheetName: string): string[] {
  const data = getSheetData(workbook, sheetName);
  const notes: string[] = [];

  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < (data[row] || []).length; col++) {
      const cell = data[row]?.[col];
      if (typeof cell === 'string' && cell.toLowerCase().includes('note')) {
        // Found notes label, look for content in adjacent cells
        // Check cells below
        for (let nextRow = row + 1; nextRow < Math.min(row + 10, data.length); nextRow++) {
          const noteContent = data[nextRow]?.[col];
          if (typeof noteContent === 'string' && noteContent.trim()) {
            notes.push(noteContent.trim());
          }
        }
        // Check cells to the right
        for (let nextCol = col + 1; nextCol < Math.min(col + 5, (data[row] || []).length); nextCol++) {
          const noteContent = data[row]?.[nextCol];
          if (typeof noteContent === 'string' && noteContent.trim()) {
            notes.push(noteContent.trim());
          }
        }
      }
    }
  }

  return [...new Set(notes)]; // Remove duplicates
}

/**
 * Extracts summary data from Summary sheet
 */
export function extractSummaryData(workbook: WorkbookData): SummaryData | null {
  const summarySheetNames = ['Summary', 'SUMMARY', 'Valuation Summary', 'Conclusion'];
  let summarySheet: string | null = null;

  for (const name of summarySheetNames) {
    if (workbook.rawWorkbook.Sheets[name]) {
      summarySheet = name;
      break;
    }
  }

  if (!summarySheet) {
    return null;
  }

  const data = getSheetData(workbook, summarySheet);
  const approaches: ApproachData[] = [];
  let concludedValue: number | null = null;

  // Common approach names to look for
  const approachPatterns = [
    { pattern: /guideline.*public.*compan|gpc/i, name: 'Guideline Public Company' },
    { pattern: /guideline.*transaction|m&a|merger/i, name: 'Guideline Transaction' },
    { pattern: /income|dcf|discount.*cash/i, name: 'Income Approach (DCF)' },
    { pattern: /backsolve|option.*pricing|opm/i, name: 'OPM Backsolve' },
    { pattern: /asset|cost/i, name: 'Asset Approach' },
    { pattern: /market/i, name: 'Market Approach' },
  ];

  // Scan for approaches and values
  for (let row = 0; row < data.length; row++) {
    const rowData = data[row] || [];
    
    for (let col = 0; col < rowData.length; col++) {
      const cell = rowData[col];
      
      if (typeof cell === 'string') {
        // Check for approach patterns
        for (const { pattern, name } of approachPatterns) {
          if (pattern.test(cell)) {
            // Look for value and weight in adjacent cells
            let indicatedValue: number | null = null;
            let weight: number | null = null;

            for (let searchCol = col + 1; searchCol < Math.min(col + 5, rowData.length); searchCol++) {
              const adjacentCell = rowData[searchCol];
              if (typeof adjacentCell === 'number') {
                if (indicatedValue === null && adjacentCell > 1000) {
                  indicatedValue = adjacentCell;
                } else if (weight === null && adjacentCell >= 0 && adjacentCell <= 1) {
                  weight = adjacentCell;
                }
              }
            }

            // Avoid duplicates
            if (!approaches.find(a => a.name === name)) {
              approaches.push({ name, indicatedValue, weight });
            }
          }
        }

        // Look for concluded value
        if (/concluded.*value|conclusion|final.*value|enterprise.*value/i.test(cell)) {
          for (let searchCol = col + 1; searchCol < Math.min(col + 5, rowData.length); searchCol++) {
            const adjacentCell = rowData[searchCol];
            if (typeof adjacentCell === 'number' && adjacentCell > 1000) {
              concludedValue = adjacentCell;
              break;
            }
          }
        }
      }
    }
  }

  return {
    approaches,
    concludedValue,
  };
}

/**
 * Extracts DLOM (Discount for Lack of Marketability) from exhibits
 */
export function extractDLOM(workbook: WorkbookData): number | null {
  const sheets = getSheetNames(workbook);

  for (const sheetName of sheets) {
    const data = getSheetData(workbook, sheetName);

    for (let row = 0; row < data.length; row++) {
      const rowData = data[row] || [];
      
      for (let col = 0; col < rowData.length; col++) {
        const cell = rowData[col];
        
        if (typeof cell === 'string' && /dlom|discount.*lack.*marketability/i.test(cell)) {
          // Look for percentage value in adjacent cells
          for (let searchCol = col + 1; searchCol < Math.min(col + 5, rowData.length); searchCol++) {
            const adjacentCell = rowData[searchCol];
            if (typeof adjacentCell === 'number') {
              // DLOM is typically between 0% and 50%
              if (adjacentCell > 0 && adjacentCell <= 0.5) {
                return adjacentCell;
              } else if (adjacentCell > 0 && adjacentCell <= 50) {
                return adjacentCell / 100; // Convert percentage to decimal
              }
            }
          }
        }
      }
    }
  }

  return null;
}

