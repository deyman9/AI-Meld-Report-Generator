/**
 * Company Research Prompts
 */

/**
 * System prompt for company research
 */
export const COMPANY_RESEARCH_SYSTEM_PROMPT = `You are an expert business analyst specializing in company research for valuation purposes. Your task is to provide comprehensive, accurate information about companies for use in formal valuation reports.

Guidelines:
- Provide factual, verifiable information only
- If you're uncertain about something, clearly indicate it
- Use professional, objective language suitable for valuation reports
- Focus on information relevant to business valuation
- If you have limited information about a company, clearly state this
- For private companies with limited public info, indicate what would typically be available

Respond ONLY in valid JSON format with no additional text or markdown.`;

/**
 * Build a comprehensive company research prompt
 */
export function buildCompanyResearchPrompt(
  companyName: string,
  context?: string
): string {
  let prompt = `Research the following company and provide comprehensive information for a business valuation report.

Company Name: ${companyName}
`;

  if (context) {
    prompt += `
Additional Context from Analyst:
${context}
`;
  }

  prompt += `
Provide your response as a JSON object with the following structure:

{
  "companyDescription": "A comprehensive 2-3 paragraph description of the company, its history, and what it does",
  "businessModel": "How the company generates revenue and operates its business",
  "products": ["List", "of", "main", "products", "or", "services"],
  "revenueStreams": "Description of the company's revenue sources and monetization",
  "targetMarket": "Description of the company's target customers and market segments",
  "competitivePosition": "The company's position in the market relative to competitors",
  "recentDevelopments": "Recent news, funding, acquisitions, or significant events (if known)",
  "keyFacts": ["Key", "facts", "relevant", "to", "valuation"],
  "industry": "The primary industry or sector the company operates in",
  "confidence": "high, medium, or low - based on how much reliable information you have"
}

Important:
- If this is a private company with limited public information, provide what you know and indicate uncertainty
- If you cannot find information for a field, use "Information not available" or an empty array
- Set confidence to "low" if you have very limited information about this company
- All text should be suitable for inclusion in a formal valuation report`;

  return prompt;
}

/**
 * Build a simpler company overview prompt for shorter content
 */
export function buildCompanyOverviewPrompt(
  companyName: string,
  context?: string
): string {
  let prompt = `Write a professional company overview paragraph for "${companyName}" suitable for inclusion in a business valuation report.`;

  if (context) {
    prompt += `

Use this additional context from the analyst:
${context}`;
  }

  prompt += `

The overview should:
- Be 2-3 paragraphs
- Describe what the company does
- Mention its products/services
- Note its market position
- Use professional, objective language

If you have limited information about this company, indicate that clearly.`;

  return prompt;
}

