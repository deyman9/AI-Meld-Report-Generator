/**
 * Test Data Utilities for Integration Testing
 * 
 * This file provides sample data for testing all flows in the application.
 * Used for integration testing and development verification.
 */

import type { ParsedModel, ApproachData, SummaryData, ExhibitData } from "@/types/excel";
import type { ReportContent, SectionContent, Flag } from "@/types/generation";
import type { CompanyResearch, IndustryResearch, Citation } from "@/types/research";
import type { NarrativeSet, ApproachNarrative, WeightData } from "@/types/narrative";

// ============================================
// Sample Company Data
// ============================================

export const sampleCompanies = {
  techStartup: {
    name: "TechVenture Inc.",
    industry: "Enterprise Software",
    description: "A B2B SaaS company providing cloud-based project management solutions",
    valuationDate: new Date("2024-03-31"),
  },
  healthcareCompany: {
    name: "MedHealth Solutions LLC",
    industry: "Healthcare Technology",
    description: "Digital health platform for patient engagement and telehealth services",
    valuationDate: new Date("2024-06-30"),
  },
  manufacturingCompany: {
    name: "Precision Manufacturing Corp",
    industry: "Industrial Manufacturing",
    description: "Specialized manufacturing of aerospace components",
    valuationDate: new Date("2024-09-30"),
  },
};

// ============================================
// Mock Excel Model Data
// ============================================

export function createMockApproachData(overrides?: Partial<ApproachData>): ApproachData {
  return {
    name: "Guideline Public Company Method",
    indicatedValue: 15000000,
    weight: 0.40,
    ...overrides,
  };
}

export function createMockSummaryData(overrides?: Partial<SummaryData>): SummaryData {
  return {
    approaches: [
      createMockApproachData({ name: "Guideline Public Company Method", weight: 0.35 }),
      createMockApproachData({ name: "Guideline Transaction Method", indicatedValue: 14500000, weight: 0.25 }),
      createMockApproachData({ name: "Discounted Cash Flow", indicatedValue: 16000000, weight: 0.25 }),
      createMockApproachData({ name: "Option Pricing Method", indicatedValue: 13500000, weight: 0.15 }),
    ],
    concludedValue: 15125000,
    ...overrides,
  };
}

export function createMockExhibitData(overrides?: Partial<ExhibitData>): ExhibitData {
  return {
    sheetName: "Exhibit A - Guideline Companies",
    data: [
      ["Company", "Revenue ($M)", "EBITDA ($M)", "EV/Revenue", "EV/EBITDA"],
      ["Comparable 1", 50, 10, 5.2, 15.0],
      ["Comparable 2", 75, 15, 4.8, 12.0],
      ["Comparable 3", 100, 20, 5.0, 14.0],
    ],
    notes: ["Selected based on industry and size criteria", "Adjusted for marketability"],
    ...overrides,
  };
}

export function createMockParsedModel(overrides?: Partial<ParsedModel>): ParsedModel {
  return {
    companyName: "TechVenture Inc.",
    valuationDate: new Date("2024-03-31"),
    exhibits: [
      createMockExhibitData({ sheetName: "Exhibit A - Guideline Companies" }),
      createMockExhibitData({ sheetName: "Exhibit B - M&A Transactions" }),
      createMockExhibitData({ sheetName: "Exhibit C - DCF Analysis" }),
    ],
    summary: createMockSummaryData(),
    dlom: 0.20,
    errors: [],
    warnings: [],
    ...overrides,
  };
}

// Model with missing data for testing warnings
export function createMockParsedModelWithWarnings(): ParsedModel {
  return createMockParsedModel({
    companyName: null, // Missing company name
    dlom: null, // Missing DLOM
    warnings: [
      "Company name not found in expected cell (LEs!G819)",
      "DLOM value not found in exhibits",
    ],
    errors: [],
  });
}

// ============================================
// Mock Research Data
// ============================================

