import Anthropic from "@anthropic-ai/sdk";

/**
 * Singleton Anthropic client instance
 */

// Cache the client instance
let clientInstance: Anthropic | null = null;

/**
 * Get or create the Anthropic client
 */
export function getAnthropicClient(): Anthropic {
  if (clientInstance) {
    return clientInstance;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY environment variable is not set. " +
      "Please add it to your .env.local file."
    );
  }

  clientInstance = new Anthropic({
    apiKey,
  });

  return clientInstance;
}

/**
 * Validate that the API key is configured
 */
export function validateApiKey(): boolean {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  return !!apiKey && apiKey.length > 0;
}

/**
 * Reset the client instance (useful for testing)
 */
export function resetClient(): void {
  clientInstance = null;
}

export default getAnthropicClient;

