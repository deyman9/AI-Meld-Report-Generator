/**
 * Complete Generation Pipeline
 * Orchestrates the entire report generation process
 */

import prisma from "@/lib/db/prisma";
import { parseValuationModel } from "@/lib/excel/parseValuationModel";
import { generateReportContent, validateContent } from "./orchestrator";
import { updateEngagementStatus, markComplete, markError } from "./status";
import { assembleReport, saveReport } from "@/lib/document/assembler";
import { loadTemplate } from "@/lib/document/template";
import { notifyReportComplete, notifyReportFailed } from "@/lib/email/notify";
import type { GenerationResult } from "@/types/generation";
import type { JobStage } from "@/types/jobs";

type ProgressCallback = (stage: JobStage, progress: number, message: string) => void;

/**
 * Main report generation function
 * Runs the complete pipeline from engagement to generated report
 */
export async function generateReport(engagementId: string): Promise<GenerationResult> {
  const startTime = Date.now();
  const warnings: string[] = [];

  console.log(`Starting report generation for engagement ${engagementId}`);

  try {
    // 1. Load engagement from database
    const engagement = await prisma.engagement.findUnique({
      where: { id: engagementId },
    });

    if (!engagement) {
      return {
        success: false,
        error: "Engagement not found",
        warnings: [],
        duration: Date.now() - startTime,
      };
    }

    // Verify status
    if (engagement.status !== "PROCESSING") {
      console.log(`Engagement ${engagementId} is not in PROCESSING status (current: ${engagement.status})`);
      // Update to PROCESSING if it's in DRAFT
      if (engagement.status === "DRAFT") {
        await updateEngagementStatus(engagementId, "PROCESSING");
      } else {
        return {
          success: false,
          error: `Engagement is in ${engagement.status} status, not PROCESSING`,
          warnings: [],
          duration: Date.now() - startTime,
        };
      }
    }

    // 2. Load and parse model file
    if (!engagement.modelFilePath) {
      await markError(engagementId, "No model file uploaded");
      return {
        success: false,
        error: "No model file uploaded",
        warnings: [],
        duration: Date.now() - startTime,
      };
    }

    console.log(`Parsing model file: ${engagement.modelFilePath}`);
    let parsedModel;
    try {
      parsedModel = await parseValuationModel(engagement.modelFilePath);
      warnings.push(...parsedModel.warnings);

      if (parsedModel.errors.length > 0) {
        warnings.push(...parsedModel.errors.map((e) => `Parse error: ${e}`));
      }
    } catch (error) {
      const errorMsg = `Failed to parse model: ${error instanceof Error ? error.message : "Unknown error"}`;
      await markError(engagementId, errorMsg);
      return {
        success: false,
        error: errorMsg,
        warnings: [],
        duration: Date.now() - startTime,
      };
    }

    // 3. Load template (optional - we can generate without it)
    let template = null;
    try {
      const templateRecord = await prisma.template.findFirst({
        where: { type: engagement.reportType },
        orderBy: { updatedAt: "desc" },
      });

      if (templateRecord) {
        template = await loadTemplate(
          templateRecord.filePath,
          templateRecord.id,
          templateRecord.name,
          templateRecord.type
        );
        console.log(`Loaded template: ${templateRecord.name}`);
      } else {
        warnings.push("No template found - generating with default structure");
      }
    } catch (error) {
      console.error("Failed to load template:", error);
      warnings.push("Template loading failed - using default structure");
    }

    // 4. Generate all content
    console.log("Generating report content...");
    let content;
    try {
      content = await generateReportContent(engagement, parsedModel);
      warnings.push(...content.warnings);
    } catch (error) {
      const errorMsg = `Content generation failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      await markError(engagementId, errorMsg);
      return {
        success: false,
        error: errorMsg,
        warnings,
        duration: Date.now() - startTime,
      };
    }

    // 5. Validate content
    const validation = validateContent(content);
    warnings.push(...validation.warnings);

    if (!validation.isValid) {
      console.warn("Content validation has errors:", validation.errors);
      warnings.push(...validation.errors);
      // Continue anyway - we want partial reports
    }

    // 6. Assemble document
    console.log("Assembling document...");
    let documentBuffer;
    try {
      documentBuffer = await assembleReport(template, content, engagement);
    } catch (error) {
      const errorMsg = `Document assembly failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      await markError(engagementId, errorMsg);
      return {
        success: false,
        error: errorMsg,
        warnings,
        duration: Date.now() - startTime,
      };
    }

    // 7. Save report to storage
    console.log("Saving report...");
    let reportFilePath;
    try {
      reportFilePath = await saveReport(documentBuffer, engagement);
    } catch (error) {
      const errorMsg = `Failed to save report: ${error instanceof Error ? error.message : "Unknown error"}`;
      await markError(engagementId, errorMsg);
      return {
        success: false,
        error: errorMsg,
        warnings,
        duration: Date.now() - startTime,
      };
    }

    // 8. Create database record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiration

    // Get current version
    const existingReports = await prisma.generatedReport.count({
      where: { engagementId },
    });

    await prisma.generatedReport.create({
      data: {
        engagementId,
        filePath: reportFilePath,
        version: existingReports + 1,
        expiresAt,
      },
    });

    // 9. Update engagement status
    await markComplete(engagementId);

    const duration = Date.now() - startTime;
    console.log(`Report generation completed in ${duration}ms`);

    // Send success notification
    await notifyReportComplete(engagementId, warnings);

    return {
      success: true,
      content,
      warnings,
      duration,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`Report generation failed: ${errorMsg}`, error);

    // Try to update status to error and send notification
    try {
      await markError(engagementId, errorMsg);
      await notifyReportFailed(engagementId, errorMsg);
    } catch (statusError) {
      console.error("Failed to update engagement status:", statusError);
    }

    return {
      success: false,
      error: errorMsg,
      warnings,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Retry failed generation
 */
export async function retryGeneration(engagementId: string): Promise<GenerationResult> {
  // Reset to PROCESSING status
  await updateEngagementStatus(engagementId, "PROCESSING");

  // Run generation
  return generateReport(engagementId);
}

/**
 * Generate report with progress callbacks
 * Used by the job queue for real-time status updates
 */
export async function generateReportWithCallbacks(
  engagementId: string,
  onProgress: ProgressCallback
): Promise<{ success: boolean; error?: string; warnings?: string[] }> {
  const startTime = Date.now();
  const warnings: string[] = [];

  console.log(`Starting report generation with callbacks for engagement ${engagementId}`);

  try {
    // 1. Load engagement from database
    onProgress('parsing_model', 5, 'Loading engagement data...');
    
    const engagement = await prisma.engagement.findUnique({
      where: { id: engagementId },
    });

    if (!engagement) {
      await notifyReportFailed(engagementId, "Engagement not found");
      return { success: false, error: "Engagement not found", warnings: [] };
    }

    // Verify status
    if (engagement.status !== "PROCESSING") {
      if (engagement.status === "DRAFT") {
        await updateEngagementStatus(engagementId, "PROCESSING");
      } else {
        return {
          success: false,
          error: `Engagement is in ${engagement.status} status`,
          warnings: [],
        };
      }
    }

    // 2. Load and parse model file
    onProgress('parsing_model', 10, 'Parsing valuation model...');
    
    if (!engagement.modelFilePath) {
      await markError(engagementId, "No model file uploaded");
      await notifyReportFailed(engagementId, "No model file uploaded");
      return { success: false, error: "No model file uploaded", warnings: [] };
    }

    let parsedModel;
    try {
      parsedModel = await parseValuationModel(engagement.modelFilePath);
      warnings.push(...parsedModel.warnings);
      if (parsedModel.errors.length > 0) {
        warnings.push(...parsedModel.errors.map((e) => `Parse error: ${e}`));
      }
    } catch (error) {
      const errorMsg = `Failed to parse model: ${error instanceof Error ? error.message : "Unknown error"}`;
      await markError(engagementId, errorMsg);
      await notifyReportFailed(engagementId, errorMsg);
      return { success: false, error: errorMsg, warnings: [] };
    }

    // 3. Load template
    onProgress('loading_template', 15, 'Loading document template...');
    
    let template = null;
    try {
      const templateRecord = await prisma.template.findFirst({
        where: { type: engagement.reportType },
        orderBy: { updatedAt: "desc" },
      });

      if (templateRecord) {
        template = await loadTemplate(
          templateRecord.filePath,
          templateRecord.id,
          templateRecord.name,
          templateRecord.type
        );
      } else {
        warnings.push("No template found - generating with default structure");
      }
    } catch {
      warnings.push("Template loading failed - using default structure");
    }

    // 4. Generate company research
    onProgress('researching_company', 25, 'Researching company information...');

    // 5. Generate industry research  
    onProgress('researching_industry', 40, 'Analyzing industry outlook...');

    // 6. Generate valuation narratives
    onProgress('generating_narratives', 55, 'Generating valuation narratives...');

    // All content generation happens here
    let content;
    try {
      content = await generateReportContent(engagement, parsedModel);
      warnings.push(...content.warnings);
    } catch (error) {
      const errorMsg = `Content generation failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      await markError(engagementId, errorMsg);
      await notifyReportFailed(engagementId, errorMsg);
      return { success: false, error: errorMsg, warnings };
    }

    // 7. Validate content
    onProgress('generating_narratives', 70, 'Validating generated content...');
    
    const validation = validateContent(content);
    warnings.push(...validation.warnings);
    if (!validation.isValid) {
      warnings.push(...validation.errors);
    }

    // 8. Assemble document
    onProgress('assembling_document', 80, 'Assembling document...');
    
    let documentBuffer;
    try {
      documentBuffer = await assembleReport(template, content, engagement);
    } catch (error) {
      const errorMsg = `Document assembly failed: ${error instanceof Error ? error.message : "Unknown error"}`;
      await markError(engagementId, errorMsg);
      await notifyReportFailed(engagementId, errorMsg);
      return { success: false, error: errorMsg, warnings };
    }

    // 9. Save report
    onProgress('saving_report', 90, 'Saving report...');
    
    let reportFilePath;
    try {
      reportFilePath = await saveReport(documentBuffer, engagement);
    } catch (error) {
      const errorMsg = `Failed to save report: ${error instanceof Error ? error.message : "Unknown error"}`;
      await markError(engagementId, errorMsg);
      await notifyReportFailed(engagementId, errorMsg);
      return { success: false, error: errorMsg, warnings };
    }

    // 10. Create database record
    onProgress('saving_report', 95, 'Finalizing...');
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const existingReports = await prisma.generatedReport.count({
      where: { engagementId },
    });

    await prisma.generatedReport.create({
      data: {
        engagementId,
        filePath: reportFilePath,
        version: existingReports + 1,
        expiresAt,
      },
    });

    // 11. Update engagement status
    await markComplete(engagementId);
    
    onProgress('complete', 100, 'Report generation completed!');

    const duration = Date.now() - startTime;
    console.log(`Report generation completed in ${duration}ms`);

    // Send success notification
    await notifyReportComplete(engagementId, warnings);

    return { success: true, warnings };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`Report generation failed: ${errorMsg}`, error);

    try {
      await markError(engagementId, errorMsg);
      await notifyReportFailed(engagementId, errorMsg);
    } catch (statusError) {
      console.error("Failed to update engagement status:", statusError);
    }

    return { success: false, error: errorMsg, warnings };
  }
}

