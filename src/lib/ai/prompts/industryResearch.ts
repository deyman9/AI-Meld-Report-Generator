/**
 * Industry Research Prompts
 */

/**
 * System prompt for industry research
 */
export const INDUSTRY_RESEARCH_SYSTEM_PROMPT = `You are an expert industry analyst specializing in market research for business valuation purposes. Your task is to provide comprehensive, well-sourced industry analysis suitable for formal valuation reports.

Guidelines:
- Provide factual, data-driven information
- Include source attributions where possible (e.g., "According to industry reports...", "Market research indicates...")
- Use professional, objective language suitable for valuation reports
- Focus on information relevant to business valuation (market size, growth, competitive dynamics)
- Structure your response with clear sections
- Aim for approximately 500-800 words of content

Respond ONLY in valid JSON format with no additional text or markdown.`;

/**
 * Build a comprehensive industry research prompt
 */
export function buildIndustryResearchPrompt(
  industry: string,
  companyContext?: string
): string {
  let prompt = `Provide a comprehensive industry analysis for the following industry, suitable for inclusion in a business valuation report.

Industry: ${industry}
`;

  if (companyContext) {
    prompt += `
Company Context:
${companyContext}
`;
  }

  prompt += `
Provide your response as a JSON object with the following structure:

{
  "industryName": "The formal name of the industry",
  "overview": "A comprehensive 2-3 paragraph overview of the industry, its scope, and significance",
  "marketSize": "Current market size with specific figures if available (e.g., '$X billion in 2024')",
  "growthRate": "Historical and projected growth rates (e.g., 'CAGR of X% from 2020-2025')",
  "keyDrivers": ["List", "of", "key", "growth", "drivers"],
  "competitiveLandscape": "Description of competitive dynamics, concentration, and barriers to entry",
  "regulatoryEnvironment": "Overview of regulatory factors affecting the industry",
  "recentTrends": ["Recent", "industry", "trends", "and", "developments"],
  "majorPlayers": ["List", "of", "major", "companies", "in", "the", "industry"],
  "outlook": "Future outlook for the industry over the next 3-5 years",
  "headwinds": ["Industry", "challenges", "and", "risks"],
  "tailwinds": ["Positive", "factors", "supporting", "growth"],
  "citations": [
    {"text": "Specific fact or statistic from the content", "source": "Source attribution (e.g., 'IBISWorld Industry Report')"}
  ]
}

Important:
- Use professional language suitable for a valuation report
- Include specific data points where available
- Provide source attributions for key statistics (even if general, e.g., "Industry analysts estimate...")
- If you don't have specific data for a field, provide your best analysis based on available knowledge
- The overview section should be detailed and suitable as a standalone industry description`;

  return prompt;
}

/**
 * Build a simpler industry overview prompt
 */
export function buildIndustryOverviewPrompt(
  industry: string,
  context?: string
): string {
  let prompt = `Write a professional industry overview for the "${industry}" industry suitable for inclusion in a business valuation report.`;

  if (context) {
    prompt += `

Consider this company context:
${context}`;
  }

  prompt += `

The overview should:
- Be 3-4 paragraphs (approximately 400-500 words)
- Describe the industry's scope and key characteristics
- Discuss market size and growth trends
- Address competitive dynamics
- Note relevant regulatory or economic factors
- Include source attributions where citing statistics (e.g., "According to industry reports...")
- Use professional, objective language`;

  return prompt;
}

