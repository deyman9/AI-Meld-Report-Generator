export interface UploadResult {
  success: boolean;
  fileName: string;
  filePath: string;
  size: number;
  mimeType: string;
}

export interface FileMetadata {
  fileName: string;
  originalName: string;
  filePath: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

export type UploadType = 'model' | 'template' | 'outlook' | 'example';

export interface StorageDirectories {
  upload: string;
  templates: string;
  models: string;
  reports: string;
  outlooks: string;
  examples: string;
}