export function createMockCompanyResearch(overrides?: Partial<CompanyResearch>): CompanyResearch {
  return {
    companyName: "TechVenture Inc.",
    companyDescription: "TechVenture Inc. is an enterprise software company that provides cloud-based project management and collaboration solutions to mid-market and enterprise customers.",
    businessModel: "Subscription-based SaaS model with annual contracts and tiered pricing based on user count and feature access.",
    products: [
      "Project Management Platform",
      "Team Collaboration Suite",
      "Resource Planning Module",
      "Analytics Dashboard",
    ],
    revenueStreams: "Primary revenue from subscription fees (85%), professional services (10%), and custom development (5%).",
    targetMarket: "Mid-market and enterprise companies with 100-5,000 employees, primarily in technology, professional services, and financial services sectors.",
    competitivePosition: "TechVenture occupies a niche position in the market, competing with larger players like Asana and Monday.com while offering more enterprise-focused features and customization options.",
    recentDevelopments: "Recently launched AI-powered project forecasting features and expanded into European markets in Q4 2023.",
    keyFacts: [
      "Founded in 2018",
      "Approximately 150 employees",
      "Headquarters in San Francisco, CA",
      "Series B funded with $25M raised",
      "Annual recurring revenue of $15M",
    ],
    industry: "Enterprise Software / SaaS",
    confidence: "high",
    limitedInfo: false,
    warnings: [],
    ...overrides,
  };
}

export function createMockIndustryResearch(overrides?: Partial<IndustryResearch>): IndustryResearch {
  return {
    industryName: "Enterprise Software / SaaS",
    overview: "The enterprise software industry encompasses companies that develop, market, and support software solutions designed for business and organizational use. The sector has experienced significant growth driven by digital transformation initiatives and cloud adoption.",
    marketSize: "The global enterprise software market was valued at approximately $250 billion in 2023 and is expected to reach $400 billion by 2028.",
    growthRate: "The market is projected to grow at a CAGR of 10-12% through 2028, with cloud-based solutions growing faster at 15-18% CAGR.",
    keyDrivers: [
      "Accelerated digital transformation across industries",
      "Shift from on-premise to cloud-based solutions",
      "Increased focus on remote work capabilities",
      "Growing demand for AI and automation features",
      "Rising cybersecurity concerns driving security investments",
    ],
    competitiveLandscape: "The market is characterized by a mix of large established players (Microsoft, Salesforce, SAP) and numerous specialized vendors. Competition is intense, with differentiation occurring through feature innovation, vertical specialization, and customer experience.",
    regulatoryEnvironment: "Key regulatory considerations include data privacy (GDPR, CCPA), industry-specific compliance requirements (HIPAA, SOX), and emerging AI regulations. Companies must invest in compliance infrastructure.",
    recentTrends: [
      "AI/ML integration becoming table stakes",
      "Vertical-specific SaaS solutions gaining traction",
      "Product-led growth strategies becoming prevalent",
      "Increased M&A activity as larger players consolidate",
      "Focus on platform ecosystems and integrations",
    ],
    majorPlayers: [
      "Microsoft (Teams, Dynamics 365)",
      "Salesforce (CRM, Platform)",
      "SAP (ERP, Business Suite)",
      "ServiceNow (IT Service Management)",
      "Workday (HCM, Finance)",
    ],
    outlook: "The industry outlook remains positive with continued investment in digital capabilities. However, economic uncertainty may lead to longer sales cycles and increased scrutiny of software spending. Companies with strong unit economics and clear ROI demonstrations are expected to outperform.",
    citations: [
      { text: "Global enterprise software market valuation", source: "Gartner Market Research, 2023", footnoteNumber: 1 },
      { text: "Cloud software growth projections", source: "IDC Software Forecast, 2024", footnoteNumber: 2 },
      { text: "Digital transformation spending trends", source: "McKinsey Digital Survey, 2023", footnoteNumber: 3 },
    ],
    confidence: "high",
    ...overrides,
  };
}

export function createMockCitation(overrides?: Partial<Citation>): Citation {
  return {
    text: "Industry market size and growth data",
    source: "Industry Research Report, 2024",
    footnoteNumber: 1,
    ...overrides,
  };
}

// ============================================
// Mock Narrative Data
// ============================================

