import type { ReportType, EngagementStatus } from "@prisma/client";

export interface EngagementListItem {
  id: string;
  companyName: string | null;
  valuationDate: Date | string | null;
  reportType: ReportType;
  status: EngagementStatus;
  errorMessage: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  expiresAt: Date | string;
  generatedReports: {
    id: string;
    version: number;
    createdAt: Date | string;
  }[];
}

export interface EngagementDetail extends EngagementListItem {
  modelFilePath: string | null;
  voiceTranscript: string | null;
}

export type { ReportType, EngagementStatus };

