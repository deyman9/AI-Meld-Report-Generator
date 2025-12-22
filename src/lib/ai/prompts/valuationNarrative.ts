/**
 * Valuation Narrative Prompts
 */

import type { ApproachData } from "@/types/excel";
import type { WeightData, NarrativeContext } from "@/types/narrative";

/**
 * System prompt for valuation narratives
 */
export const VALUATION_NARRATIVE_SYSTEM_PROMPT = `You are an expert business valuation analyst writing narrative sections for formal valuation reports. Your writing should be:

- Professional and objective
- Clear and well-structured
- Suitable for regulatory review (409A) or legal proceedings (Gift & Estate)
- Free of speculation or unsupported claims
- Written in third person
- Approximately 200-400 words per section

Focus on explaining methodology, rationale, and conclusions in a way that supports the valuation analysis.`;

/**
 * Build prompt for Guideline Public Company Method narrative
 */
export function buildGuidelineCompanyPrompt(
  data: ApproachData,
  context?: NarrativeContext
): string {
  let prompt = `Write a narrative section for the Guideline Public Company Method in a ${context?.reportType === "FOUR09A" ? "409A valuation" : "Gift & Estate valuation"} report.

Approach Details:
- Approach Name: ${data.name}
- Indicated Value: ${data.indicatedValue ? `$${data.indicatedValue.toLocaleString()}` : "Not specified"}
- Weight Applied: ${data.weight ? `${(data.weight * 100).toFixed(0)}%` : "Not specified"}
`;

  if (context?.companyName) {
    prompt += `- Subject Company: ${context.companyName}\n`;
  }

  if (context?.industry) {
    prompt += `- Industry: ${context.industry}\n`;
  }

  if (context?.voiceTranscript) {
    prompt += `\nAnalyst Notes:\n${context.voiceTranscript}\n`;
  }

  prompt += `
The narrative should cover:
1. Overview of the methodology and why it's appropriate for this valuation
2. Selection criteria for guideline companies (what makes a good comparable)
3. Relevant valuation multiples used (e.g., EV/Revenue, EV/EBITDA, P/E)
4. How the subject company compares to the selected guideline companies
5. Any adjustments made and their rationale
6. Conclusion of value from this approach

Write in a professional tone suitable for a formal valuation report. Do not make up specific company names or numbers - focus on the methodology and general rationale.`;

  return prompt;
}

/**
 * Build prompt for M&A Transaction Method narrative
 */
export function buildMATransactionPrompt(
  data: ApproachData,
  context?: NarrativeContext
): string {
  let prompt = `Write a narrative section for the Guideline Transaction Method (M&A Comparables) in a ${context?.reportType === "FOUR09A" ? "409A valuation" : "Gift & Estate valuation"} report.

Approach Details:
- Approach Name: ${data.name}
- Indicated Value: ${data.indicatedValue ? `$${data.indicatedValue.toLocaleString()}` : "Not specified"}
- Weight Applied: ${data.weight ? `${(data.weight * 100).toFixed(0)}%` : "Not specified"}
`;

  if (context?.companyName) {
    prompt += `- Subject Company: ${context.companyName}\n`;
  }

  if (context?.industry) {
    prompt += `- Industry: ${context.industry}\n`;
  }

  if (context?.voiceTranscript) {
    prompt += `\nAnalyst Notes:\n${context.voiceTranscript}\n`;
  }

  prompt += `
The narrative should cover:
1. Overview of the methodology and its applicability
2. Selection criteria for comparable transactions
3. Time period and relevance of selected transactions
4. Relevant transaction multiples analyzed
5. Comparison of subject company to transaction targets
6. Adjustments for differences in size, profitability, or other factors
7. Conclusion of value from this approach

Write in a professional tone suitable for a formal valuation report.`;

  return prompt;
}

/**
 * Build prompt for Income Approach (DCF) narrative
 */
export function buildIncomeApproachPrompt(
  data: ApproachData,
  context?: NarrativeContext
): string {
  let prompt = `Write a narrative section for the Discounted Cash Flow (DCF) Analysis in a ${context?.reportType === "FOUR09A" ? "409A valuation" : "Gift & Estate valuation"} report.

Approach Details:
- Approach Name: ${data.name}
- Indicated Value: ${data.indicatedValue ? `$${data.indicatedValue.toLocaleString()}` : "Not specified"}
- Weight Applied: ${data.weight ? `${(data.weight * 100).toFixed(0)}%` : "Not specified"}
`;

  if (context?.companyName) {
    prompt += `- Subject Company: ${context.companyName}\n`;
  }

  if (context?.voiceTranscript) {
    prompt += `\nAnalyst Notes:\n${context.voiceTranscript}\n`;
  }

  prompt += `
The narrative should cover:
1. Overview of the DCF methodology and its appropriateness
2. Discussion of the projection period and basis for projections
3. Key assumptions:
   - Revenue growth assumptions
   - Margin assumptions
   - Capital expenditure requirements
   - Working capital considerations
4. Discount rate derivation (WACC or cost of equity)
5. Terminal value methodology (Gordon Growth or Exit Multiple)
6. Sensitivity analysis considerations
7. Conclusion of value from this approach

Write in a professional tone suitable for a formal valuation report. Focus on methodology and general considerations rather than specific numbers.`;

  return prompt;
}

/**
 * Build prompt for Backsolve Method narrative
 */
