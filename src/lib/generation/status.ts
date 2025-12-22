/**
 * Engagement Status Helpers
 */

import prisma from "@/lib/db/prisma";
import type { EngagementStatus } from "@prisma/client";

/**
 * Update engagement status
 */
export async function updateEngagementStatus(
  id: string,
  status: EngagementStatus,
  error?: string
): Promise<void> {
  await prisma.engagement.update({
    where: { id },
    data: {
      status,
      errorMessage: error || null,
    },
  });

  console.log(`Engagement ${id} status updated to ${status}${error ? ` (error: ${error})` : ""}`);
}

/**
 * Mark engagement as processing
 */
export async function markProcessing(id: string): Promise<void> {
  await updateEngagementStatus(id, "PROCESSING");
}

/**
 * Mark engagement as complete
 */
export async function markComplete(id: string): Promise<void> {
  await updateEngagementStatus(id, "COMPLETE");
}

/**
 * Mark engagement as error
 */
export async function markError(id: string, error: string): Promise<void> {
  await updateEngagementStatus(id, "ERROR", error);
}

/**
 * Reset engagement to draft
 */
export async function resetToDraft(id: string): Promise<void> {
  await updateEngagementStatus(id, "DRAFT");
}

