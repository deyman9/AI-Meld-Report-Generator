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
  // Enhanced detailed data for AI narrative generation
  detailedData?: DetailedModelData;
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
  // Enhanced detailed data
  detailedData?: DetailedModelData;
}

// ============================================
// DETAILED MODEL DATA TYPES
// ============================================

/**
 * Complete detailed data extracted from valuation model
 */
export interface DetailedModelData {
  companyFinancials: CompanyFinancials | null;
  guidelinePublicCompanies: GuidelineCompany[];
  guidelineTransactions: GuidelineTransaction[];
  incomeApproachData: IncomeApproachData | null;
  backsolveData: BacksolveData | null;
  weightingData: WeightingData | null;
  missingData: string[];
}

/**
 * Subject company financial data
 */
export interface CompanyFinancials {
  // Revenue
  ltmRevenue: number | null;
  currentYearRevenue: number | null;
  projectedRevenue: number | null;
  
  // Profitability
  ltmEbitda: number | null;
  currentYearEbitda: number | null;
  grossProfit: number | null;
  grossMargin: number | null;
  netIncome: number | null;
  
  // Balance sheet
  totalAssets: number | null;
  totalEquity: number | null;
  totalDebt: number | null;
  cash: number | null;
  
  // Derived
  enterpriseValue: number | null;
  equityValue: number | null;
}

/**
 * Guideline public company data
 */
export interface GuidelineCompany {
  name: string;
  ticker: string | null;
  description: string | null;
  
  // Multiples
  revenueMultiple: number | null;
  ebitdaMultiple: number | null;
  grossProfitMultiple: number | null;
  
  // Financials (if available)
  revenue: number | null;
  ebitda: number | null;
  marketCap: number | null;
  enterpriseValue: number | null;
}

/**
 * Guideline public company analysis summary
 */
export interface GPCAnalysisSummary {
  companies: GuidelineCompany[];
  revenueMultipleRange: { low: number; high: number; median: number; mean: number } | null;
  ebitdaMultipleRange: { low: number; high: number; median: number; mean: number } | null;
  selectedRevenueMultiple: number | null;
  selectedEbitdaMultiple: number | null;
  indicatedValue: number | null;
  appliedMetric: 'revenue' | 'ebitda' | 'grossProfit' | null;
  appliedMetricValue: number | null;
}

/**
 * Guideline transaction (M&A) data
 */
export interface GuidelineTransaction {
  targetName: string;
  acquirerName: string | null;
  transactionDate: Date | null;
  dealValue: number | null;
  
  // Multiples
  revenueMultiple: number | null;
  ebitdaMultiple: number | null;
  
  // Details
  targetRevenue: number | null;
  targetEbitda: number | null;
  description: string | null;
}

/**
 * Guideline transaction analysis summary
 */
export interface TransactionAnalysisSummary {
  transactions: GuidelineTransaction[];
  revenueMultipleRange: { low: number; high: number; median: number; mean: number } | null;
  ebitdaMultipleRange: { low: number; high: number; median: number; mean: number } | null;
  selectedRevenueMultiple: number | null;
  selectedEbitdaMultiple: number | null;
  indicatedValue: number | null;
}

/**
 * Income approach (DCF) data
 */
export interface IncomeApproachData {
  // Projection period
  projectionYears: number | null;
  projectionStartYear: number | null;
  
  // Projections by year
  revenueProjections: YearlyProjection[];
  ebitdaProjections: YearlyProjection[];
  cashFlowProjections: YearlyProjection[];
  
  // Key assumptions
  discountRate: number | null;
  wacc: number | null;
  terminalGrowthRate: number | null;
  terminalMultiple: number | null;
  terminalMethodology: 'perpetuity' | 'exitMultiple' | null;
  
  // Results
  presentValueCashFlows: number | null;
  terminalValue: number | null;
  presentValueTerminal: number | null;
  indicatedValue: number | null;
  
  // Assumptions notes
  keyAssumptions: string[];
}

export interface YearlyProjection {
  year: number;
  value: number;
  growthRate?: number;
}

/**
 * Backsolve / Recent transaction data
 */
export interface BacksolveData {
  transactionDate: Date | null;
  securityType: string | null; // 'common', 'preferred', 'SAFE', 'convertible', etc.
  pricePerShare: number | null;
  sharesIssued: number | null;
  transactionAmount: number | null;
  
  // Valuation
  preMoneyValuation: number | null;
  postMoneyValuation: number | null;
  impliedEquityValue: number | null;
  
  // OPM details (if used)
  volatility: number | null;
  riskFreeRate: number | null;
  timeToLiquidity: number | null;
  
  // Result
  indicatedCommonValue: number | null;
  indicatedPerShareValue: number | null;
  methodology: 'backsolve' | 'opm' | 'pwerm' | 'cva' | null;
}

/**
 * Weighting and conclusion data
 */
export interface WeightingData {
  approaches: WeightedApproach[];
  concludedEnterpriseValue: number | null;
  concludedEquityValue: number | null;
  
  // DLOM
  dlomPercentage: number | null;
  dlomMethod: string | null;
  valueAfterDlom: number | null;
  
  // Per share (if applicable)
  sharesOutstanding: number | null;
  perShareValue: number | null;
  perShareValueAfterDlom: number | null;
}

export interface WeightedApproach {
  name: string;
  indicatedValue: number;
  weight: number;
  weightedValue: number;
  rationale?: string;
}

