/**
 * Job types for background processing
 */

export type JobStatus = 'pending' | 'running' | 'complete' | 'failed';

export type JobStage = 
  | 'queued'
  | 'parsing_model'
  | 'loading_template'
  | 'researching_company'
  | 'researching_industry'
  | 'generating_narratives'
  | 'assembling_document'
  | 'saving_report'
  | 'complete'
  | 'failed';

export interface Job {
  id: string;
  engagementId: string;
  status: JobStatus;
  stage: JobStage;
  progress: number; // 0-100
  message: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  warnings?: string[];
}

export interface JobStatusResponse {
  success: boolean;
  job?: Job;
  error?: string;
}

export interface QueueJobResponse {
  success: boolean;
  jobId?: string;
  error?: string;
}

