/**
 * Valuation Narrative Prompts
 * 
 * These prompts are designed to generate SPECIFIC, data-driven narratives
 * that reference actual extracted values from the valuation model.
 */

import type { ApproachData, DetailedModelData } from "@/types/excel";
import type { WeightData, NarrativeContext } from "@/types/narrative";

/**
 * Format a number as currency
 */
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "[Not Available]";
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)} million`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)} thousand`;
  }
  return `$${value.toLocaleString()}`;
}

/**
 * Format a multiple
 */
function formatMultiple(value: number | null | undefined): string {
  if (value === null || value === undefined) return "[N/A]";
  return `${value.toFixed(2)}x`;
}

/**
 * Format a percentage
 */
function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "[N/A]";
  if (value > 1) return `${value.toFixed(1)}%`;
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * System prompt for valuation narratives - now requires specific data references
 */
export const VALUATION_NARRATIVE_SYSTEM_PROMPT = `You are an expert business valuation analyst writing narrative sections for formal valuation reports. 

CRITICAL INSTRUCTIONS:
- You will be provided with SPECIFIC DATA extracted from the valuation model
- You MUST reference this specific data in your narrative
- Do NOT write generic explanations of what the methodology is
- The reader is a valuation professional who knows methodology - write about THIS specific company and data
- Reference specific numbers, company names, multiples, and values exactly as provided
- Show the math where applicable: multiple × metric = value
- Use a professional, matter-of-fact tone
- Avoid excessive hedging or disclaimers
- Write in third person
- Approximately 200-400 words per section`;

/**
 * Extended context for narrative generation with detailed data
 */
export interface ExtendedNarrativeContext extends NarrativeContext {
  detailedData?: DetailedModelData;
}

/**
 * Build prompt for Guideline Public Company Method narrative
 * Now includes specific comp data
 */
export function buildGuidelineCompanyPrompt(
  data: ApproachData,
  context?: ExtendedNarrativeContext
): string {
  const detailed = context?.detailedData;
  const companies = detailed?.guidelinePublicCompanies || [];
  const financials = detailed?.companyFinancials;
  const weighting = detailed?.weightingData;
  
  // Find the GPC approach in weighting data for more details
  const gpcApproach = weighting?.approaches.find(a => 
    /guideline.*public|gpc/i.test(a.name)
  );
  
  let prompt = `Write the Guideline Public Company Method section for a ${context?.reportType === "FOUR09A" ? "409A valuation" : "Gift & Estate valuation"} report.

SUBJECT COMPANY DATA:
- Company Name: ${context?.companyName || "[Company Name]"}
- Valuation Date: ${context?.valuationDate || "[Valuation Date]"}
${financials?.ltmRevenue ? `- LTM Revenue: ${formatCurrency(financials.ltmRevenue)}` : ""}
${financials?.ltmEbitda ? `- LTM EBITDA: ${formatCurrency(financials.ltmEbitda)}` : ""}
${context?.industry ? `- Industry: ${context.industry}` : ""}
`;

  if (companies.length > 0) {
    prompt += `
GUIDELINE COMPANIES SELECTED (${companies.length} companies):
`;
    companies.forEach((co, i) => {
      prompt += `${i + 1}. ${co.name}${co.ticker ? ` (${co.ticker})` : ""}`;
      if (co.revenueMultiple || co.ebitdaMultiple) {
        prompt += `: `;
        if (co.revenueMultiple) prompt += `EV/Revenue ${formatMultiple(co.revenueMultiple)}`;
        if (co.revenueMultiple && co.ebitdaMultiple) prompt += `, `;
        if (co.ebitdaMultiple) prompt += `EV/EBITDA ${formatMultiple(co.ebitdaMultiple)}`;
      }
      prompt += `\n`;
    });
    
    // Calculate ranges
    const revMultiples = companies.map(c => c.revenueMultiple).filter((m): m is number => m !== null);
    const ebitdaMultiples = companies.map(c => c.ebitdaMultiple).filter((m): m is number => m !== null);
    
    if (revMultiples.length > 0) {
      const revMin = Math.min(...revMultiples);
      const revMax = Math.max(...revMultiples);
      const revMedian = revMultiples.sort((a, b) => a - b)[Math.floor(revMultiples.length / 2)];
      prompt += `
REVENUE MULTIPLE ANALYSIS:
- Range: ${formatMultiple(revMin)} - ${formatMultiple(revMax)}
- Median: ${formatMultiple(revMedian)}
`;
    }
    
    if (ebitdaMultiples.length > 0) {
      const ebitdaMin = Math.min(...ebitdaMultiples);
      const ebitdaMax = Math.max(...ebitdaMultiples);
      const ebitdaMedian = ebitdaMultiples.sort((a, b) => a - b)[Math.floor(ebitdaMultiples.length / 2)];
      prompt += `
EBITDA MULTIPLE ANALYSIS:
- Range: ${formatMultiple(ebitdaMin)} - ${formatMultiple(ebitdaMax)}
- Median: ${formatMultiple(ebitdaMedian)}
`;
    }
  }

  prompt += `
INDICATED VALUE FROM THIS APPROACH: ${data.indicatedValue ? formatCurrency(data.indicatedValue) : gpcApproach?.indicatedValue ? formatCurrency(gpcApproach.indicatedValue) : "[Not Available]"}
WEIGHT ASSIGNED: ${data.weight ? formatPercent(data.weight) : gpcApproach?.weight ? formatPercent(gpcApproach.weight) : "[Not Specified]"}
`;

  if (context?.qualitativeContext) {
    prompt += `
ANALYST QUALITATIVE CONTEXT:
${context.qualitativeContext}
`;
  }

  prompt += `
Write a 2-4 paragraph narrative that:
1. Names the specific guideline companies selected and explains WHY they are comparable (similar business model, size, market, growth profile)
2. States the multiple ranges observed and discusses which multiple was selected
3. Explains WHY the selected multiple is appropriate given the Subject Company's characteristics vs. the comps
4. Shows the calculation: selected multiple × Subject Company metric = indicated value
5. Notes any size adjustments or other considerations

DO NOT write generic explanations of what the market approach is. Reference the SPECIFIC data above.`;

  return prompt;
}

