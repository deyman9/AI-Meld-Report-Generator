/**
 * Master Generation Orchestrator
 * Coordinates all content generation for valuation reports
 */

import prisma from "@/lib/db/prisma";
import { researchCompany, researchIndustry, formatIndustryWithCitations } from "@/lib/research";
import { generateAllNarratives } from "@/lib/narrative";
import type { Engagement } from "@prisma/client";
import type { ParsedModel } from "@/types/excel";
import type {
  ReportContent,
  SectionContent,
  Flag,
  ValidationResult,
  GenerationOptions,
  EconomicOutlookContent,
} from "@/types/generation";
import type { CompanyResearch, Citation } from "@/types/research";
import { existsSync } from "fs";

/**
 * Default generation options
 */
const DEFAULT_OPTIONS: GenerationOptions = {
  includeIndustryResearch: true,
  includeCompanyResearch: true,
  maxRetries: 2,
  skipFailedSections: true,
};

/**
 * Generate all report content
 */
export async function generateReportContent(
  engagement: Engagement,
  parsedModel: ParsedModel,
  options: GenerationOptions = {}
): Promise<ReportContent> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  const flags: Flag[] = [];
  const warnings: string[] = [];

  console.log(`Starting report content generation for engagement ${engagement.id}`);

  // Extract basic info
  const companyName = parsedModel.companyName || engagement.companyName || "Subject Company";
  const valuationDate = parsedModel.valuationDate || engagement.valuationDate || new Date();

  // Initialize content sections
  let companyOverview: SectionContent = createEmptySection("Company overview not generated");
  let industryOutlook: SectionContent = createEmptySection("Industry outlook not generated");
  let economicOutlook: SectionContent = createEmptySection("Economic outlook not loaded");
  let industryCitations: Citation[] = [];

  // 1. Load required resources
  console.log("Loading resources...");
  const economicOutlookDoc = await loadEconomicOutlook(valuationDate);

  // 2. Generate company research
  let companyResearch: CompanyResearch | null = null;
  if (opts.includeCompanyResearch) {
    try {
      console.log(`Researching company: ${companyName}`);
      companyResearch = await researchCompany(companyName, engagement.qualitativeContext || undefined);

      companyOverview = {
        content: companyResearch.companyDescription,
        source: "ai",
        confidence: companyResearch.confidence === "high" ? 0.9 : companyResearch.confidence === "medium" ? 0.7 : 0.5,
        warnings: companyResearch.warnings,
      };

      if (companyResearch.limitedInfo) {
        flags.push({
          section: "companyOverview",
          message: "Limited company information available - review required",
          type: "review",
        });
      }
    } catch (error) {
      console.error("Company research failed:", error);
      warnings.push("Company research failed - manual entry required");
      flags.push({
        section: "companyOverview",
        message: "Failed to generate company overview",
        type: "error",
      });
    }
  }

  // 3. Generate industry research
  if (opts.includeIndustryResearch) {
    const industryName = companyResearch?.industry || "Technology"; // Default if unknown

    try {
      console.log(`Researching industry: ${industryName}`);
      const industryResearch = await researchIndustry(
        industryName,
        companyResearch?.companyDescription
      );

      const formatted = formatIndustryWithCitations(industryResearch);
      industryOutlook = {
        content: formatted.content,
        source: "ai",
        confidence: industryResearch.confidence === "high" ? 0.9 : industryResearch.confidence === "medium" ? 0.7 : 0.5,
      };
      industryCitations = industryResearch.citations;

      if (industryResearch.confidence === "low") {
        flags.push({
          section: "industryOutlook",
          message: "Limited industry information available - review required",
          type: "review",
        });
      }
    } catch (error) {
      console.error("Industry research failed:", error);
      warnings.push("Industry research failed - manual entry required");
      flags.push({
        section: "industryOutlook",
        message: "Failed to generate industry outlook",
        type: "error",
      });
    }
  }

  // 4. Load economic outlook
  if (economicOutlookDoc) {
    economicOutlook = {
      content: economicOutlookDoc.content,
      source: "stored",
      confidence: 1.0,
    };
  } else {
    flags.push({
      section: "economicOutlook",
      message: `No economic outlook found for Q${getQuarter(valuationDate)} ${valuationDate.getFullYear()}`,
      type: "missing",
    });
  }

  // 5. Generate valuation narratives with detailed data
  console.log("Generating valuation narratives with detailed model data...");
  
  // Parse selectedApproaches from engagement (stored as JSON)
  const selectedApproaches = engagement.selectedApproaches as {
    guidelinePublicCompany?: boolean;
    guidelineTransaction?: boolean;
    incomeApproach?: boolean;
  } | null;
  
  const narrativeSet = await generateAllNarratives(
    parsedModel,
    engagement.qualitativeContext || undefined,
    companyResearch
      ? { description: companyResearch.companyDescription, industry: companyResearch.industry }
      : undefined,
    engagement.reportType,
    selectedApproaches ? {
      guidelinePublicCompany: selectedApproaches.guidelinePublicCompany ?? false,
      guidelineTransaction: selectedApproaches.guidelineTransaction ?? false,
      incomeApproach: selectedApproaches.incomeApproach ?? false,
    } : undefined
  );

  // Convert approach narratives to section content
  const valuationAnalysis: Record<string, SectionContent> = {};
  for (const narrative of narrativeSet.approachNarratives) {
    valuationAnalysis[narrative.approachName] = {
      content: narrative.narrative,
      source: "ai",
      confidence: narrative.confidence === "high" ? 0.9 : narrative.confidence === "medium" ? 0.7 : 0.5,
    };

    if (narrative.confidence === "low") {
      flags.push({
        section: `approach_${narrative.approachName}`,
        message: `Low confidence narrative for ${narrative.approachName}`,
        type: "review",
      });
    }
  }

  // Add narrative warnings
  warnings.push(...narrativeSet.warnings);

  // 6. Create conclusion section
  const conclusion: SectionContent = {
    content: narrativeSet.conclusion,
    source: "ai",
    confidence: 0.7,
  };

  // Calculate duration
  const duration = Date.now() - startTime;
  console.log(`Report content generation completed in ${duration}ms`);

  // Transform detailed data for document generation
  const detailedData = parsedModel.detailedData ? {
    guidelineCompanies: parsedModel.detailedData.guidelinePublicCompanies.map(c => ({
      name: c.name,
      ticker: c.ticker || undefined,
      revenueMultiple: c.revenueMultiple || undefined,
      ebitdaMultiple: c.ebitdaMultiple || undefined,
    })),
    guidelineTransactions: parsedModel.detailedData.guidelineTransactions.map(t => ({
      targetName: t.targetName,
      revenueMultiple: t.revenueMultiple || undefined,
      date: t.transactionDate?.toISOString() || undefined,
    })),
    incomeApproach: parsedModel.detailedData.incomeApproachData ? {
      discountRate: parsedModel.detailedData.incomeApproachData.discountRate || undefined,
      terminalGrowthRate: parsedModel.detailedData.incomeApproachData.terminalGrowthRate || undefined,
      indicatedValue: parsedModel.detailedData.incomeApproachData.indicatedValue || undefined,
    } : undefined,
    backsolve: parsedModel.detailedData.backsolveData ? {
      volatility: parsedModel.detailedData.backsolveData.volatility || undefined,
      timeToLiquidity: parsedModel.detailedData.backsolveData.timeToLiquidity || undefined,
      indicatedValue: parsedModel.detailedData.backsolveData.indicatedCommonValue || undefined,
    } : undefined,
    weighting: parsedModel.detailedData.weightingData ? {
      approaches: parsedModel.detailedData.weightingData.approaches.map(a => ({
        name: a.name,
        indicatedValue: a.indicatedValue,
        weight: a.weight,
      })),
      concludedValue: parsedModel.detailedData.weightingData.concludedEnterpriseValue || undefined,
      dlom: parsedModel.detailedData.weightingData.dlomPercentage || undefined,
      valueAfterDlom: parsedModel.detailedData.weightingData.valueAfterDlom || undefined,
    } : undefined,
    companyFinancials: parsedModel.detailedData.companyFinancials ? {
      revenue: parsedModel.detailedData.companyFinancials.ltmRevenue || undefined,
      ebitda: parsedModel.detailedData.companyFinancials.ltmEbitda || undefined,
    } : undefined,
  } : undefined;

  return {
    companyName,
    valuationDate,
    reportType: engagement.reportType,
    companyOverview,
    industryOutlook,
    economicOutlook,
    valuationAnalysis,
    conclusion,
    approachNarratives: narrativeSet.approachNarratives,
    industryCitations,
    detailedData,
    dlom: parsedModel.dlom,
    concludedValue: parsedModel.summary?.concludedValue || null,
    flags,
    warnings,
    generatedAt: new Date(),
    generationDuration: duration,
  };
}

