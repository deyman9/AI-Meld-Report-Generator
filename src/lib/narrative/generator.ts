/**
 * Valuation Narrative Generator
 * Generates narrative sections for valuation reports using AI
 * 
 * Enhanced to use detailed data extraction for company-specific narratives
 */

import { generateText } from "@/lib/ai";
import {
  VALUATION_NARRATIVE_SYSTEM_PROMPT,
  buildGuidelineCompanyPrompt,
  buildMATransactionPrompt,
  buildIncomeApproachPrompt,
  buildConclusionPrompt,
  buildGenericApproachPrompt,
  canGenerateApproachSection,
  getDataAvailabilitySummary,
  type ExtendedNarrativeContext,
} from "@/lib/ai/prompts/valuationNarrative";
import type { ApproachData, ParsedModel, DetailedModelData } from "@/types/excel";
import type {
  NarrativeSet,
  ApproachNarrative,
  ApproachType,
  WeightData,
  WeightingAnalysis,
  ApproachSelection,
} from "@/types/narrative";

/**
 * Identify the type of valuation approach from its name
 * Note: Backsolve/OPM uses templated language, not AI-generated narratives
 */
export function identifyApproachType(approachName: string): ApproachType {
  const name = approachName.toLowerCase();

  if (name.includes("guideline") && name.includes("public")) {
    return "guideline_public_company";
  }
  if (name.includes("transaction") || name.includes("m&a") || name.includes("merger") || name.includes("gtm")) {
    return "guideline_transaction";
  }
  if (name.includes("dcf") || name.includes("discounted cash") || name.includes("income")) {
    return "income_dcf";
  }
  if (name.includes("ccf") || name.includes("capitalized cash")) {
    return "income_ccf";
  }
  if (name.includes("asset") || name.includes("nav") || name.includes("book")) {
    return "asset";
  }
  if (name.includes("market")) {
    return "guideline_public_company"; // Default market to GPC
  }

  return "other";
}

/**
 * Check if approach type should be AI-generated (not backsolve/OPM which use templates)
 */
export function shouldGenerateNarrative(approachName: string): boolean {
  const name = approachName.toLowerCase();
  // Backsolve/OPM use templated methodology language, not company-specific AI narrative
  if (name.includes("backsolve") || name.includes("back-solve") || 
      name.includes("opm") || name.includes("option pricing")) {
    return false;
  }
  return true;
}

/**
 * Map approach type to detailed data check type
 */
function getApproachCheckType(approachType: ApproachType): 'gpc' | 'gtm' | 'income' | null {
  switch (approachType) {
    case "guideline_public_company":
      return 'gpc';
    case "guideline_transaction":
      return 'gtm';
    case "income_dcf":
    case "income_ccf":
      return 'income';
    default:
      return null;
  }
}

/**
 * Generate narrative for a specific valuation approach
 * Now uses detailed data for company-specific narratives
 */
export async function generateApproachNarrative(
  approach: ApproachData,
  context?: ExtendedNarrativeContext
): Promise<ApproachNarrative> {
  const approachType = identifyApproachType(approach.name);
  const checkType = getApproachCheckType(approachType);
  
  // Check if we have sufficient data
  let confidence: "high" | "medium" | "low" = "medium";
  if (checkType && context?.detailedData) {
    const check = canGenerateApproachSection(checkType, context.detailedData);
    if (!check.canGenerate) {
      console.warn(`Limited data for ${approach.name}: ${check.reason}`);
      confidence = "low";
    } else {
      console.log(`Data available for ${approach.name}: ${check.reason}`);
      confidence = "high";
    }
  }

  // Select appropriate prompt builder
  // Note: Backsolve/OPM uses templated methodology language, not AI-generated
  let prompt: string;
  switch (approachType) {
    case "guideline_public_company":
      prompt = buildGuidelineCompanyPrompt(approach, context);
      break;
    case "guideline_transaction":
      prompt = buildMATransactionPrompt(approach, context);
      break;
    case "income_dcf":
    case "income_ccf":
      prompt = buildIncomeApproachPrompt(approach, context);
      break;
    default:
      prompt = buildGenericApproachPrompt(approach, context);
  }

  console.log(`Generating narrative for approach: ${approach.name} (${approachType}) - confidence: ${confidence}`);

  const narrative = await generateText(prompt, {
    systemPrompt: VALUATION_NARRATIVE_SYSTEM_PROMPT,
    maxTokens: 1500, // Increased for more detailed output
    temperature: 0.6, // Slightly lower for more consistent output
  });

  return {
    approachName: approach.name,
    approachType,
    narrative,
    confidence,
  };
}

/**
 * Analyze approach weights and apply heuristics
 * For the 3 AI-generated approaches: GPC, GTM, and Income
 */
