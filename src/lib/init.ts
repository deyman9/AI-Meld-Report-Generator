import { ensureDirectories } from './storage';

let initialized = false;

/**
 * Initializes the application
 * - Creates required storage directories
 * - Should be called on app startup
 */
export function initializeApp(): void {
  if (initialized) {
    return;
  }

  try {
    // Ensure all storage directories exist
    ensureDirectories();
    
    initialized = true;
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    throw error;
  }
}

/**
 * Check if the app has been initialized
 */
export function isInitialized(): boolean {
  return initialized;
}

