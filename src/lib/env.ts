/**
 * Environment Variable Validation
 * 
 * Validates all required environment variables at application startup.
 * Provides helpful error messages for missing or invalid configuration.
 */

interface EnvConfig {
  // Database
  DATABASE_URL: string;
  
  // Authentication
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  ALLOWED_EMAIL: string;
  
  // AI
  ANTHROPIC_API_KEY: string;
  
  // Email (optional in development)
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  SMTP_FROM?: string;
  
  // Storage
  UPLOAD_BASE_PATH?: string;
  
  // Node environment
  NODE_ENV: "development" | "production" | "test";
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_VARS = [
  "DATABASE_URL",
  "GOOGLE_CLIENT_ID", 
  "GOOGLE_CLIENT_SECRET",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "ALLOWED_EMAIL",
  "ANTHROPIC_API_KEY",
] as const;

const PRODUCTION_REQUIRED_VARS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SMTP_FROM",
] as const;

/**
 * Validates environment variables and returns validation result
 */
export function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProduction = process.env.NODE_ENV === "production";
  
  // Check required variables
  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }
  
  // Check production-required variables
  if (isProduction) {
    for (const varName of PRODUCTION_REQUIRED_VARS) {
      if (!process.env[varName]) {
        errors.push(`Missing production environment variable: ${varName}`);
      }
    }
  } else {
    // Warn about missing email config in development
    const missingEmailVars = PRODUCTION_REQUIRED_VARS.filter(
      (v) => !process.env[v]
    );
    if (missingEmailVars.length > 0) {
      warnings.push(
        `Email notifications disabled - missing: ${missingEmailVars.join(", ")}`
      );
    }
  }
  
  // Validate specific formats
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("://")) {
    errors.push("DATABASE_URL must be a valid connection string");
  }
  
  if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith("http")) {
    errors.push("NEXTAUTH_URL must be a valid URL (http:// or https://)");
  }
  
  if (process.env.SMTP_PORT && isNaN(parseInt(process.env.SMTP_PORT))) {
    errors.push("SMTP_PORT must be a valid number");
  }
  
  // Validate ALLOWED_EMAIL format
  if (process.env.ALLOWED_EMAIL) {
    const email = process.env.ALLOWED_EMAIL;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("ALLOWED_EMAIL must be a valid email address");
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Gets typed environment configuration
 * Only call after validation has passed
 */
export function getEnvConfig(): EnvConfig {
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
    ALLOWED_EMAIL: process.env.ALLOWED_EMAIL!,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM: process.env.SMTP_FROM,
    UPLOAD_BASE_PATH: process.env.UPLOAD_BASE_PATH,
    NODE_ENV: (process.env.NODE_ENV as EnvConfig["NODE_ENV"]) || "development",
  };
}

/**
 * Validates environment and throws if invalid
 * Call this at application startup
 */
export function assertEnvValid(): void {
  const result = validateEnv();
  
  // Log warnings
  for (const warning of result.warnings) {
    console.warn(`⚠️  ${warning}`);
  }
  
  // Throw on errors
  if (!result.isValid) {
    const errorMessage = [
      "❌ Environment validation failed:",
      "",
      ...result.errors.map((e) => `  • ${e}`),
      "",
      "Please check your .env file or environment configuration.",
    ].join("\n");
    
    throw new Error(errorMessage);
  }
  
  console.log("✅ Environment validation passed");
}

/**
 * Check if email is configured
 */
export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_FROM
  );
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

