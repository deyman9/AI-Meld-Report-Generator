import type { WorkBook } from 'xlsx';

export interface WorkbookData {
  sheets: SheetInfo[];
  rawWorkbook: WorkBook;
}

export interface SheetInfo {
  name: string;
  index: number;
}

export type CellValue = string | number | Date | null;

export interface ParsedModel {
  companyName: string | null;
  valuationDate: Date | null;
  exhibits: ExhibitData[];
  summary: SummaryData | null;
  dlom: number | null;
  errors: string[];
  warnings: string[];
}

export interface ExhibitData {
  sheetName: string;
  data: unknown[][];
  notes: string[];
}

export interface SummaryData {
  approaches: ApproachData[];
  concludedValue: number | null;
}

export interface ApproachData {
  name: string;
  indicatedValue: number | null;
  weight: number | null;
}

export interface ExhibitBoundaries {
  startIndex: number;
  endIndex: number;
}

export interface CompanyInfo {
  companyName: string | null;
  valuationDate: Date | null;
}

// API response format for parsed model
export interface ParsedModelResponse {
  companyName: string | null;
  valuationDate: string | null; // ISO format
  exhibitCount: number;
  exhibitNames: string[];
  approaches: ApproachData[];
  concludedValue: number | null;
  dlom: number | null;
  warnings: string[];
  errors: string[];
}