/**
 * Build prompt for M&A Transaction Method narrative
 * Now includes specific transaction data
 */
export function buildMATransactionPrompt(
  data: ApproachData,
  context?: ExtendedNarrativeContext
): string {
  const detailed = context?.detailedData;
  const transactions = detailed?.guidelineTransactions || [];
  const financials = detailed?.companyFinancials;
  const weighting = detailed?.weightingData;
  
  const gtmApproach = weighting?.approaches.find(a => 
    /transaction|m&a|gtm/i.test(a.name)
  );
  
  let prompt = `Write the Guideline Transaction Method section for a ${context?.reportType === "FOUR09A" ? "409A valuation" : "Gift & Estate valuation"} report.

SUBJECT COMPANY DATA:
- Company Name: ${context?.companyName || "[Company Name]"}
- Valuation Date: ${context?.valuationDate || "[Valuation Date]"}
${financials?.ltmRevenue ? `- LTM Revenue: ${formatCurrency(financials.ltmRevenue)}` : ""}
${financials?.ltmEbitda ? `- LTM EBITDA: ${formatCurrency(financials.ltmEbitda)}` : ""}
${context?.industry ? `- Industry: ${context.industry}` : ""}
`;

  if (transactions.length > 0) {
    prompt += `
GUIDELINE TRANSACTIONS SELECTED (${transactions.length} transactions):
`;
    transactions.forEach((tx, i) => {
      prompt += `${i + 1}. ${tx.targetName}`;
      if (tx.transactionDate) prompt += ` (${tx.transactionDate.toLocaleDateString?.() || tx.transactionDate})`;
      if (tx.dealValue) prompt += ` - Deal Value: ${formatCurrency(tx.dealValue)}`;
      if (tx.revenueMultiple) prompt += `, EV/Revenue: ${formatMultiple(tx.revenueMultiple)}`;
      if (tx.ebitdaMultiple) prompt += `, EV/EBITDA: ${formatMultiple(tx.ebitdaMultiple)}`;
      prompt += `\n`;
    });
    
    // Calculate ranges
    const revMultiples = transactions.map(t => t.revenueMultiple).filter((m): m is number => m !== null);
    
    if (revMultiples.length > 0) {
      const revMin = Math.min(...revMultiples);
      const revMax = Math.max(...revMultiples);
      const revMedian = revMultiples.sort((a, b) => a - b)[Math.floor(revMultiples.length / 2)];
      prompt += `
TRANSACTION MULTIPLE ANALYSIS:
- Revenue Multiple Range: ${formatMultiple(revMin)} - ${formatMultiple(revMax)}
- Median: ${formatMultiple(revMedian)}
`;
    }
  }

  prompt += `
INDICATED VALUE FROM THIS APPROACH: ${data.indicatedValue ? formatCurrency(data.indicatedValue) : gtmApproach?.indicatedValue ? formatCurrency(gtmApproach.indicatedValue) : "[Not Available]"}
WEIGHT ASSIGNED: ${data.weight ? formatPercent(data.weight) : gtmApproach?.weight ? formatPercent(gtmApproach.weight) : "[Not Specified]"}
`;

  if (context?.qualitativeContext) {
    prompt += `
ANALYST QUALITATIVE CONTEXT:
${context.qualitativeContext}
`;
  }

  prompt += `
Write a 2-4 paragraph narrative that:
1. Names the specific transactions selected and their relevance
2. Notes the transaction dates and discusses timing relevance (more recent = more relevant)
3. States the multiple ranges and the selected/applied multiple
4. Explains adjustments for any differences vs. the Subject Company
5. Shows the math: selected multiple × metric = indicated value

DO NOT write generic explanations of what the transaction method is. Reference the SPECIFIC data above.`;

  return prompt;
}

