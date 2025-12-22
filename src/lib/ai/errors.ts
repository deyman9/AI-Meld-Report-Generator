import type { AIErrorType, AIErrorDetails } from "@/types/ai";

/**
 * Custom error class for AI-related errors
 */
export class AIError extends Error {
  public readonly type: AIErrorType;
  public readonly retryable: boolean;
  public readonly retryAfter?: number;
  public readonly originalError?: Error;

  constructor(details: AIErrorDetails, originalError?: Error) {
    super(details.message);
    this.name = "AIError";
    this.type = details.type;
    this.retryable = details.retryable;
    this.retryAfter = details.retryAfter;
    this.originalError = originalError;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AIError);
    }
  }

  /**
   * Get a user-friendly error message
   */
  getUserMessage(): string {
    switch (this.type) {
      case "rate_limit":
        return "AI service is currently busy. Please try again in a few moments.";
      case "token_limit":
        return "The content is too long for AI processing. Try with less data.";
      case "authentication":
        return "AI service authentication failed. Please contact support.";
      case "invalid_request":
        return "Invalid request to AI service. Please try again.";
      case "server_error":
        return "AI service is temporarily unavailable. Please try again later.";
      case "timeout":
        return "AI request timed out. Please try again.";
      default:
        return "An unexpected error occurred with the AI service.";
    }
  }
}

/**
 * Parse Anthropic API errors into AIError
 */
export function parseAnthropicError(error: unknown): AIError {
  // Handle Anthropic SDK errors
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;
    
    // Check for rate limit error
    if (err.status === 429) {
      const retryAfter = typeof err.headers === "object" && err.headers
        ? (err.headers as Record<string, string>)["retry-after"]
        : undefined;
      
      return new AIError(
        {
          type: "rate_limit",
          message: "Rate limit exceeded",
          retryable: true,
          retryAfter: retryAfter ? parseInt(retryAfter, 10) : 60,
        },
        error instanceof Error ? error : undefined
      );
    }

    // Check for authentication error
    if (err.status === 401 || err.status === 403) {
      return new AIError(
        {
          type: "authentication",
          message: "Authentication failed",
          retryable: false,
        },
        error instanceof Error ? error : undefined
      );
    }

    // Check for invalid request
    if (err.status === 400) {
      const message = typeof err.message === "string" 
        ? err.message 
        : "Invalid request";
      
      // Check if it's a token limit issue
      if (message.toLowerCase().includes("token") || 
          message.toLowerCase().includes("length")) {
        return new AIError(
          {
            type: "token_limit",
            message: "Token limit exceeded",
            retryable: false,
          },
          error instanceof Error ? error : undefined
        );
      }

      return new AIError(
        {
          type: "invalid_request",
          message,
          retryable: false,
        },
        error instanceof Error ? error : undefined
      );
    }

    // Check for server error
    if (err.status && typeof err.status === "number" && err.status >= 500) {
      return new AIError(
        {
          type: "server_error",
          message: "Server error",
          retryable: true,
        },
        error instanceof Error ? error : undefined
      );
    }

    // Check for timeout
    if (err.name === "AbortError" || 
        (typeof err.message === "string" && err.message.includes("timeout"))) {
      return new AIError(
        {
          type: "timeout",
          message: "Request timed out",
          retryable: true,
        },
        error instanceof Error ? error : undefined
      );
    }
  }

  // Default to unknown error
  return new AIError(
    {
      type: "unknown",
      message: error instanceof Error ? error.message : "Unknown error occurred",
      retryable: false,
    },
    error instanceof Error ? error : undefined
  );
}

/**
 * Delay helper for retry logic
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
export function getBackoffDelay(attempt: number, baseDelay = 1000): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, etc.
  // With jitter to prevent thundering herd
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
}

