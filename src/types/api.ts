import type { UploadType } from './storage';

// Generic API response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Upload response
export interface UploadResponse {
  success: boolean;
  fileName: string;
  filePath: string;
  size: number;
  mimeType: string;
}

// Error response
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

// Template types
export interface TemplateData {
  id: string;
  name: string;
  type: 'FOUR09A' | 'FIFTY_NINE_SIXTY';
  filePath: string;
  uploadedAt: Date;
  updatedAt: Date;
}

// Economic Outlook types
export interface EconomicOutlookData {
  id: string;
  quarter: number;
  year: number;
  filePath: string;
  uploadedAt: Date;
}

// Style Example types
export interface StyleExampleData {
  id: string;
  name: string;
  type: 'FOUR09A' | 'FIFTY_NINE_SIXTY';
  filePath: string;
  uploadedAt: Date;
}

// Upload request form data fields
export interface UploadFormFields {
  file: File;
  type: UploadType;
  name?: string;
  quarter?: string;
  year?: string;
}

// Re-export ParsedModelResponse for API
export type { ParsedModelResponse } from './excel';

