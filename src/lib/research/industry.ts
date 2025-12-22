/**
 * Industry Research Module
 * Uses Claude AI to research industry information for valuation reports
 */

import { generateJSON, generateText } from "@/lib/ai";
import {
  INDUSTRY_RESEARCH_SYSTEM_PROMPT,
  buildIndustryResearchPrompt,
  buildIndustryOverviewPrompt,
} from "@/lib/ai/prompts/industryResearch";
import type {
  IndustryResearch,
  Citation,
  ResearchConfidence,
} from "@/types/research";

/**
 * Raw parsed industry research from AI
 */
interface ParsedIndustryResearch {
  industryName?: string;
  overview?: string;
  marketSize?: string;
  growthRate?: string;
  keyDrivers?: string[];
  competitiveLandscape?: string;
  regulatoryEnvironment?: string;
  recentTrends?: string[];
  majorPlayers?: string[];
  outlook?: string;
  headwinds?: string[];
  tailwinds?: string[];
  citations?: Array<{ text: string; source: string }>;
}

/**
 * Research an industry using AI
 * 
 * @param industry - The name of the industry to research
 * @param companyContext - Optional context about the company being valued
 * @returns Structured industry research data
 */
export async function researchIndustry(
  industry: string,
  companyContext?: string
): Promise<IndustryResearch> {
  console.log(`Researching industry: ${industry}`);

  const prompt = buildIndustryResearchPrompt(industry, companyContext);

  try {
    // Get structured research from AI
    const parsed = await generateJSON<ParsedIndustryResearch>(
      prompt,
      INDUSTRY_RESEARCH_SYSTEM_PROMPT
    );

    // Parse and validate the response
    return parseIndustryResearch(industry, parsed);
  } catch (error) {
    console.error("Failed to get structured industry research:", error);

    // Fallback: try to get unstructured response
    try {
      const textResponse = await generateText(
        buildIndustryOverviewPrompt(industry, companyContext),
        {
          systemPrompt: INDUSTRY_RESEARCH_SYSTEM_PROMPT,
          maxTokens: 2048,
        }
      );

      // Return a minimal structured response
      return createMinimalIndustryResearch(industry, textResponse);
    } catch (fallbackError) {
      console.error("Fallback industry research also failed:", fallbackError);
      return createEmptyIndustryResearch(industry);
    }
  }
}

/**
 * Get a simple industry overview paragraph
 */
export async function getIndustryOverview(
  industry: string,
  context?: string
): Promise<string> {
  const prompt = buildIndustryOverviewPrompt(industry, context);

  const response = await generateText(prompt, {
    systemPrompt:
      "You are an industry analyst writing industry descriptions for valuation reports. Write in a professional, objective tone with source attributions for key statistics.",
    maxTokens: 1536,
  });

  return response;
}

/**
 * Parse structured AI response into IndustryResearch type
 */
function parseIndustryResearch(
  industry: string,
  parsed: ParsedIndustryResearch
): IndustryResearch {
  // Determine confidence level
  let confidence: ResearchConfidence = "medium";

  const hasDetailedInfo =
    parsed.overview &&
    parsed.overview.length > 200 &&
    parsed.marketSize &&
    parsed.keyDrivers &&
    parsed.keyDrivers.length > 0;

  if (hasDetailedInfo && parsed.citations && parsed.citations.length > 0) {
    confidence = "high";
  } else if (!parsed.overview || parsed.overview.length < 100) {
    confidence = "low";
  }

  // Parse citations
  const citations: Citation[] = (parsed.citations || []).map((c, index) => ({
    text: c.text,
    source: c.source,
    footnoteNumber: index + 1,
  }));

  return {
    industryName: parsed.industryName || industry,
    overview: parsed.overview || "Industry information not available",
    marketSize: parsed.marketSize || "Market size data not available",
    growthRate: parsed.growthRate || "Growth rate data not available",
    keyDrivers: parsed.keyDrivers || [],
    competitiveLandscape: parsed.competitiveLandscape || "Competitive landscape information not available",
    regulatoryEnvironment: parsed.regulatoryEnvironment || "Regulatory information not available",
    recentTrends: parsed.recentTrends || [],
    majorPlayers: parsed.majorPlayers || [],
    outlook: parsed.outlook || "Industry outlook not available",
    citations,
    confidence,
  };
}

/**
 * Create minimal industry research from text response
 */