export function buildBacksolvePrompt(
  data: ApproachData,
  context?: NarrativeContext
): string {
  let prompt = `Write a narrative section for the Backsolve Method in a 409A valuation report.

Approach Details:
- Approach Name: ${data.name}
- Indicated Value: ${data.indicatedValue ? `$${data.indicatedValue.toLocaleString()}` : "Not specified"}
- Weight Applied: ${data.weight ? `${(data.weight * 100).toFixed(0)}%` : "Not specified"}
`;

  if (context?.companyName) {
    prompt += `- Subject Company: ${context.companyName}\n`;
  }

  if (context?.voiceTranscript) {
    prompt += `\nAnalyst Notes:\n${context.voiceTranscript}\n`;
  }

  prompt += `
The narrative should cover:
1. Overview of the Backsolve methodology
2. Description of the recent transaction used (e.g., Series funding round)
3. Arm's-length nature of the transaction
4. Allocation methodology (e.g., Option Pricing Method, PWERM)
5. Key assumptions in the allocation
6. Relevance and recency of the transaction
7. Conclusion of value from this approach

Write in a professional tone suitable for a 409A valuation report.`;

  return prompt;
}

/**
 * Build prompt for OPM (Option Pricing Method) narrative
 */
export function buildOPMPrompt(
  data: ApproachData,
  context?: NarrativeContext
): string {
  let prompt = `Write a narrative section for the Option Pricing Method (OPM) equity allocation in a 409A valuation report.

Approach Details:
- Approach Name: ${data.name}
- Indicated Value: ${data.indicatedValue ? `$${data.indicatedValue.toLocaleString()}` : "Not specified"}
- Weight Applied: ${data.weight ? `${(data.weight * 100).toFixed(0)}%` : "Not specified"}
`;

  if (context?.companyName) {
    prompt += `- Subject Company: ${context.companyName}\n`;
  }

  if (context?.voiceTranscript) {
    prompt += `\nAnalyst Notes:\n${context.voiceTranscript}\n`;
  }

  prompt += `
The narrative should cover:
1. Overview of the Option Pricing Method
2. When OPM is appropriate (multiple classes of equity with different rights)
3. Key inputs:
   - Equity value
   - Expected time to exit
   - Volatility assumption and derivation
   - Risk-free rate
4. Breakpoints used in the allocation
5. Treatment of common stock and preferred stock
6. Resulting allocation to common stock
7. Any DLOM applied and rationale

Write in a professional tone suitable for a 409A valuation report.`;

  return prompt;
}

/**
 * Build prompt for valuation conclusion narrative
 */
export function buildConclusionPrompt(
  approaches: ApproachData[],
  weights: WeightData[],
  context?: NarrativeContext
): string {
  let prompt = `Write a conclusion narrative for a ${context?.reportType === "FOUR09A" ? "409A valuation" : "Gift & Estate valuation"} report that explains the weighting and reconciliation of multiple valuation approaches.

Valuation Approaches Used:
`;

  approaches.forEach((approach, index) => {
    const weight = weights.find((w) => w.approachName === approach.name);
    prompt += `${index + 1}. ${approach.name}
   - Indicated Value: ${approach.indicatedValue ? `$${approach.indicatedValue.toLocaleString()}` : "Not specified"}
   - Weight: ${weight?.weight ? `${(weight.weight * 100).toFixed(0)}%` : approach.weight ? `${(approach.weight * 100).toFixed(0)}%` : "Not specified"}
`;
  });

  if (context?.voiceTranscript) {
    prompt += `\nAnalyst Notes:\n${context.voiceTranscript}\n`;
  }

  prompt += `
The conclusion narrative should:
1. Summarize the approaches used and why each was considered
2. Explain the rationale for the weighting applied to each approach
3. Discuss any approaches that received lower weight and why
4. Address the reliability and relevance of each approach
5. State the concluded value and its basis
6. Note any key assumptions or limiting conditions

Consider these weighting principles:
- Recent arm's-length transactions (< 6 months) are typically given significant weight
- OPM-based values may receive less weight if the OPM date is more than 1 year old
- Income approach may receive less weight for pre-revenue companies
- Market approaches may receive less weight if the comparable set is weak

Write in a professional tone suitable for a formal valuation report.`;

  return prompt;
}

/**
 * Build a generic approach narrative prompt
 */
export function buildGenericApproachPrompt(
  data: ApproachData,
  context?: NarrativeContext
): string {
  let prompt = `Write a narrative section for the "${data.name}" valuation approach in a ${context?.reportType === "FOUR09A" ? "409A valuation" : "Gift & Estate valuation"} report.

Approach Details:
- Indicated Value: ${data.indicatedValue ? `$${data.indicatedValue.toLocaleString()}` : "Not specified"}
- Weight Applied: ${data.weight ? `${(data.weight * 100).toFixed(0)}%` : "Not specified"}
`;

  if (context?.companyName) {
    prompt += `- Subject Company: ${context.companyName}\n`;
  }

  if (context?.voiceTranscript) {
    prompt += `\nAnalyst Notes:\n${context.voiceTranscript}\n`;
  }

  prompt += `
Write a professional narrative that:
1. Explains the methodology
2. Discusses its appropriateness for this valuation
3. Notes key assumptions
4. Presents the conclusion

Write in a professional tone suitable for a formal valuation report.`;

  return prompt;
}

