import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { StorageDirectories } from '@/types/storage';

// Base upload path - can be configured via environment variable
const UPLOAD_BASE_PATH = process.env.UPLOAD_BASE_PATH || './uploads';

// Storage directory paths
export const STORAGE_DIRS: StorageDirectories = {
  upload: UPLOAD_BASE_PATH,
  templates: join(UPLOAD_BASE_PATH, 'templates'),
  models: join(UPLOAD_BASE_PATH, 'models'),
  reports: join(UPLOAD_BASE_PATH, 'reports'),
  outlooks: join(UPLOAD_BASE_PATH, 'outlooks'),
  examples: join(UPLOAD_BASE_PATH, 'examples'),
};

/**
 * Creates all required storage directories if they don't exist
 * Call this on app startup
 */
export function ensureDirectories(): void {
  const directories = Object.values(STORAGE_DIRS);
  
  for (const dir of directories) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }
}

/**
 * Sanitizes a filename by removing special characters and replacing spaces
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Generates a unique filename with optional prefix
 * Format: {prefix}_{timestamp}_{random}_{sanitized-original}
 */
export function generateFileName(originalName: string, prefix?: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitized = sanitizeFileName(originalName);
  
  if (prefix) {
    return `${prefix}_${timestamp}_${random}_${sanitized}`;
  }
  
  return `${timestamp}_${random}_${sanitized}`;
}

/**
 * Saves a buffer to the specified directory with the given filename
 * Returns the full file path
 */
export async function saveFile(
  buffer: Buffer,
  directory: string,
  fileName: string
): Promise<string> {
  const filePath = join(directory, fileName);
  
  // Ensure the directory exists
  if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
  }
  
  writeFileSync(filePath, buffer);
  
  return filePath;
}

/**
 * Deletes a file if it exists
 * Does not throw if file doesn't exist
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  } catch (error) {
    // Log but don't throw - file might already be deleted
    console.warn(`Failed to delete file ${filePath}:`, error);
  }
}

/**
 * Returns the full path for a file in a directory
 */
export function getFilePath(directory: string, fileName: string): string {
  return join(directory, fileName);
}

/**
 * Checks if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  return existsSync(filePath);
}

/**
 * Gets the appropriate storage directory for an upload type
 */
export function getDirectoryForType(type: string): string {
  switch (type) {
    case 'model':
      return STORAGE_DIRS.models;
    case 'template':
      return STORAGE_DIRS.templates;
    case 'outlook':
      return STORAGE_DIRS.outlooks;
    case 'example':
      return STORAGE_DIRS.examples;
    default:
      return STORAGE_DIRS.upload;
  }
}

