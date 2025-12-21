import { prisma } from '@/lib/db/prisma';
import { deleteFile } from './index';

interface CleanupResult {
  engagementsDeleted: number;
  reportsDeleted: number;
  filesDeleted: number;
  errors: string[];
}

/**
 * Cleans up expired engagements and their associated files
 * - Queries database for engagements and reports where expiresAt < now
 * - Deletes associated files from storage
 * - Deletes database records
 * - Returns cleanup results
 */
export async function cleanupExpiredFiles(): Promise<CleanupResult> {
  const result: CleanupResult = {
    engagementsDeleted: 0,
    reportsDeleted: 0,
    filesDeleted: 0,
    errors: [],
  };

  const now = new Date();

  try {
    // Find expired engagements
    const expiredEngagements = await prisma.engagement.findMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
      include: {
        reports: true,
      },
    });

    for (const engagement of expiredEngagements) {
      try {
        // Delete associated report files
        for (const report of engagement.reports) {
          if (report.filePath) {
            await deleteFile(report.filePath);
            result.filesDeleted++;
          }
        }

        // Delete the model file if it exists
        if (engagement.modelFilePath) {
          await deleteFile(engagement.modelFilePath);
          result.filesDeleted++;
        }

        // Delete reports from database
        await prisma.generatedReport.deleteMany({
          where: {
            engagementId: engagement.id,
          },
        });
        result.reportsDeleted += engagement.reports.length;

        // Delete the engagement
        await prisma.engagement.delete({
          where: {
            id: engagement.id,
          },
        });
        result.engagementsDeleted++;
      } catch (error) {
        const errorMessage = `Failed to cleanup engagement ${engagement.id}: ${error}`;
        result.errors.push(errorMessage);
        console.error(errorMessage);
      }
    }

    // Also clean up any orphaned reports (not linked to engagements)
    const orphanedReports = await prisma.generatedReport.findMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    for (const report of orphanedReports) {
      try {
        if (report.filePath) {
          await deleteFile(report.filePath);
          result.filesDeleted++;
        }

        await prisma.generatedReport.delete({
          where: {
            id: report.id,
          },
        });
        result.reportsDeleted++;
      } catch (error) {
        const errorMessage = `Failed to cleanup report ${report.id}: ${error}`;
        result.errors.push(errorMessage);
        console.error(errorMessage);
      }
    }

    console.log(
      `Cleanup completed: ${result.engagementsDeleted} engagements, ` +
      `${result.reportsDeleted} reports, ${result.filesDeleted} files deleted`
    );

    if (result.errors.length > 0) {
      console.warn(`Cleanup had ${result.errors.length} errors`);
    }
  } catch (error) {
    const errorMessage = `Cleanup failed: ${error}`;
    result.errors.push(errorMessage);
    console.error(errorMessage);
  }

  return result;
}

/**
 * Checks if cleanup should run based on last cleanup time
 * Returns true if more than 24 hours have passed since last cleanup
 */
let lastCleanupTime: Date | null = null;

export function shouldRunCleanup(): boolean {
  if (!lastCleanupTime) {
    return true;
  }

  const hoursSinceLastCleanup = 
    (Date.now() - lastCleanupTime.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceLastCleanup >= 24;
}

/**
 * Runs cleanup if needed and updates the last cleanup time
 */
export async function runCleanupIfNeeded(): Promise<CleanupResult | null> {
  if (!shouldRunCleanup()) {
    return null;
  }

  const result = await cleanupExpiredFiles();
  lastCleanupTime = new Date();
  
  return result;
}