export function analyzeWeighting(
  approaches: ApproachData[],
  _valuationDate?: Date,
  isPreRevenue?: boolean
): WeightingAnalysis {
  const warnings: string[] = [];
  const appliedHeuristics: string[] = [];
  const suggestedWeights: WeightData[] = [];

  let rationale = "The concluded value was determined by weighting the indicated values from each approach based on their relevance and reliability. ";

  for (const approach of approaches) {
    const type = identifyApproachType(approach.name);
    let suggestedWeight = approach.weight || 0;
    let weightRationale = "";

    // Apply heuristics for the 3 AI-generated approaches
    // Note: Backsolve/OPM uses templated language and is not AI-generated
    
    if ((type === "income_dcf" || type === "income_ccf") && isPreRevenue) {
      suggestedWeight = Math.min(suggestedWeight, 0.15);
      warnings.push("Pre-revenue company - income approach may be less reliable");
      appliedHeuristics.push("Pre-revenue: lower income approach weight");
      weightRationale = "Limited weight due to uncertainty in projections for pre-revenue company";
    }

    if (type === "guideline_public_company" && !approach.indicatedValue) {
      warnings.push("Guideline public company approach missing indicated value");
    }

    if (type === "guideline_transaction" && !approach.indicatedValue) {
      warnings.push("Guideline transaction approach missing indicated value");
    }

    suggestedWeights.push({
      approachName: approach.name,
      weight: suggestedWeight,
      rationale: weightRationale,
    });
  }

  // Normalize weights to sum to 1
  const totalWeight = suggestedWeights.reduce((sum, w) => sum + w.weight, 0);
  if (totalWeight > 0) {
    suggestedWeights.forEach((w) => {
      w.weight = w.weight / totalWeight;
    });
  }

  // Build rationale
  if (appliedHeuristics.length > 0) {
    rationale += `The weighting considered the following factors: ${appliedHeuristics.join("; ")}. `;
  }

  return {
    suggestedWeights,
    rationale,
    warnings,
    appliedHeuristics,
  };
}

/**
 * Generate conclusion narrative for the valuation
 */
export async function generateConclusionNarrative(
  parsedModel: ParsedModel,
  context?: ExtendedNarrativeContext
): Promise<string> {
  const approaches = parsedModel.summary?.approaches || [];

  if (approaches.length === 0) {
    return "No valuation approaches were identified in the model. Manual conclusion required.";
  }

  // Create weight data from approaches
  const weights: WeightData[] = approaches.map((a) => ({
    approachName: a.name,
    weight: a.weight || 0,
  }));

  const prompt = buildConclusionPrompt(approaches, weights, context);

  console.log("Generating conclusion narrative with detailed data");

  const narrative = await generateText(prompt, {
    systemPrompt: VALUATION_NARRATIVE_SYSTEM_PROMPT,
    maxTokens: 1200,
    temperature: 0.6,
  });

  return narrative;
}

/**
 * Determine which approaches to generate narratives for
 * Only generates sections for approaches with available data
 */
export function determineApproachesToGenerate(
  approaches: ApproachData[],
  detailedData?: DetailedModelData
): { approach: ApproachData; hasData: boolean; reason: string }[] {
  return approaches.map(approach => {
    const approachType = identifyApproachType(approach.name);
    const checkType = getApproachCheckType(approachType);
    
    if (!checkType) {
      return { approach, hasData: true, reason: 'Generic approach type' };
    }
    
    const check = canGenerateApproachSection(checkType, detailedData);
    return { 
      approach, 
      hasData: check.canGenerate, 
      reason: check.reason 
    };
  });
}

/**
 * Filter approaches based on user selection
 */
function filterApproachesBySelection(
  approaches: ApproachData[],
  selectedApproaches?: ApproachSelection
): ApproachData[] {
  if (!selectedApproaches) {
    // If no selection provided, use all approaches (legacy behavior)
    // But filter out backsolve/OPM which use templated language
    return approaches.filter(a => shouldGenerateNarrative(a.name));
  }

  return approaches.filter(approach => {
    const approachType = identifyApproachType(approach.name);
    
    // Skip backsolve/OPM - they use templated language
    if (!shouldGenerateNarrative(approach.name)) {
      return false;
    }

    // Check if user selected this approach type
    switch (approachType) {
      case "guideline_public_company":
        return selectedApproaches.guidelinePublicCompany;
      case "guideline_transaction":
        return selectedApproaches.guidelineTransaction;
      case "income_dcf":
      case "income_ccf":
        return selectedApproaches.incomeApproach;
      default:
        return true; // Include other approaches by default
    }
  });
}

/**
 * Generate all narratives for a valuation report
 * Enhanced with detailed data for company-specific output
 */