export function createMockApproachNarrative(overrides?: Partial<ApproachNarrative>): ApproachNarrative {
  return {
    approachName: "Guideline Public Company Method",
    approachType: "guideline_public_company",
    narrative: "The Guideline Public Company Method was utilized to estimate the fair market value of TechVenture Inc.'s equity. This approach analyzes publicly traded companies with similar business characteristics to derive appropriate valuation multiples.\n\nWe identified and analyzed a set of comparable companies in the enterprise software sector, focusing on SaaS businesses with similar revenue profiles, growth rates, and market positioning. The selected comparables included companies with annual revenues ranging from $50 million to $200 million, primarily serving B2B customers.\n\nBased on our analysis of the comparable set, we applied enterprise value to revenue multiples ranging from 4.5x to 6.0x, with a selected multiple of 5.0x based on TechVenture's growth profile and market position. This resulted in an indicated enterprise value of approximately $15 million.",
    confidence: "high",
    ...overrides,
  };
}

export function createMockNarrativeSet(overrides?: Partial<NarrativeSet>): NarrativeSet {
  return {
    companyOverview: "TechVenture Inc. is an enterprise software company founded in 2018, headquartered in San Francisco, California. The Company provides cloud-based project management and collaboration solutions to mid-market and enterprise customers through a subscription-based SaaS model.",
    industryOutlook: "The enterprise software industry has experienced significant growth driven by digital transformation initiatives. The global market is valued at approximately $250 billion and is projected to grow at a CAGR of 10-12% through 2028.",
    economicOutlook: "The U.S. economy continued to demonstrate resilience in Q1 2024, with GDP growth of 2.5% and stable employment figures. Interest rates remained elevated, with the Federal Reserve maintaining rates at current levels.",
    approachNarratives: [
      createMockApproachNarrative({ approachName: "Guideline Public Company Method" }),
      createMockApproachNarrative({ 
        approachName: "Guideline Transaction Method", 
        approachType: "guideline_transaction",
        narrative: "The Guideline Transaction Method considers recent M&A transactions involving similar companies to derive valuation benchmarks.",
      }),
      createMockApproachNarrative({ 
        approachName: "Discounted Cash Flow", 
        approachType: "income_dcf",
        narrative: "The Discounted Cash Flow method estimates value based on projected future cash flows discounted to present value using an appropriate discount rate.",
      }),
    ],
    conclusion: "Based on our analysis of the various valuation approaches, we have concluded a fair market value of $15,125,000 for TechVenture Inc. as of March 31, 2024. The Guideline Public Company Method was weighted most heavily due to the availability of relevant comparable companies.",
    warnings: [],
    generatedAt: new Date(),
    ...overrides,
  };
}

export function createMockWeightData(overrides?: Partial<WeightData>): WeightData {
  return {
    approachName: "Guideline Public Company Method",
    weight: 0.40,
    rationale: "Strong comparable set with relevant public companies",
    ...overrides,
  };
}

// ============================================
// Mock Report Content
// ============================================

export function createMockSectionContent(overrides?: Partial<SectionContent>): SectionContent {
  return {
    content: "This is sample section content for testing purposes.",
    source: "ai",
    confidence: 0.85,
    warnings: [],
    ...overrides,
  };
}

export function createMockFlag(overrides?: Partial<Flag>): Flag {
  return {
    section: "Company Overview",
    message: "Company name was not found in the model and was inferred from context",
    type: "review",
    ...overrides,
  };
}

export function createMockReportContent(overrides?: Partial<ReportContent>): ReportContent {
  const narrativeSet = createMockNarrativeSet();
  
  return {
    companyName: "TechVenture Inc.",
    valuationDate: new Date("2024-03-31"),
    reportType: "FOUR09A",
    companyOverview: createMockSectionContent({ content: narrativeSet.companyOverview }),
    industryOutlook: createMockSectionContent({ content: narrativeSet.industryOutlook }),
    economicOutlook: createMockSectionContent({ content: narrativeSet.economicOutlook, source: "stored" }),
    valuationAnalysis: {
      "Guideline Public Company Method": createMockSectionContent({ 
        content: narrativeSet.approachNarratives[0].narrative 
      }),
    },
    conclusion: createMockSectionContent({ content: narrativeSet.conclusion }),
    approachNarratives: narrativeSet.approachNarratives,
    industryCitations: createMockIndustryResearch().citations,
    flags: [],
    warnings: [],
    generatedAt: new Date(),
    generationDuration: 45000,
    ...overrides,
  };
}

