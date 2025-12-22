/**
 * Company Research Module
 * Uses Claude AI to research company information for valuation reports
 */

import { generateJSON, generateText } from "@/lib/ai";
import {
  COMPANY_RESEARCH_SYSTEM_PROMPT,
  buildCompanyResearchPrompt,
  buildCompanyOverviewPrompt,
} from "@/lib/ai/prompts/companyResearch";
import type {
  CompanyResearch,
  ParsedCompanyResearch,
  ResearchConfidence,
} from "@/types/research";

/**
 * Research a company using AI
 * 
 * @param companyName - The name of the company to research
 * @param additionalContext - Optional context from voice transcript or other sources
 * @returns Structured company research data
 */
export async function researchCompany(
  companyName: string,
  additionalContext?: string
): Promise<CompanyResearch> {
  console.log(`Researching company: ${companyName}`);

  const prompt = buildCompanyResearchPrompt(companyName, additionalContext);

  try {
    // Get structured research from AI
    const parsed = await generateJSON<ParsedCompanyResearch>(
      prompt,
      COMPANY_RESEARCH_SYSTEM_PROMPT
    );

    // Parse and validate the response
    return parseCompanyResearch(companyName, parsed);
  } catch (error) {
    console.error("Failed to get structured company research:", error);

    // Fallback: try to get unstructured response
    try {
      const textResponse = await generateText(prompt, {
        systemPrompt: COMPANY_RESEARCH_SYSTEM_PROMPT,
        maxTokens: 2048,
      });

      // Parse the text response as best we can
      return parseTextToCompanyResearch(companyName, textResponse);
    } catch (fallbackError) {
      console.error("Fallback company research also failed:", fallbackError);

      // Return minimal research with error flag
      return createMinimalResearch(companyName);
    }
  }
}

/**
 * Get a simple company overview paragraph
 * 
 * @param companyName - The name of the company
 * @param context - Optional additional context
 * @returns A formatted company overview paragraph
 */
export async function getCompanyOverview(
  companyName: string,
  context?: string
): Promise<string> {
  const prompt = buildCompanyOverviewPrompt(companyName, context);

  const response = await generateText(prompt, {
    systemPrompt:
      "You are a business analyst writing company descriptions for valuation reports. Write in a professional, objective tone.",
    maxTokens: 1024,
  });

  return response;
}

/**
 * Parse structured AI response into CompanyResearch type
 */
export function parseCompanyResearch(
  companyName: string,
  parsed: ParsedCompanyResearch
): CompanyResearch {
  const warnings: string[] = [];

  // Check for missing or limited information
  const hasLimitedInfo =
    !parsed.companyDescription ||
    parsed.companyDescription.toLowerCase().includes("information not available") ||
    parsed.companyDescription.toLowerCase().includes("limited information") ||
    parsed.confidence === "low";

  if (!parsed.companyDescription || parsed.companyDescription.length < 50) {
    warnings.push("Limited company description available");
  }

  if (!parsed.businessModel) {
    warnings.push("Business model information not available");
  }

  if (!parsed.products || parsed.products.length === 0) {
    warnings.push("Product/service information not available");
  }

  // Determine confidence level
  let confidence: ResearchConfidence = "medium";
  if (parsed.confidence) {
    const confLower = parsed.confidence.toLowerCase();
    if (confLower === "high") confidence = "high";
    else if (confLower === "low") confidence = "low";
  }
  if (hasLimitedInfo) {
    confidence = "low";
  }

  return {
    companyName,
    companyDescription: parsed.companyDescription || "Information not available",
    businessModel: parsed.businessModel || "Information not available",
    products: parsed.products || [],
    revenueStreams: parsed.revenueStreams || "Information not available",
    targetMarket: parsed.targetMarket || "Information not available",
    competitivePosition: parsed.competitivePosition || "Information not available",
    recentDevelopments: parsed.recentDevelopments || "No recent developments available",
    keyFacts: parsed.keyFacts || [],
    industry: parsed.industry || "Industry not specified",
    confidence,
    limitedInfo: hasLimitedInfo,
    warnings,
  };
}