/**
 * Build prompt for Income Approach (DCF) narrative
 * Now includes specific projection and discount rate data
 */
export function buildIncomeApproachPrompt(
  data: ApproachData,
  context?: ExtendedNarrativeContext
): string {
  const detailed = context?.detailedData;
  const incomeData = detailed?.incomeApproachData;
  const financials = detailed?.companyFinancials;
  
  let prompt = `Write the Income Approach (Discounted Cash Flow) section for a ${context?.reportType === "FOUR09A" ? "409A valuation" : "Gift & Estate valuation"} report.

SUBJECT COMPANY DATA:
- Company Name: ${context?.companyName || "[Company Name]"}
- Valuation Date: ${context?.valuationDate || "[Valuation Date]"}
${financials?.ltmRevenue ? `- Current Revenue: ${formatCurrency(financials.ltmRevenue)}` : ""}
${financials?.ltmEbitda ? `- Current EBITDA: ${formatCurrency(financials.ltmEbitda)}` : ""}
`;

  if (incomeData) {
    prompt += `
DCF MODEL INPUTS:
- Discount Rate/WACC: ${incomeData.discountRate ? formatPercent(incomeData.discountRate) : "[Not Available]"}
- Terminal Growth Rate: ${incomeData.terminalGrowthRate ? formatPercent(incomeData.terminalGrowthRate) : "[Not Available]"}
- Terminal Multiple: ${incomeData.terminalMultiple ? formatMultiple(incomeData.terminalMultiple) : "[Not Available]"}
- Terminal Methodology: ${incomeData.terminalMethodology === 'perpetuity' ? 'Gordon Growth (Perpetuity)' : incomeData.terminalMethodology === 'exitMultiple' ? 'Exit Multiple' : '[Not Specified]'}
- Projection Period: ${incomeData.projectionYears ? `${incomeData.projectionYears} years` : "[Not Available]"}
`;

    if (incomeData.revenueProjections.length > 0) {
      prompt += `
REVENUE PROJECTIONS:
`;
      incomeData.revenueProjections.forEach(proj => {
        prompt += `- Year ${proj.year}: ${formatCurrency(proj.value)}${proj.growthRate ? ` (${formatPercent(proj.growthRate)} growth)` : ""}\n`;
      });
    }

    if (incomeData.cashFlowProjections.length > 0) {
      prompt += `
CASH FLOW PROJECTIONS:
`;
      incomeData.cashFlowProjections.forEach(proj => {
        prompt += `- Year ${proj.year}: ${formatCurrency(proj.value)}\n`;
      });
    }

    prompt += `
DCF RESULTS:
${incomeData.presentValueCashFlows ? `- PV of Discrete Period Cash Flows: ${formatCurrency(incomeData.presentValueCashFlows)}` : ""}
${incomeData.terminalValue ? `- Terminal Value: ${formatCurrency(incomeData.terminalValue)}` : ""}
${incomeData.presentValueTerminal ? `- PV of Terminal Value: ${formatCurrency(incomeData.presentValueTerminal)}` : ""}
`;
  }

  prompt += `
INDICATED VALUE FROM THIS APPROACH: ${data.indicatedValue ? formatCurrency(data.indicatedValue) : incomeData?.indicatedValue ? formatCurrency(incomeData.indicatedValue) : "[Not Available]"}
WEIGHT ASSIGNED: ${data.weight ? formatPercent(data.weight) : "[Not Specified]"}
`;

  if (context?.qualitativeContext) {
    prompt += `
ANALYST QUALITATIVE CONTEXT:
${context.qualitativeContext}
`;
  }

  prompt += `
Write a 2-4 paragraph narrative that:
1. States the discount rate/WACC used and briefly note how it was derived
2. Discusses the projection period and key growth assumptions
3. Explains the terminal value methodology (growth rate or exit multiple)
4. Summarizes the PV of cash flows and terminal value
5. States the indicated value from this approach

Reference the SPECIFIC numbers provided above. Do not write generic DCF methodology explanations.`;

  return prompt;
}

