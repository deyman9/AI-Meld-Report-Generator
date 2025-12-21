import type { UploadType } from '@/types/storage';

// Allowed MIME types and extensions by upload type
export const ALLOWED_TYPES: Record<UploadType, { mimeTypes: string[]; extensions: string[] }> = {
  model: {
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ],
    extensions: ['.xlsx', '.xls'],
  },
  template: {
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.docx'],
  },
  outlook: {
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.docx'],
  },
  example: {
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    extensions: ['.docx'],
  },
};

// Maximum file size in bytes (50MB)
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Validates if a file's MIME type is allowed for the given upload type
 */
export function validateFileType(mimeType: string, uploadType: UploadType): boolean {
  const allowed = ALLOWED_TYPES[uploadType];
  if (!allowed) {
    return false;
  }
  return allowed.mimeTypes.includes(mimeType);
}

/**
 * Validates if a file size is within the allowed limit
 */
export function validateFileSize(size: number, maxSize: number = MAX_FILE_SIZE): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Gets the file extension from a filename
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) {
    return '';
  }
  return fileName.slice(lastDot).toLowerCase();
}

/**
 * Validates if a file extension is allowed for the given upload type
 */
export function validateFileExtension(fileName: string, uploadType: UploadType): boolean {
  const allowed = ALLOWED_TYPES[uploadType];
  if (!allowed) {
    return false;
  }
  const extension = getFileExtension(fileName);
  return allowed.extensions.includes(extension);
}

/**
 * Gets allowed extensions as a comma-separated string for display
 */
export function getAllowedExtensionsString(uploadType: UploadType): string {
  const allowed = ALLOWED_TYPES[uploadType];
  if (!allowed) {
    return '';
  }
  return allowed.extensions.join(', ');
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