/**
 * Parse unstructured text response into CompanyResearch
 * Used as fallback when JSON parsing fails
 */
function parseTextToCompanyResearch(
  companyName: string,
  text: string
): CompanyResearch {
  // Use the full text as description if nothing else works
  const companyDescription = text.length > 100 ? text : "Information not available";

  return {
    companyName,
    companyDescription,
    businessModel: extractSection(text, ["business model", "revenue model"]) || "Information not available",
    products: extractListItems(text, ["products", "services", "offerings"]),
    revenueStreams: extractSection(text, ["revenue", "monetization"]) || "Information not available",
    targetMarket: extractSection(text, ["target market", "customers", "market segment"]) || "Information not available",
    competitivePosition: extractSection(text, ["competitive", "market position", "competitors"]) || "Information not available",
    recentDevelopments: extractSection(text, ["recent", "developments", "news"]) || "No recent developments available",
    keyFacts: [],
    industry: extractSection(text, ["industry", "sector"]) || "Industry not specified",
    confidence: "low",
    limitedInfo: true,
    warnings: ["Research data was parsed from unstructured response - may need review"],
  };
}

/**
 * Extract a section from text based on keywords
 */
function extractSection(text: string, keywords: string[]): string | null {
  const lowerText = text.toLowerCase();

  for (const keyword of keywords) {
    const index = lowerText.indexOf(keyword);
    if (index !== -1) {
      // Find the sentence containing this keyword
      const start = Math.max(0, text.lastIndexOf(".", index) + 1);
      const end = text.indexOf(".", index + keyword.length);
      if (end !== -1) {
        return text.substring(start, end + 1).trim();
      }
    }
  }

  return null;
}

/**
 * Extract list items from text based on section keywords
 */
function extractListItems(text: string, keywords: string[]): string[] {
  const items: string[] = [];
  const lines = text.split("\n");

  let inSection = false;
  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check if we're entering a relevant section
    if (keywords.some((kw) => lowerLine.includes(kw))) {
      inSection = true;
      continue;
    }

    // Check if we're leaving the section (new heading)
    if (inSection && line.match(/^[A-Z]/)) {
      if (!keywords.some((kw) => lowerLine.includes(kw))) {
        inSection = false;
      }
    }

    // Extract list items
    if (inSection) {
      const match = line.match(/^[\s]*[-•*]\s*(.+)$/);
      if (match) {
        items.push(match[1].trim());
      }
    }
  }

  return items;
}

/**
 * Create minimal research when all else fails
 */
function createMinimalResearch(companyName: string): CompanyResearch {
  return {
    companyName,
    companyDescription: "Company information could not be retrieved. Manual research required.",
    businessModel: "Information not available",
    products: [],
    revenueStreams: "Information not available",
    targetMarket: "Information not available",
    competitivePosition: "Information not available",
    recentDevelopments: "Information not available",
    keyFacts: [],
    industry: "Not specified",
    confidence: "low",
    limitedInfo: true,
    warnings: ["Failed to retrieve company research - manual entry required"],
  };
}

/**
 * Format company research for report inclusion
 */
export function formatCompanyResearchForReport(research: CompanyResearch): string {
  let content = "";

  // Company description
  content += research.companyDescription;
  content += "\n\n";

  // Business model
  if (research.businessModel !== "Information not available") {
    content += `The Company's business model ${research.businessModel.toLowerCase().startsWith("the") ? research.businessModel.substring(4) : "is characterized by " + research.businessModel.toLowerCase()}`;
    content += "\n\n";
  }

  // Products/Services
  if (research.products.length > 0) {
    content += `The Company's primary products and services include ${research.products.join(", ")}.`;
    content += "\n\n";
  }

  // Target Market
  if (research.targetMarket !== "Information not available") {
    content += `${research.targetMarket}`;
    content += "\n\n";
  }

  // Competitive Position
  if (research.competitivePosition !== "Information not available") {
    content += `${research.competitivePosition}`;
    content += "\n\n";
  }

  return content.trim();
}