export async function generateAllNarratives(
  parsedModel: ParsedModel,
  qualitativeContext?: string,
  companyResearch?: { description: string; industry: string },
  reportType: "FOUR09A" | "FIFTY_NINE_SIXTY" = "FOUR09A",
  selectedApproaches?: ApproachSelection
): Promise<NarrativeSet> {
  const warnings: string[] = [];
  const allApproaches = parsedModel.summary?.approaches || [];
  const detailedData = parsedModel.detailedData;
  
  // Filter approaches based on user selection
  const approaches = filterApproachesBySelection(allApproaches, selectedApproaches);
  
  console.log(`\n=== Generating narratives for ${approaches.length} approaches ===`);
  if (selectedApproaches) {
    console.log('User selections:', selectedApproaches);
  }

  // Log data availability for debugging
  console.log('\n=== Data Availability for AI Generation ===');
  const availabilitySummary = getDataAvailabilitySummary(detailedData);
  availabilitySummary.forEach(line => console.log(line));
  console.log('==========================================\n');

  // Build extended context with detailed data
  const context: ExtendedNarrativeContext = {
    companyName: parsedModel.companyName || "the Subject Company",
    valuationDate: parsedModel.valuationDate?.toISOString() || new Date().toISOString(),
    reportType,
    qualitativeContext,
    companyDescription: companyResearch?.description,
    industry: companyResearch?.industry,
    detailedData,
  };

  // Determine which approaches have sufficient data
  const approachAnalysis = determineApproachesToGenerate(approaches, detailedData);
  
  // Log approach analysis
  console.log('\n=== Approach Generation Analysis ===');
  approachAnalysis.forEach(({ approach, hasData, reason }) => {
    console.log(`${hasData ? '✓' : '⚠'} ${approach.name}: ${reason}`);
  });
  console.log('====================================\n');

  // Generate approach narratives
  const approachNarratives: ApproachNarrative[] = [];

  for (const { approach, hasData, reason } of approachAnalysis) {
    try {
      if (!hasData) {
        // Add warning but still attempt generation
        warnings.push(`Limited data for ${approach.name}: ${reason}`);
      }
      
      const narrative = await generateApproachNarrative(approach, context);
      approachNarratives.push(narrative);
    } catch (error) {
      console.error(`Failed to generate narrative for ${approach.name}:`, error);
      warnings.push(`Failed to generate narrative for ${approach.name}`);
      approachNarratives.push({
        approachName: approach.name,
        approachType: identifyApproachType(approach.name),
        narrative: `[NARRATIVE GENERATION FAILED - Manual entry required for ${approach.name}]`,
        confidence: "low",
      });
    }
  }

  // Generate conclusion
  let conclusion: string;
  try {
    conclusion = await generateConclusionNarrative(parsedModel, context);
  } catch (error) {
    console.error("Failed to generate conclusion narrative:", error);
    warnings.push("Failed to generate conclusion narrative");
    conclusion = "[CONCLUSION GENERATION FAILED - Manual entry required]";
  }

  // Add missing data warnings from detailed extraction
  if (detailedData?.missingData) {
    detailedData.missingData.forEach(item => {
      if (!warnings.includes(item)) {
        warnings.push(item);
      }
    });
  }

  return {
    companyOverview: "", // Generated separately by research module
    industryOutlook: "", // Generated separately by research module
    economicOutlook: "", // Loaded from stored document
    approachNarratives,
    conclusion,
    warnings,
    generatedAt: new Date(),
  };
}

/**
 * Generate a data gaps report for items that couldn't be extracted
 */
export function generateDataGapsReport(detailedData?: DetailedModelData): string[] {
  const gaps: string[] = [];
  
  if (!detailedData) {
    gaps.push('[MISSING: No detailed data extracted from model]');
    return gaps;
  }

  // Company financials
  if (!detailedData.companyFinancials?.ltmRevenue) {
    gaps.push('[MISSING: Subject company LTM Revenue - please add manually]');
  }
  if (!detailedData.companyFinancials?.ltmEbitda) {
    gaps.push('[MISSING: Subject company LTM EBITDA - please add manually if applicable]');
  }

  // GPC data
  if (detailedData.guidelinePublicCompanies.length === 0) {
    gaps.push('[MISSING: Guideline public company names and multiples not found in model]');
  } else {
    const missingMultiples = detailedData.guidelinePublicCompanies.filter(
      c => !c.revenueMultiple && !c.ebitdaMultiple
    );
    if (missingMultiples.length > 0) {
      gaps.push(`[MISSING: Multiples for ${missingMultiples.length} guideline companies]`);
    }
  }

  // Transaction data
  if (detailedData.guidelineTransactions.length === 0) {
    gaps.push('[MISSING: Guideline transaction data not found in model]');
  }

  // Income approach
  if (!detailedData.incomeApproachData?.discountRate) {
    gaps.push('[MISSING: Discount rate/WACC not found in model]');
  }

  // Backsolve/OPM
  if (!detailedData.backsolveData?.volatility) {
    gaps.push('[MISSING: OPM volatility assumption not found in model]');
  }

  // Weighting
  if (!detailedData.weightingData?.concludedEnterpriseValue) {
    gaps.push('[MISSING: Concluded enterprise value not found in model]');
  }

  return gaps;
}
