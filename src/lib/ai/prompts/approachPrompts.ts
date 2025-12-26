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

export const COMPANY_OVERVIEW_PROMPT = `Based on the uploaded PDF exhibits, write 2-3 paragraphs providing a company overview:

PARAGRAPH 1 - Business Description:
- Identify the subject company name
- Describe what the company does (products/services)
- Note the industry and any sub-sector

PARAGRAPH 2 - Key Metrics:
- State any financial metrics visible (revenue, EBITDA, growth rates)
- Note the company's stage (early-stage, growth, mature)
- Mention employee count, customer base, or other size indicators if shown

PARAGRAPH 3 - Valuation Context:
- Note the valuation date
- State the purpose of the valuation (409A, estate/gift, transaction, etc.)
- Mention any relevant context about the company's situation

Extract all information from the PDF. If certain information is not visible in the exhibits, note what is available.`;

export const INDUSTRY_OUTLOOK_PROMPT = `Based on the uploaded PDF exhibits and your knowledge, write 2-3 paragraphs about the industry outlook:

PARAGRAPH 1 - Industry Identification:
- Identify the industry based on the subject company and guideline companies in the exhibits
- Describe the overall industry landscape

PARAGRAPH 2 - Market Trends:
- Discuss current trends affecting this industry
- Note growth drivers and headwinds
- Reference any industry data visible in the exhibits

PARAGRAPH 3 - Competitive Landscape:
- Discuss the competitive environment
- Reference any guideline companies from the exhibits as industry participants
- Note market dynamics relevant to valuation

If the PDF exhibits don't contain industry-specific information, provide relevant industry context based on the identified sector.`;

