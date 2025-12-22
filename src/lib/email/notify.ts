/**
 * Notification functions for report generation events
 */

import prisma from '@/lib/db/prisma';
import { sendEmail } from './client';
import { buildReportReadyEmail } from './templates/reportReady';
import { buildReportFailedEmail } from './templates/reportFailed';

/**
 * Get dashboard URL for the current environment
 */
function getDashboardUrl(): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${baseUrl}/dashboard`;
}

/**
 * Format date for display
 */
function formatDate(date: Date | null): string {
  if (!date) return 'Not specified';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Notify user that their report is complete
 */
export async function notifyReportComplete(
  engagementId: string,
  warnings: string[] = []
): Promise<void> {
  try {
    // Fetch engagement with user info
    const engagement = await prisma.engagement.findUnique({
      where: { id: engagementId },
      include: { user: true },
    });
    
    if (!engagement || !engagement.user?.email) {
      console.warn(`Cannot send notification: engagement ${engagementId} or user email not found`);
      return;
    }
    
    const { subject, html, text } = buildReportReadyEmail({
      companyName: engagement.companyName || 'Unknown Company',
      reportType: engagement.reportType,
      valuationDate: formatDate(engagement.valuationDate),
      dashboardUrl: getDashboardUrl(),
      warnings: warnings.length > 0 ? warnings.slice(0, 5) : undefined, // Limit to 5 warnings
    });
    
    await sendEmail({
      to: engagement.user.email,
      subject,
      html,
      text,
    });
    
    console.log(`Report ready notification sent to ${engagement.user.email}`);
  } catch (error) {
    console.error('Failed to send report complete notification:', error);
    // Don't throw - notification failure shouldn't block the process
  }
}

/**
 * Notify user that their report generation failed
 */
export async function notifyReportFailed(
  engagementId: string,
  errorMessage: string
): Promise<void> {
  try {
    // Fetch engagement with user info
    const engagement = await prisma.engagement.findUnique({
      where: { id: engagementId },
      include: { user: true },
    });
    
    if (!engagement || !engagement.user?.email) {
      console.warn(`Cannot send notification: engagement ${engagementId} or user email not found`);
      return;
    }
    
    const { subject, html, text } = buildReportFailedEmail({
      companyName: engagement.companyName || 'Unknown Company',
      reportType: engagement.reportType,
      errorMessage,
      dashboardUrl: getDashboardUrl(),
    });
    
    await sendEmail({
      to: engagement.user.email,
      subject,
      html,
      text,
    });
    
    console.log(`Report failed notification sent to ${engagement.user.email}`);
  } catch (error) {
    console.error('Failed to send report failed notification:', error);
    // Don't throw - notification failure shouldn't block the process
  }
}

