/**
 * PDF Document Analysis with Claude
 * Sends PDFs directly to Claude for analysis
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs/promises";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate content by analyzing a PDF document with Claude
 */
export async function generateWithPDF(
  pdfFilePath: string,
  systemPrompt: string,
  userPrompt: string,
  additionalContext?: string
): Promise<string> {
  console.log("=== generateWithPDF called ===");
  console.log("PDF file path:", pdfFilePath);

  // Verify file exists
  try {
    await fs.access(pdfFilePath);
  } catch {
    throw new Error(`PDF file not found: ${pdfFilePath}`);
  }

  // Step 1: Read the PDF file from disk
  const pdfBuffer = await fs.readFile(pdfFilePath);
  console.log("PDF buffer size:", pdfBuffer.length, "bytes");
  
  if (pdfBuffer.length === 0) {
    throw new Error("PDF file is empty");
  }
  
  if (pdfBuffer.length > 30 * 1024 * 1024) {
    throw new Error(`PDF file too large: ${pdfBuffer.length} bytes (max 30MB)`);
  }

  // Step 2: Convert to base64
  const pdfBase64 = pdfBuffer.toString("base64");
  console.log("Base64 preview:", pdfBase64.substring(0, 100) + "...");

  // Step 3: Build the complete user prompt
  const fullUserPrompt = additionalContext
    ? `${userPrompt}\n\nADDITIONAL CONTEXT FROM ANALYST:\n${additionalContext}`
    : userPrompt;

  console.log("Making Claude API call with PDF document...");
  console.log("Prompt length:", fullUserPrompt.length, "characters");

  // Step 4: Make the API call with the PDF included
  let response;
  try {
    response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBase64,
              },
            },
            {
              type: "text",
              text: fullUserPrompt,
            },
          ],
        },
      ],
    });
  } catch (apiError) {
    console.error("Claude API error:", apiError);
    if (apiError instanceof Error) {
      throw new Error(`Claude API failed: ${apiError.message}`);
    }
    throw new Error("Claude API failed with unknown error");
  }

  console.log("Claude API response received");
  console.log("Stop reason:", response.stop_reason);
  console.log("Usage:", response.usage);

  // Step 5: Extract the text response
  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );

  if (!textBlock) {
    throw new Error("No text response received from Claude");
  }

  console.log("Response length:", textBlock.text.length, "characters");
  return textBlock.text;
}

/**
 * Check if a file is a PDF
 */
export function isPdfFile(filePath: string): boolean {
  return filePath.toLowerCase().endsWith(".pdf");
}

