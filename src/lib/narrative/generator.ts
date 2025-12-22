/**
 * Valuation Narrative Generator
 * Generates narrative sections for valuation reports using AI
 */

import { generateText } from "@/lib/ai";
import {
  VALUATION_NARRATIVE_SYSTEM_PROMPT,
  buildGuidelineCompanyPrompt,
  buildMATransactionPrompt,
  buildIncomeApproachPrompt,
  buildBacksolvePrompt,
  buildOPMPrompt,
  buildConclusionPrompt,
  buildGenericApproachPrompt,
} from "@/lib/ai/prompts/valuationNarrative";
import type { ApproachData, ParsedModel } from "@/types/excel";
import type {
  NarrativeSet,
  ApproachNarrative,
  ApproachType,
  WeightData,
  NarrativeContext,
  WeightingAnalysis,
} from "@/types/narrative";

/**
 * Identify the type of valuation approach from its name
 */
export function identifyApproachType(approachName: string): ApproachType {
  const name = approachName.toLowerCase();

  if (name.includes("guideline") && name.includes("public")) {
    return "guideline_public_company";
  }
  if (name.includes("transaction") || name.includes("m&a") || name.includes("merger")) {
    return "guideline_transaction";
  }
  if (name.includes("dcf") || name.includes("discounted cash")) {
    return "income_dcf";
  }
  if (name.includes("ccf") || name.includes("capitalized cash")) {
    return "income_ccf";
  }
  if (name.includes("backsolve") || name.includes("back-solve")) {
    return "backsolve";
  }
  if (name.includes("opm") || name.includes("option pricing")) {
    return "opm";
  }
  if (name.includes("asset") || name.includes("nav") || name.includes("book")) {
    return "asset";
  }

  return "other";
}

/**
 * Generate narrative for a specific valuation approach
 */
export async function generateApproachNarrative(
  approach: ApproachData,
  context?: NarrativeContext
): Promise<ApproachNarrative> {
  const approachType = identifyApproachType(approach.name);

  // Select appropriate prompt builder
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
    case "backsolve":
      prompt = buildBacksolvePrompt(approach, context);
      break;
    case "opm":
      prompt = buildOPMPrompt(approach, context);
      break;
    default:
      prompt = buildGenericApproachPrompt(approach, context);
  }

  console.log(`Generating narrative for approach: ${approach.name} (${approachType})`);

  const narrative = await generateText(prompt, {
    systemPrompt: VALUATION_NARRATIVE_SYSTEM_PROMPT,
    maxTokens: 1024,
    temperature: 0.7,
  });

  return {
    approachName: approach.name,
    approachType,
    narrative,
    confidence: "medium",
  };
}

/**
 * Analyze approach weights and apply heuristics
 */
export function analyzeWeighting(
  approaches: ApproachData[],
  valuationDate?: Date,
  opmDate?: Date,
  lastFundingDate?: Date,
  isPreRevenue?: boolean
): WeightingAnalysis {
  const warnings: string[] = [];
  const appliedHeuristics: string[] = [];
  const suggestedWeights: WeightData[] = [];

  // Calculate days since various events
  const now = valuationDate || new Date();
  const opmAgeMonths = opmDate
    ? (now.getTime() - opmDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    : null;
  const fundingAgeMonths = lastFundingDate
    ? (now.getTime() - lastFundingDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    : null;

  let rationale = "The concluded value was determined by weighting the indicated values from each approach based on their relevance and reliability. ";

  for (const approach of approaches) {
    const type = identifyApproachType(approach.name);
    let suggestedWeight = approach.weight || 0;
    let weightRationale = "";

    // Apply heuristics
    if (type === "opm" && opmAgeMonths && opmAgeMonths > 12) {
      suggestedWeight = Math.min(suggestedWeight, 0.1);
      warnings.push(`OPM is ${Math.round(opmAgeMonths)} months old - consider reducing weight`);
      appliedHeuristics.push("OPM > 12 months: minimal weight");
      weightRationale = "Limited weight due to age of OPM analysis";
    }

    if (type === "backsolve" && fundingAgeMonths !== null && fundingAgeMonths < 6) {
      suggestedWeight = Math.max(suggestedWeight, 0.4);
      appliedHeuristics.push("Recent funding < 6 months: higher backsolve weight");
      weightRationale = "Significant weight given recency of arm's-length transaction";
    }

    if ((type === "income_dcf" || type === "income_ccf") && isPreRevenue) {
      suggestedWeight = Math.min(suggestedWeight, 0.15);
      warnings.push("Pre-revenue company - income approach may be less reliable");
      appliedHeuristics.push("Pre-revenue: lower income approach weight");
      weightRationale = "Limited weight due to uncertainty in projections for pre-revenue company";
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
  context?: NarrativeContext
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

  console.log("Generating conclusion narrative");

  const narrative = await generateText(prompt, {
    systemPrompt: VALUATION_NARRATIVE_SYSTEM_PROMPT,
    maxTokens: 1024,
    temperature: 0.7,
  });

  return narrative;
}

/**
 * Generate all narratives for a valuation report
 */
export async function generateAllNarratives(
  parsedModel: ParsedModel,
  voiceTranscript?: string,
  companyResearch?: { description: string; industry: string }
): Promise<NarrativeSet> {
  const warnings: string[] = [];
  const approaches = parsedModel.summary?.approaches || [];

  // Build context
  const context: NarrativeContext = {
    companyName: parsedModel.companyName || "the Subject Company",
    valuationDate: parsedModel.valuationDate?.toISOString() || new Date().toISOString(),
    reportType: "FOUR09A", // Default, should be passed in
    voiceTranscript,
    companyDescription: companyResearch?.description,
    industry: companyResearch?.industry,
  };

  // Generate approach narratives
  const approachNarratives: ApproachNarrative[] = [];

  for (const approach of approaches) {
    try {
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