// ============================================
// Mock Template Data
// ============================================

export const mockTemplateData = {
  placeholders: [
    "*COMPANY",
    "*VALUATIONDATE",
    "*REPORTDATE",
    "*CONCLUDED_VALUE",
    "*DLOM",
    "*INDUSTRY",
  ],
  sections: [
    { name: "Title Page", type: "substitution" as const },
    { name: "Executive Summary", type: "boilerplate" as const },
    { name: "Company Overview", type: "generated" as const },
    { name: "Industry Outlook", type: "generated" as const },
    { name: "Economic Outlook", type: "stored" as const },
    { name: "Valuation Analysis", type: "generated" as const },
    { name: "Conclusion", type: "generated" as const },
    { name: "Exhibits", type: "boilerplate" as const },
  ],
};

// ============================================
// Test Scenarios
// ============================================

export const testScenarios = {
  // Successful 409A report generation
  success409A: {
    reportType: "FOUR09A" as const,
    parsedModel: createMockParsedModel(),
    expectedStatus: "COMPLETE",
  },
  
  // Successful 59-60 report generation
  success5960: {
    reportType: "FIFTY_NINE_SIXTY" as const,
    parsedModel: createMockParsedModel({
      companyName: "Estate Holdings LLC",
    }),
    expectedStatus: "COMPLETE",
  },
  
  // Missing data scenario
  missingData: {
    reportType: "FOUR09A" as const,
    parsedModel: createMockParsedModelWithWarnings(),
    expectedWarnings: ["Company name not found", "DLOM value not found"],
  },
  
  // No exhibits found
  noExhibits: {
    reportType: "FOUR09A" as const,
    parsedModel: createMockParsedModel({
      exhibits: [],
      warnings: ["No exhibits found between start and end markers"],
    }),
  },
};

// ============================================
// Voice Transcript Samples
// ============================================

export const sampleVoiceTranscripts = {
  detailed: `
    Okay so for this engagement, TechVenture is a SaaS company, they're doing about 15 million ARR.
    They raised their Series B about 8 months ago at a 45 million valuation, so that's still pretty recent.
    For comps, I'm using similar B2B SaaS companies in the project management space.
    The DCF was tricky because they just turned cash flow positive, so I weighted that a bit lower.
    I think the backsolve from the recent round should get heavier weight given how recent it is.
    One thing to note - they're expanding into Europe so there's some additional risk there.
  `,
  
  brief: `
    Standard 409A, company is a mid-stage SaaS. Recent Series B.
    Good comp set available. DCF looked reasonable.
  `,
  
  empty: "",
};

// ============================================
// File Upload Test Data
// ============================================

export const fileUploadTestCases = {
  validExcel: {
    fileName: "valuation_model.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 1024 * 500, // 500KB
    expectedResult: "success",
  },
  invalidType: {
    fileName: "document.pdf",
    mimeType: "application/pdf",
    size: 1024 * 100,
    expectedResult: "error",
    expectedError: "Invalid file type",
  },
  tooLarge: {
    fileName: "large_model.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    size: 1024 * 1024 * 60, // 60MB
    expectedResult: "error",
    expectedError: "File too large",
  },
};

// ============================================
// Utility Functions for Testing
// ============================================

/**
 * Generate a random engagement ID for testing
 */
export function generateTestEngagementId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Create a date string in ISO format for testing
 */
export function createTestDateString(daysAgo = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

/**
 * Get the current quarter for testing
 */
export function getCurrentQuarter(): { quarter: number; year: number } {
  const now = new Date();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return { quarter, year: now.getFullYear() };
}

/**
 * Simulate API delay for testing
 */
export function simulateApiDelay(ms = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