/**
 * Build prompt for Backsolve/OPM Method narrative
 * Now includes specific transaction and OPM inputs
 */
export function buildBacksolvePrompt(
  data: ApproachData,
  context?: ExtendedNarrativeContext
): string {
  const detailed = context?.detailedData;
  const backsolve = detailed?.backsolveData;
  
  let prompt = `Write the ${backsolve?.methodology === 'opm' ? 'Option Pricing Method (OPM)' : 'Backsolve Method'} section for a 409A valuation report.

SUBJECT COMPANY DATA:
- Company Name: ${context?.companyName || "[Company Name]"}
- Valuation Date: ${context?.valuationDate || "[Valuation Date]"}
`;

  if (backsolve) {
    prompt += `
${backsolve.methodology === 'opm' ? 'OPM' : 'BACKSOLVE'} INPUTS:
`;
    
    if (backsolve.transactionDate) {
      prompt += `- Transaction Date: ${backsolve.transactionDate.toLocaleDateString?.() || backsolve.transactionDate}\n`;
    }
    if (backsolve.securityType) {
      prompt += `- Security Type: ${backsolve.securityType}\n`;
    }
    if (backsolve.pricePerShare) {
      prompt += `- Price Per Share: $${backsolve.pricePerShare.toFixed(4)}\n`;
    }
    if (backsolve.transactionAmount) {
      prompt += `- Transaction Amount: ${formatCurrency(backsolve.transactionAmount)}\n`;
    }
    if (backsolve.postMoneyValuation) {
      prompt += `- Post-Money Valuation: ${formatCurrency(backsolve.postMoneyValuation)}\n`;
    }
    
    prompt += `
OPM ALLOCATION INPUTS:
- Volatility: ${backsolve.volatility ? formatPercent(backsolve.volatility) : "[Not Available]"}
- Risk-Free Rate: ${backsolve.riskFreeRate ? formatPercent(backsolve.riskFreeRate) : "[Not Available]"}
- Time to Liquidity: ${backsolve.timeToLiquidity ? `${backsolve.timeToLiquidity.toFixed(1)} years` : "[Not Available]"}
`;

    if (backsolve.indicatedCommonValue || backsolve.indicatedPerShareValue) {
      prompt += `
ALLOCATION RESULTS:
${backsolve.indicatedCommonValue ? `- Indicated Common Stock Value: ${formatCurrency(backsolve.indicatedCommonValue)}` : ""}
${backsolve.indicatedPerShareValue ? `- Indicated Per Share Value: $${backsolve.indicatedPerShareValue.toFixed(4)}` : ""}
`;
    }
  }

  prompt += `
INDICATED VALUE FROM THIS APPROACH: ${data.indicatedValue ? formatCurrency(data.indicatedValue) : "[Not Available]"}
WEIGHT ASSIGNED: ${data.weight ? formatPercent(data.weight) : "[Not Specified]"}
`;

  if (context?.qualitativeContext) {
    prompt += `
ANALYST QUALITATIVE CONTEXT:
${context.qualitativeContext}
`;
  }

  prompt += `
Write a 2-4 paragraph narrative that:
1. Identifies the specific transaction used (date, security type, amount)
2. Confirms the arm's-length nature of the transaction
3. Explains the OPM allocation methodology and key inputs (volatility, time to liquidity)
4. Notes how the common stock value was derived from the transaction
5. Discusses the relevance based on transaction recency

Reference the SPECIFIC data above. For standard OPM language, note that volatility was based on publicly traded guideline company analysis and the risk-free rate reflects US Treasury rates.`;

  return prompt;
}

/**
 * Build prompt for OPM narrative (alias for backsolve with OPM context)
 */
