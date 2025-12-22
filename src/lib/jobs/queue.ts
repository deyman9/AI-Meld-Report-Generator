/**
 * In-memory job queue for background processing
 * For single-instance deployment (MVP)
 * 
 * For production scale, consider:
 * - Redis/BullMQ for job queue
 * - Separate worker process
 * - Database-backed job storage
 */

import type { Job, JobStage } from "@/types/jobs";

// In-memory job storage
const jobs: Map<string, Job> = new Map();

// Generate unique job ID
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Queue a new generation job
 */
export function queueGenerationJob(engagementId: string): string {
  const jobId = generateJobId();
  
  const job: Job = {
    id: jobId,
    engagementId,
    status: 'pending',
    stage: 'queued',
    progress: 0,
    message: 'Job queued',
    createdAt: new Date(),
  };
  
  jobs.set(jobId, job);
  
  // Start processing asynchronously (don't await)
  processJob(jobId).catch((error) => {
    console.error(`Job ${jobId} failed:`, error);
  });
  
  return jobId;
}

/**
 * Get job status
 */
export function getJobStatus(jobId: string): Job | null {
  return jobs.get(jobId) || null;
}

/**
 * Get job by engagement ID
 */
export function getJobByEngagementId(engagementId: string): Job | null {
  const allJobs = Array.from(jobs.values());
  for (const job of allJobs) {
    if (job.engagementId === engagementId) {
      return job;
    }
  }
  return null;
}

/**
 * Update job status
 */
export function updateJobStatus(
  jobId: string,
  updates: Partial<Pick<Job, 'status' | 'stage' | 'progress' | 'message' | 'error' | 'warnings'>>
): void {
  const job = jobs.get(jobId);
  if (job) {
    Object.assign(job, updates);
    jobs.set(jobId, job);
  }
}

/**
 * Process a job
 */
async function processJob(jobId: string): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) {
    console.error(`Job ${jobId} not found`);
    return;
  }
  
  // Update to running
  job.status = 'running';
  job.startedAt = new Date();
  job.stage = 'parsing_model';
  job.progress = 5;
  job.message = 'Starting report generation...';
  jobs.set(jobId, job);
  
  try {
    console.log(`Processing job ${jobId} for engagement ${job.engagementId}`);
    
    // Run the generation pipeline with progress callbacks
    const result = await generateReportWithProgress(job.engagementId, (stage, progress, message) => {
      updateJobStatus(jobId, { stage, progress, message });
    });
    
    if (result.success) {
      job.status = 'complete';
      job.stage = 'complete';
      job.progress = 100;
      job.message = 'Report generation completed';
      job.completedAt = new Date();
      job.warnings = result.warnings;
    } else {
      job.status = 'failed';
      job.stage = 'failed';
      job.progress = 0;
      job.message = result.error || 'Generation failed';
      job.error = result.error;
      job.completedAt = new Date();
      job.warnings = result.warnings;
    }
    
    jobs.set(jobId, job);
  } catch (error) {
    job.status = 'failed';
    job.stage = 'failed';
    job.progress = 0;
    job.error = error instanceof Error ? error.message : 'Unknown error';
    job.message = 'Generation failed unexpectedly';
    job.completedAt = new Date();
    jobs.set(jobId, job);
    
    console.error(`Job ${jobId} failed:`, error);
  }
}

/**
 * Generate report with progress callbacks
 */
async function generateReportWithProgress(
  engagementId: string,
  onProgress: (stage: JobStage, progress: number, message: string) => void
): Promise<{ success: boolean; error?: string; warnings?: string[] }> {
  // Import here to avoid circular dependencies
  const { generateReportWithCallbacks } = await import("@/lib/generation/pipeline");
  
  return generateReportWithCallbacks(engagementId, onProgress);
}

/**
 * Clean up old completed jobs (older than 1 hour)
 */
export function cleanupOldJobs(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const entries = Array.from(jobs.entries());
  
  for (const [jobId, job] of entries) {
    if (job.completedAt && job.completedAt.getTime() < oneHourAgo) {
      jobs.delete(jobId);
    }
  }
}

/**
 * Get all active jobs
 */
export function getActiveJobs(): Job[] {
  return Array.from(jobs.values()).filter(
    (job) => job.status === 'pending' || job.status === 'running'
  );
}

/**
 * Get total job count
 */
export function getJobCount(): number {
  return jobs.size;
}

