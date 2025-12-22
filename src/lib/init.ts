/**
 * Application Initialization
 * 
 * Handles startup tasks including:
 * - Environment validation
 * - Storage directory creation
 * - Database connection verification
 * - Cleanup job scheduling
 */

import { validateEnv, isProduction } from "./env";
import { STORAGE_DIRS, ensureDirectories } from "./storage";
import { existsSync } from "fs";

let isInitialized = false;

/**
 * Initialize application on startup
 * Safe to call multiple times - will only run once
 */
export async function initializeApp(): Promise<void> {
  if (isInitialized) {
    return;
  }
  
  console.log("🚀 Initializing Meld Report Generator...");
  
  // Validate environment variables
  const envResult = validateEnv();
  
  for (const warning of envResult.warnings) {
    console.warn(`⚠️  ${warning}`);
  }
  
  if (!envResult.isValid) {
    console.error("❌ Environment validation failed:");
    for (const error of envResult.errors) {
      console.error(`  • ${error}`);
    }
    
    if (isProduction()) {
      throw new Error("Cannot start in production with invalid environment");
    } else {
      console.warn("⚠️  Continuing in development mode with missing env vars");
    }
  } else {
    console.log("✅ Environment validated");
  }
  
  // Ensure storage directories exist
  await initializeStorage();
  console.log("✅ Storage directories ready");
  
  // Mark as initialized
  isInitialized = true;
  console.log("✅ Application initialized successfully");
}

/**
 * Initialize storage directories
 */
async function initializeStorage(): Promise<void> {
  try {
    ensureDirectories();
  } catch (error) {
    console.error("Failed to create storage directories:", error);
    throw error;
  }
}

/**
 * Check if storage is properly configured
 */
export function checkStorage(): { ok: boolean; path: string; error?: string } {
  const basePath = STORAGE_DIRS.upload;
  
  if (!existsSync(basePath)) {
    return {
      ok: false,
      path: basePath,
      error: "Storage directory does not exist",
    };
  }
  
  return {
    ok: true,
    path: basePath,
  };
}

/**
 * Get initialization status
 */
export function getInitStatus(): {
  initialized: boolean;
  storage: { ok: boolean; path: string };
  environment: { valid: boolean; errors: string[] };
} {
  const envResult = validateEnv();
  const storageResult = checkStorage();
  
  return {
    initialized: isInitialized,
    storage: {
      ok: storageResult.ok,
      path: storageResult.path,
    },
    environment: {
      valid: envResult.isValid,
      errors: envResult.errors,
    },
  };
}
