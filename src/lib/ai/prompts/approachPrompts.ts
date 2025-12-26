/**
 * Prompts for PDF-based valuation narrative generation
 * These prompts instruct Claude to analyze the uploaded PDF exhibits
 */

export const VALUATION_SYSTEM_PROMPT = `You are an expert valuation analyst writing sections for a formal valuation report. 

Your task is to analyze the uploaded PDF exhibits and write professional narrative sections that:
1. Reference SPECIFIC data from the exhibits (company names, multiples, values, dates)
2. Use formal, third-person language appropriate for a valuation report
3. Cite actual numbers and calculations shown in the exhibits
4. Follow standard valuation report conventions

IMPORTANT: You are analyzing actual exhibits from a real valuation. Extract and cite the specific data you see. Do NOT write generic methodology explanations or use placeholder values.`;

export const GUIDELINE_PUBLIC_COMPANY_PROMPT = `Analyze the Guideline Public Company Method exhibits in the uploaded PDF and write 2-4 paragraphs covering:

PARAGRAPH 1 - Guideline Company Selection:
- List the SPECIFIC guideline public companies selected (by name and ticker symbol)
- Note how many companies are in the set
- Briefly describe why these companies are comparable (industry, size, business model)

PARAGRAPH 2 - Multiple Analysis:
- State the specific multiples analyzed (EV/Revenue, EV/EBITDA, P/E, etc.)
- Provide the actual range of multiples observed (e.g., "EV/Revenue ranged from 1.2x to 3.8x")
- State the median and/or mean multiples
- Note the selected/applied multiple and why it was chosen relative to the range

PARAGRAPH 3 - Value Indication:
- Show the calculation: selected multiple × subject company metric = indicated value
- State the specific indicated value from this approach
- Note any adjustments made (control premium, minority discount, etc.)

Reference the SPECIFIC company names, tickers, and multiples from the PDF. Do not generalize.`;

export const GUIDELINE_TRANSACTION_PROMPT = `Analyze the Guideline Transaction Method (M&A Comparable Transactions) exhibits in the uploaded PDF and write 2-4 paragraphs covering:

PARAGRAPH 1 - Transaction Selection:
- List the SPECIFIC transactions selected (target company names, acquirer names if shown)
- Note the transaction dates
- Briefly describe why these transactions are comparable

PARAGRAPH 2 - Multiple Analysis:
- State the specific multiples analyzed (EV/Revenue, EV/EBITDA, etc.)
- Provide the actual range of multiples observed from the transactions
- State the median and/or mean multiples
- Note the selected/applied multiple and why it was chosen
- Discuss timing relevance (more recent transactions typically receive more weight)

PARAGRAPH 3 - Value Indication:
- Show the calculation: selected multiple × subject company metric = indicated value
- State the specific indicated value from this approach
- Note any adjustments made

Reference the SPECIFIC transaction targets, dates, and multiples from the PDF. Do not generalize.`;

export const INCOME_APPROACH_PROMPT = `Analyze the Income Approach / DCF exhibits in the uploaded PDF and write 3-4 paragraphs covering:

PARAGRAPH 1 - Projection Overview:
- State the projection period used (e.g., 5 years)
- Summarize the revenue trajectory with specific numbers (Year 1: $X, Year 5: $Y, CAGR of Z%)
- Describe the profitability trajectory (when does the company reach profitability, what are terminal margins)
- Note whether projections were provided by management or developed by the analyst
- Reference specific projection figures from the exhibits

PARAGRAPH 2 - Discount Rate / Cost of Equity:
- State the concluded discount rate used
- Identify the methodology: CAPM build-up, WACC, or Venture Capital method
- If CAPM build-up, detail the components:
  - Risk-free rate (and source, e.g., 20-year Treasury)
  - Equity risk premium (and source, e.g., Duff & Phelps, Kroll)
  - Size premium (and source/size category)
  - Industry risk premium (if applicable)
  - Company-specific risk premium (and the specific factors justifying it)
- If WACC, also address cost of debt and capital structure assumptions
- Explain WHY this rate is appropriate for this specific company's risk profile

PARAGRAPH 3 - Terminal Value:
- State the terminal value methodology used (exit multiple or perpetuity growth)
- If exit multiple: state the multiple used, what it's based on, and why it's appropriate
- If perpetuity growth: state the long-term growth rate and why it's reasonable
- Note what percentage of total value comes from terminal value (if discernible)

PARAGRAPH 4 - Value Conclusion:
- State the present value of the projection period cash flows
- State the present value of the terminal value
- State the total indicated enterprise value
- Note adjustments to arrive at equity value (add cash, subtract debt, etc.)
- State the final indicated equity value from this approach

Reference specific numbers from the PDF throughout. Do not generalize or use placeholder language.`;

