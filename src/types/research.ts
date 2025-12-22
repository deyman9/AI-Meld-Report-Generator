/**
 * Research Types for Company and Industry Research
 */

// Confidence level for research data
export type ResearchConfidence = "high" | "medium" | "low";

// Company research result
export interface CompanyResearch {
  companyName: string;
  companyDescription: string;
  businessModel: string;
  products: string[];
  revenueStreams: string;
  targetMarket: string;
  competitivePosition: string;
  recentDevelopments: string;
  keyFacts: string[];
  industry: string;
  confidence: ResearchConfidence;
  limitedInfo: boolean;
  warnings: string[];
}

// Industry research result
export interface IndustryResearch {
  industryName: string;
  overview: string;
  marketSize: string;
  growthRate: string;
  keyDrivers: string[];
  competitiveLandscape: string;
  regulatoryEnvironment: string;
  recentTrends: string[];
  majorPlayers: string[];
  outlook: string;
  citations: Citation[];
  confidence: ResearchConfidence;
}

// Citation for research sources
export interface Citation {
  text: string;
  source: string;
  footnoteNumber?: number;
}

// Raw parsed company research from AI
export interface ParsedCompanyResearch {
  companyDescription?: string;
  businessModel?: string;
  products?: string[];
  revenueStreams?: string;
  targetMarket?: string;
  competitivePosition?: string;
  recentDevelopments?: string;
  keyFacts?: string[];
  industry?: string;
  confidence?: string;
}

// Research request options
export interface ResearchOptions {
  includeIndustry?: boolean;
  maxRetries?: number;
  timeout?: number;
}