/**
 * Validate report content
 */
export function validateContent(content: ReportContent): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequired: string[] = [];
  const reviewNeeded: string[] = [];

  // Check required sections
  if (!content.companyOverview.content || content.companyOverview.content.includes("not generated")) {
    missingRequired.push("Company Overview");
  }

  if (!content.conclusion.content || content.conclusion.content.includes("FAILED")) {
    missingRequired.push("Conclusion");
  }

  // Check approach narratives
  const approachCount = Object.keys(content.valuationAnalysis).length;
  if (approachCount === 0) {
    warnings.push("No valuation approach narratives generated");
  }

  // Check flags
  for (const flag of content.flags) {
    if (flag.type === "error") {
      errors.push(`${flag.section}: ${flag.message}`);
    } else if (flag.type === "missing") {
      missingRequired.push(flag.section);
    } else if (flag.type === "review" || flag.type === "uncertain") {
      reviewNeeded.push(`${flag.section}: ${flag.message}`);
    }
  }

  // Add content warnings
  warnings.push(...content.warnings);

  return {
    isValid: errors.length === 0 && missingRequired.length === 0,
    errors,
    warnings,
    missingRequired,
    reviewNeeded,
  };
}

/**
 * Helper: Create empty section content
 */
function createEmptySection(message: string): SectionContent {
  return {
    content: message,
    source: "manual",
    confidence: 0,
  };
}

/**
 * Helper: Load economic outlook for date
 */
async function loadEconomicOutlook(valuationDate: Date): Promise<EconomicOutlookContent | null> {
  const quarter = getQuarter(valuationDate);
  const year = valuationDate.getFullYear();

  try {
    const outlook = await prisma.economicOutlook.findUnique({
      where: {
        quarter_year: { quarter, year },
      },
    });

    if (!outlook) {
      return null;
    }

    // Read the document content
    if (!existsSync(outlook.filePath)) {
      console.error(`Economic outlook file not found: ${outlook.filePath}`);
      return null;
    }

    // For now, return placeholder - actual document parsing would happen here
    // In production, use mammoth or similar to extract text from .docx
    const content = `[Economic outlook content for Q${quarter} ${year} - extracted from ${outlook.filePath}]`;

    return {
      quarter,
      year,
      content,
      source: "stored",
    };
  } catch (error) {
    console.error("Failed to load economic outlook:", error);
    return null;
  }
}

/**
 * Helper: Get quarter from date
 */
function getQuarter(date: Date): number {
  return Math.floor(date.getMonth() / 3) + 1;
}

