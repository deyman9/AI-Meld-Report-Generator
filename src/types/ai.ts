/**
 * AI Generation Types
 */

// Options for text generation
export interface GenerateOptions {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  stopSequences?: string[];
}

// Response from generation
export interface GenerateResponse {
  text: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string | null;
}

// Context for prompts
export interface PromptContext {
  companyName?: string;
  valuationDate?: string;
  reportType?: "FOUR09A" | "FIFTY_NINE_SIXTY";
  voiceTranscript?: string;
  additionalContext?: string;
}

// AI Error types
export type AIErrorType =
  | "rate_limit"
  | "token_limit"
  | "authentication"
  | "invalid_request"
  | "server_error"
  | "timeout"
  | "unknown";

// AI Error details
export interface AIErrorDetails {
  type: AIErrorType;
  message: string;
  retryable: boolean;
  retryAfter?: number; // seconds
}

// Model configuration
export interface ModelConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

// Default model configuration
export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: "claude-sonnet-4-20250514",
  maxTokens: 4096,
  temperature: 0.7,
};

// Extended model for longer outputs
export const EXTENDED_MODEL_CONFIG: ModelConfig = {
  model: "claude-sonnet-4-20250514",
  maxTokens: 8192,
  temperature: 0.7,
};