export function buildOPMPrompt(
  data: ApproachData,
  context?: ExtendedNarrativeContext
): string {
  // Use backsolve prompt but ensure methodology is set to OPM
  if (context?.detailedData?.backsolveData) {
    context.detailedData.backsolveData.methodology = 'opm';
  }
  return buildBacksolvePrompt(data, context);
}

/**
 * Build prompt for valuation conclusion narrative
 * Now includes specific weighting rationale
 */
export function buildConclusionPrompt(
  approaches: ApproachData[],
  weights: WeightData[],
  context?: ExtendedNarrativeContext
): string {
  const detailed = context?.detailedData;
  const weighting = detailed?.weightingData;
  const backsolve = detailed?.backsolveData;
  
  let prompt = `Write the Conclusion and Weighting Rationale section for a ${context?.reportType === "FOUR09A" ? "409A valuation" : "Gift & Estate valuation"} report.

SUBJECT COMPANY:
- Company Name: ${context?.companyName || "[Company Name]"}
- Valuation Date: ${context?.valuationDate || "[Valuation Date]"}

VALUATION APPROACHES AND WEIGHTING:
`;

  // Use detailed weighting data if available, otherwise use provided approaches
  const weightedApproaches = weighting?.approaches || approaches.map(a => ({
    name: a.name,
    indicatedValue: a.indicatedValue || 0,
    weight: a.weight || 0,
    weightedValue: (a.indicatedValue || 0) * (a.weight || 0),
  }));

  weightedApproaches.forEach((approach, index) => {
    const weight = weights.find((w) => w.approachName === approach.name);
    const appliedWeight = weight?.weight || approach.weight || 0;
    prompt += `
${index + 1}. ${approach.name}
   - Indicated Value: ${formatCurrency(approach.indicatedValue)}
   - Weight: ${formatPercent(appliedWeight)}
   - Weighted Value: ${formatCurrency(approach.indicatedValue * appliedWeight)}
`;
  });

  prompt += `
CONCLUDED VALUES:
- Concluded Enterprise Value: ${weighting?.concludedEnterpriseValue ? formatCurrency(weighting.concludedEnterpriseValue) : "[Calculate from above]"}
${weighting?.dlomPercentage ? `- DLOM Applied: ${formatPercent(weighting.dlomPercentage)}` : ""}
${weighting?.valueAfterDlom ? `- Value After DLOM: ${formatCurrency(weighting.valueAfterDlom)}` : ""}
${weighting?.perShareValue ? `- Per Share Value: $${weighting.perShareValue.toFixed(4)}` : ""}
`;

  // Add weighting context
  if (backsolve?.transactionDate) {
    const txDate = new Date(backsolve.transactionDate);
    const valuationDate = context?.valuationDate ? new Date(context.valuationDate) : new Date();
    const monthsAgo = Math.round((valuationDate.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    prompt += `
WEIGHTING CONTEXT:
- Most Recent Transaction: ${monthsAgo} months before valuation date
`;
    
    if (monthsAgo <= 6) {
      prompt += `- Transaction is recent - typically supports higher weight on backsolve/OPM\n`;
    } else if (monthsAgo > 12) {
      prompt += `- Transaction is over 12 months old - may warrant reduced weight\n`;
    }
  }

  if (context?.qualitativeContext) {
    prompt += `
ANALYST QUALITATIVE CONTEXT:
${context.qualitativeContext}
`;
  }

  prompt += `
Write a 2-3 paragraph narrative that:
1. Lists each approach used with its indicated value and weight
2. Explains WHY each approach received its assigned weight - be specific:
   - If backsolve has high weight: "given the Series B financing occurred 4 months prior..."
   - If an approach has low weight: "received reduced weight due to limited comparable data..."
   - If market approaches differ: "the GPC method received higher weight due to strong comp set..."
3. Shows the weighted average calculation leading to the concluded value
4. States the final concluded value with any DLOM applied

Reference the SPECIFIC values above. Do not write generic weighting platitudes.`;

  return prompt;
}

/**
 * Build a generic approach narrative prompt
 */
export function buildGenericApproachPrompt(
  data: ApproachData,
  context?: ExtendedNarrativeContext
): string {
  let prompt = `Write a narrative section for the "${data.name}" valuation approach in a ${context?.reportType === "FOUR09A" ? "409A valuation" : "Gift & Estate valuation"} report.

SUBJECT COMPANY:
- Company Name: ${context?.companyName || "[Company Name]"}
- Valuation Date: ${context?.valuationDate || "[Valuation Date]"}

APPROACH DETAILS:
- Indicated Value: ${data.indicatedValue ? formatCurrency(data.indicatedValue) : "[Not Specified]"}
- Weight Applied: ${data.weight ? formatPercent(data.weight) : "[Not Specified]"}
`;

  if (context?.qualitativeContext) {
    prompt += `
ANALYST QUALITATIVE CONTEXT:
${context.qualitativeContext}
`;
  }

  prompt += `
Write a professional 2-3 paragraph narrative that:
1. Explains the methodology briefly
2. Discusses key inputs and assumptions
3. Presents the indicated value conclusion

Reference specific values where available.`;

  return prompt;
}

/**
 * Check if we have sufficient data to generate a specific approach section
 */
export function canGenerateApproachSection(
  approachType: 'gpc' | 'gtm' | 'income' | 'backsolve',
  detailedData?: DetailedModelData
): { canGenerate: boolean; reason: string } {
  if (!detailedData) {
    return { canGenerate: false, reason: 'No detailed data available' };
  }

  switch (approachType) {
    case 'gpc':
      if (detailedData.guidelinePublicCompanies.length > 0) {
        return { canGenerate: true, reason: `${detailedData.guidelinePublicCompanies.length} guideline companies found` };
      }
      return { canGenerate: false, reason: 'No guideline public companies extracted' };
    
    case 'gtm':
      if (detailedData.guidelineTransactions.length > 0) {
        return { canGenerate: true, reason: `${detailedData.guidelineTransactions.length} transactions found` };
      }
      return { canGenerate: false, reason: 'No guideline transactions extracted' };
    
    case 'income':
      if (detailedData.incomeApproachData?.discountRate) {
        return { canGenerate: true, reason: 'DCF data found with discount rate' };
      }
      return { canGenerate: false, reason: 'No DCF/income approach data extracted' };
    
    case 'backsolve':
      if (detailedData.backsolveData?.volatility || detailedData.backsolveData?.pricePerShare) {
        return { canGenerate: true, reason: 'Backsolve/OPM data found' };
      }
      return { canGenerate: false, reason: 'No backsolve/OPM data extracted' };
    
    default:
      return { canGenerate: false, reason: 'Unknown approach type' };
  }
}

/**
 * Get a summary of what data is available for AI generation
 */
export function getDataAvailabilitySummary(detailedData?: DetailedModelData): string[] {
  const summary: string[] = [];
  
  if (!detailedData) {
    summary.push('⚠️ No detailed data extracted from model');
    return summary;
  }

  // Company financials
  const fin = detailedData.companyFinancials;
  if (fin?.ltmRevenue) {
    summary.push(`✓ Company Revenue: ${formatCurrency(fin.ltmRevenue)}`);
  } else {
    summary.push('⚠️ Company revenue not found');
  }

  // GPC
  if (detailedData.guidelinePublicCompanies.length > 0) {
    summary.push(`✓ Guideline Companies: ${detailedData.guidelinePublicCompanies.length} found`);
    detailedData.guidelinePublicCompanies.slice(0, 3).forEach(c => {
      summary.push(`  - ${c.name}${c.ticker ? ` (${c.ticker})` : ''}`);
    });
  } else {
    summary.push('⚠️ No guideline public companies found');
  }

  // Transactions
  if (detailedData.guidelineTransactions.length > 0) {
    summary.push(`✓ Guideline Transactions: ${detailedData.guidelineTransactions.length} found`);
  } else {
    summary.push('⚠️ No guideline transactions found');
  }

  // Income approach
  if (detailedData.incomeApproachData?.discountRate) {
    summary.push(`✓ DCF Data: Discount rate ${formatPercent(detailedData.incomeApproachData.discountRate)}`);
  } else {
    summary.push('⚠️ No DCF/income approach data found');
  }

  // Backsolve
  if (detailedData.backsolveData?.volatility) {
    summary.push(`✓ OPM Data: Volatility ${formatPercent(detailedData.backsolveData.volatility)}`);
  } else {
    summary.push('⚠️ No backsolve/OPM data found');
  }

  // Weighting
  if (detailedData.weightingData?.approaches.length) {
    summary.push(`✓ Weighting: ${detailedData.weightingData.approaches.length} approaches weighted`);
  } else {
    summary.push('⚠️ No weighting data found');
  }

  return summary;
}
