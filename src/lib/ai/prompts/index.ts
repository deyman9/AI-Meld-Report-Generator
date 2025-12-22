/**
 * Central place for prompt templates
 * Export functions that build prompts from data
 */

import type { PromptContext } from "@/types/ai";

/**
 * Base system prompt for all valuation report generation
 */
export const VALUATION_SYSTEM_PROMPT = `You are an expert business valuation analyst with extensive experience in 409A valuations and Gift & Estate (Revenue Ruling 59-60) valuations. You write in a professional, analytical tone suitable for formal valuation reports.

Your writing should be:
- Clear and precise
- Well-structured with logical flow
- Supported by data and reasoning
- Free of speculation or unsupported claims
- Written in third person
- Professional and objective

When you lack information, indicate what would typically be needed rather than making up data.`;

/**
 * Build a simple test prompt
 */
export function buildTestPrompt(topic: string): string {
  return `Write a brief, one-paragraph description of ${topic} in the context of business valuation.`;
}

/**
 * Build a prompt with context from the engagement
 */
export function buildPromptWithContext(
  basePrompt: string,
  context: PromptContext
): string {
  const contextParts: string[] = [];

  if (context.companyName) {
    contextParts.push(`Company: ${context.companyName}`);
  }

  if (context.valuationDate) {
    contextParts.push(`Valuation Date: ${context.valuationDate}`);
  }

  if (context.reportType) {
    const typeLabel = context.reportType === "FOUR09A" 
      ? "409A Valuation" 
      : "Gift & Estate (59-60) Valuation";
    contextParts.push(`Report Type: ${typeLabel}`);
  }

  if (context.voiceTranscript) {
    contextParts.push(`\nAnalyst Notes:\n${context.voiceTranscript}`);
  }

  if (context.additionalContext) {
    contextParts.push(`\nAdditional Context:\n${context.additionalContext}`);
  }

  if (contextParts.length === 0) {
    return basePrompt;
  }

  return `${contextParts.join("\n")}\n\n---\n\n${basePrompt}`;
}

/**
 * Format a report type for display
 */
export function formatReportType(type: "FOUR09A" | "FIFTY_NINE_SIXTY"): string {
  return type === "FOUR09A" ? "409A" : "59-60";
}

/**
 * Format a date for use in prompts
 */
export function formatDateForPrompt(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

