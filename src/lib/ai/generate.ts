import { getAnthropicClient } from "./client";
import { AIError, parseAnthropicError, delay, getBackoffDelay } from "./errors";
import type { GenerateOptions } from "@/types/ai";

const MAX_RETRIES = 3;

/**
 * Default model configuration
 */
const defaultConfig = {
  model: "claude-sonnet-4-20250514",
  maxTokens: 4096,
  temperature: 0.7,
};

/**
 * Generate text using Claude API
 * 
 * @param prompt - The user prompt to send
 * @param options - Optional generation parameters
 * @returns The generated text
 */
export async function generateText(
  prompt: string,
  options?: GenerateOptions
): Promise<string> {
  const client = getAnthropicClient();
  
  const maxTokens = options?.maxTokens ?? defaultConfig.maxTokens;
  const temperature = options?.temperature ?? defaultConfig.temperature;
  const systemPrompt = options?.systemPrompt;

  let lastError: AIError | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: defaultConfig.model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        ...(options?.stopSequences && { stop_sequences: options.stopSequences }),
      });

      // Extract text from response
      const textContent = response.content.find((block) => block.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in response");
      }

      return textContent.text;
    } catch (error) {
      lastError = parseAnthropicError(error);
      
      console.error(`AI generation attempt ${attempt + 1} failed:`, {
        type: lastError.type,
        message: lastError.message,
        retryable: lastError.retryable,
      });

      // If error is not retryable, throw immediately
      if (!lastError.retryable) {
        throw lastError;
      }

      // If we have more retries, wait before trying again
      if (attempt < MAX_RETRIES - 1) {
        const backoffDelay = lastError.retryAfter 
          ? lastError.retryAfter * 1000 
          : getBackoffDelay(attempt);
        
        console.log(`Retrying in ${backoffDelay}ms...`);
        await delay(backoffDelay);
      }
    }
  }

  // All retries exhausted
  throw lastError || new AIError({
    type: "unknown",
    message: "All retry attempts failed",
    retryable: false,
  });
}

/**
 * Generate text with structured context
 * 
 * @param systemPrompt - The system prompt defining AI behavior
 * @param userPrompt - The user prompt/question
 * @param context - Optional additional context to include
 * @returns The generated text
 */
export async function generateWithContext(
  systemPrompt: string,
  userPrompt: string,
  context?: string
): Promise<string> {
  const client = getAnthropicClient();

  // Build the full user message with context
  let fullUserPrompt = userPrompt;
  if (context) {
    fullUserPrompt = `Context:\n${context}\n\n---\n\n${userPrompt}`;
  }

  let lastError: AIError | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: defaultConfig.model,
        max_tokens: defaultConfig.maxTokens,
        temperature: defaultConfig.temperature,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: fullUserPrompt,
          },
        ],
      });

      // Extract text from response
      const textContent = response.content.find((block) => block.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in response");
      }

      return textContent.text;
    } catch (error) {
      lastError = parseAnthropicError(error);
      
      console.error(`AI generation with context attempt ${attempt + 1} failed:`, {
        type: lastError.type,
        message: lastError.message,
        retryable: lastError.retryable,
      });

      if (!lastError.retryable) {
        throw lastError;
      }

      if (attempt < MAX_RETRIES - 1) {
        const backoffDelay = lastError.retryAfter 
          ? lastError.retryAfter * 1000 
          : getBackoffDelay(attempt);
        
        console.log(`Retrying in ${backoffDelay}ms...`);
        await delay(backoffDelay);
      }
    }
  }

  throw lastError || new AIError({
    type: "unknown",
    message: "All retry attempts failed",
    retryable: false,
  });
}

/**
 * Generate text with extended token limit for longer outputs
 * 
 * @param prompt - The user prompt
 * @param systemPrompt - The system prompt
 * @returns The generated text
 */
export async function generateExtended(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  return generateText(prompt, {
    maxTokens: 8192,
    systemPrompt,
  });
}

/**
 * Generate structured output (JSON)
 * 
 * @param prompt - The user prompt
 * @param systemPrompt - System prompt that instructs JSON output
 * @returns Parsed JSON object
 */
export async function generateJSON<T>(
  prompt: string,
  systemPrompt: string
): Promise<T> {
  const response = await generateText(prompt, {
    systemPrompt: `${systemPrompt}\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanations.`,
    temperature: 0.3, // Lower temperature for more consistent JSON
  });

  // Try to parse the response as JSON
  try {
    // Handle potential markdown code blocks
    let jsonStr = response.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7);
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.slice(0, -3);
    }
    
    return JSON.parse(jsonStr.trim()) as T;
  } catch {
    console.error("Failed to parse AI response as JSON:", response);
    throw new AIError({
      type: "invalid_request",
      message: "AI response was not valid JSON",
      retryable: false,
    });
  }
}