export const CONCLUSION_PROMPT = `Based on the valuation approaches in the uploaded PDF, write 1-2 paragraphs explaining the weighting and final conclusion:

PARAGRAPH 1 - Weighting Rationale:
- List each approach used and its indicated value (cite the specific values from the exhibits)
- State the weight assigned to each approach
- Explain WHY each approach received its weight:
  - Market approaches: quality of comparable set, relevance to subject company
  - Income approach: reliability of projections, stage of company
  - If an approach received lower/no weight: explain why

PARAGRAPH 2 - Concluded Value:
- Show the weighted average calculation with actual numbers
- State the concluded enterprise value
- Note adjustments for net debt/cash position
- State the concluded equity value on a marketable basis
- If DLOM is applied, note the concluded marketable value before DLOM
- State the final concluded value and per-share value if shown

Be specific with numbers. Reference the actual indicated values and weights from the exhibits.`;

export const COMPANY_OVERVIEW_PROMPT = `Based on the uploaded PDF exhibits, write 4-5 detailed paragraphs providing a comprehensive company overview. Extract ALL relevant information from the exhibits.

PARAGRAPH 1 - Company Identification & Business Description:
- State the full legal name of the subject company
- Describe what the company does - its core products, services, and business model
- Identify the industry sector and any sub-sectors
- Note the company's geographic focus if mentioned

PARAGRAPH 2 - Company History & Development:
- Note when the company was founded if visible
- Describe any key milestones, funding rounds, or significant events
- Mention any acquisitions, partnerships, or strategic initiatives
- Note the company's ownership structure if shown (venture-backed, private equity, founder-owned, etc.)

PARAGRAPH 3 - Financial Profile:
- State all financial metrics visible in the exhibits (revenue, EBITDA, gross margin, growth rates)
- Compare current period to prior periods if shown
- Note profitability status (profitable, path to profitability, cash burn)
- Mention any financial projections or forecasts shown

PARAGRAPH 4 - Operational Characteristics:
- Note employee count or headcount if shown
- Describe customer base characteristics (number of customers, concentration, retention)
- Mention any key operational metrics (ARR, MRR, churn, NRR for SaaS; units, ASP for product companies)
- Note competitive position or market share if mentioned

PARAGRAPH 5 - Valuation Context:
- State the valuation date clearly
- State the purpose of the valuation (409A, gift & estate, transaction, etc.)
- Note the standard of value (fair market value, fair value, etc.)
- Mention any relevant context about why the valuation was performed

Be thorough and extract every piece of company information visible in the exhibits. Write in formal, third-person language appropriate for a valuation report.`;

export const INDUSTRY_OUTLOOK_PROMPT = `Based on the uploaded PDF exhibits and your knowledge of current market conditions, write 3-4 detailed paragraphs about the industry outlook. This should be relevant to the valuation date shown in the exhibits.

PARAGRAPH 1 - Industry Identification & Overview:
- Identify the industry based on the subject company shown in the exhibits
- Reference the guideline public companies as industry peers
- Describe the overall industry size and structure
- Note where the industry is in its lifecycle (emerging, growth, mature, declining)

PARAGRAPH 2 - Recent Industry Trends & Performance:
- Discuss key trends affecting this industry as of the valuation date
- Note how the industry performed in recent periods
- Discuss growth drivers (technology adoption, demographic shifts, regulatory changes, etc.)
- Mention any headwinds or challenges facing the industry

PARAGRAPH 3 - Competitive Dynamics:
- Describe the competitive landscape
- Note market concentration (fragmented vs. consolidated)
- Reference the guideline companies from the exhibits as examples of industry participants
- Discuss barriers to entry, competitive advantages, or market positioning

PARAGRAPH 4 - Outlook & Implications for Valuation:
- Discuss the near-term and medium-term outlook for the industry
- Note how industry conditions affect the valuation of companies in this space
- Discuss any industry-specific valuation considerations
- Reference how the guideline company multiples reflect industry conditions

Use your knowledge of the industry as of the valuation date. Write in formal language suitable for a valuation report.`;

