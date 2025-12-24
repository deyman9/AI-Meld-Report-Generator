/**
 * Narrative Types for Valuation Report Generation
 */

import type { ApproachData } from "./excel";

// Complete set of narratives for a report
export interface NarrativeSet {
  companyOverview: string;
  industryOutlook: string;
  economicOutlook: string;
  approachNarratives: ApproachNarrative[];
  conclusion: string;
  warnings: string[];
  generatedAt: Date;
}

// Narrative for a specific valuation approach
export interface ApproachNarrative {
  approachName: string;
  approachType: ApproachType;
  narrative: string;
  confidence: "high" | "medium" | "low";
}

// Types of valuation approaches
export type ApproachType =
  | "guideline_public_company"
  | "guideline_transaction"
  | "income_dcf"
  | "income_ccf"
  | "backsolve"
  | "opm"
  | "asset"
  | "other";

// Weight data for approach weighting
export interface WeightData {
  approachName: string;
  weight: number;
  rationale?: string;
}

// Weighting heuristics result
export interface WeightingAnalysis {
  suggestedWeights: WeightData[];
  rationale: string;
  warnings: string[];
  appliedHeuristics: string[];
}

// Context for narrative generation
export interface NarrativeContext {
  companyName: string;
  valuationDate: string;
  reportType: "FOUR09A" | "FIFTY_NINE_SIXTY";
  /** @deprecated Use qualitativeContext instead */
  voiceTranscript?: string;
  qualitativeContext?: string;
  companyDescription?: string;
  industry?: string;
}

// Approach data with additional context
export interface ApproachDataWithContext extends ApproachData {
  type?: ApproachType;
  details?: Record<string, unknown>;
}