function createMinimalIndustryResearch(
  industry: string,
  textOverview: string
): IndustryResearch {
  return {
    industryName: industry,
    overview: textOverview,
    marketSize: "See overview",
    growthRate: "See overview",
    keyDrivers: [],
    competitiveLandscape: "See overview",
    regulatoryEnvironment: "See overview",
    recentTrends: [],
    majorPlayers: [],
    outlook: "See overview",
    citations: [],
    confidence: "low",
  };
}

/**
 * Create empty industry research when all else fails
 */
function createEmptyIndustryResearch(industry: string): IndustryResearch {
  return {
    industryName: industry,
    overview: "Industry research could not be retrieved. Manual research required.",
    marketSize: "Not available",
    growthRate: "Not available",
    keyDrivers: [],
    competitiveLandscape: "Not available",
    regulatoryEnvironment: "Not available",
    recentTrends: [],
    majorPlayers: [],
    outlook: "Not available",
    citations: [],
    confidence: "low",
  };
}

/**
 * Format industry research with footnote citations for report inclusion
 */
export function formatIndustryWithCitations(research: IndustryResearch): {
  content: string;
  footnotes: string[];
} {
  let content = "";
  const footnotes: string[] = [];
  let footnoteCounter = 1;

  // Helper to add footnote reference
  const addFootnote = (citation: Citation): string => {
    footnotes.push(`${footnoteCounter}. ${citation.source}`);
    return `[${footnoteCounter++}]`;
  };

  // Industry Overview
  content += "**Industry Overview**\n\n";
  content += research.overview;
  content += "\n\n";

  // Market Size and Growth
  if (research.marketSize !== "Not available" || research.growthRate !== "Not available") {
    content += "**Market Size and Growth**\n\n";
    if (research.marketSize !== "Not available" && research.marketSize !== "See overview") {
      content += `The ${research.industryName} market is valued at ${research.marketSize}. `;
    }
    if (research.growthRate !== "Not available" && research.growthRate !== "See overview") {
      content += `The market has demonstrated ${research.growthRate}. `;
    }
    content += "\n\n";
  }

  // Key Drivers
  if (research.keyDrivers.length > 0) {
    content += "**Key Growth Drivers**\n\n";
    content += "The primary factors driving growth in this industry include:\n";
    research.keyDrivers.forEach((driver) => {
      content += `• ${driver}\n`;
    });
    content += "\n";
  }

  // Competitive Landscape
  if (research.competitiveLandscape !== "Not available" && research.competitiveLandscape !== "See overview") {
    content += "**Competitive Landscape**\n\n";
    content += research.competitiveLandscape;
    content += "\n\n";
  }

  // Major Players
  if (research.majorPlayers.length > 0) {
    content += `Key players in this market include ${research.majorPlayers.slice(0, 5).join(", ")}`;
    if (research.majorPlayers.length > 5) {
      content += ", among others";
    }
    content += ".\n\n";
  }

  // Recent Trends
  if (research.recentTrends.length > 0) {
    content += "**Recent Industry Trends**\n\n";
    research.recentTrends.forEach((trend) => {
      content += `• ${trend}\n`;
    });
    content += "\n";
  }

  // Regulatory Environment
  if (research.regulatoryEnvironment !== "Not available" && research.regulatoryEnvironment !== "See overview") {
    content += "**Regulatory Environment**\n\n";
    content += research.regulatoryEnvironment;
    content += "\n\n";
  }

  // Industry Outlook
  if (research.outlook !== "Not available" && research.outlook !== "See overview") {
    content += "**Industry Outlook**\n\n";
    content += research.outlook;
    content += "\n\n";
  }

  // Add footnote markers for citations
  research.citations.forEach((citation) => {
    addFootnote(citation);
  });

  return {
    content: content.trim(),
    footnotes,
  };
}

/**
 * Format industry research as a simple flowing narrative
 */
export function formatIndustryNarrative(research: IndustryResearch): string {
  let narrative = research.overview;

  if (research.marketSize !== "Not available" && research.marketSize !== "See overview") {
    narrative += ` The market is currently valued at ${research.marketSize}`;
    if (research.growthRate !== "Not available" && research.growthRate !== "See overview") {
      narrative += `, with ${research.growthRate}`;
    }
    narrative += ".";
  }

  if (research.keyDrivers.length > 0) {
    narrative += ` Key growth drivers include ${research.keyDrivers.slice(0, 3).join(", ")}.`;
  }

  if (research.outlook !== "Not available" && research.outlook !== "See overview") {
    narrative += ` ${research.outlook}`;
  }

  return narrative;
}

