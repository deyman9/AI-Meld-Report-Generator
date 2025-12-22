/**
 * Template Loading and Parsing
 * Handles reading and parsing .docx template files
 */

import mammoth from "mammoth";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import type {
  TemplateContent,
  TemplateSection,
  Placeholder,
  TemplateMetadata,
  TemplateValidationResult,
  TemplateSectionType,
} from "@/types/template";
import { STANDARD_PLACEHOLDERS, GENERATED_SECTIONS } from "@/types/template";

/**
 * Load and parse a template file
 */
export async function loadTemplate(
  filePath: string,
  templateId: string,
  templateName: string,
  templateType: "FOUR09A" | "FIFTY_NINE_SIXTY"
): Promise<TemplateContent> {
  // Verify file exists
  if (!existsSync(filePath)) {
    throw new Error(`Template file not found: ${filePath}`);
  }

  // Read file
  const buffer = await readFile(filePath);

  // Extract text using mammoth
  const result = await mammoth.extractRawText({ buffer });
  const rawText = result.value;

  // Find placeholders
  const placeholders = findPlaceholders(rawText);

  // Identify sections
  const sections = identifySections(rawText, placeholders);

  // Create metadata
  const metadata: TemplateMetadata = {
    loadedAt: new Date(),
    fileSize: buffer.length,
    paragraphCount: rawText.split(/\n\n+/).length,
    wordCount: rawText.split(/\s+/).length,
  };

  return {
    id: templateId,
    name: templateName,
    type: templateType,
    filePath,
    rawText,
    sections,
    placeholders,
    metadata,
  };
}

/**
 * Find all placeholders in content
 */
export function findPlaceholders(content: string): Placeholder[] {
  const placeholders: Placeholder[] = [];
  const regex = /\*[A-Z][A-Z0-9_]*/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const placeholder = match[0];
    const standardDef = STANDARD_PLACEHOLDERS[placeholder];

    placeholders.push({
      placeholder,
      position: match.index,
      length: placeholder.length,
      dataKey: standardDef?.dataKey || placeholder.replace("*", "").toLowerCase(),
      required: standardDef?.required || false,
    });
  }

  return placeholders;
}

/**
 * Identify sections in template
 */
export function identifySections(
  content: string,
  placeholders: Placeholder[]
): TemplateSection[] {
  const sections: TemplateSection[] = [];
  const lines = content.split("\n");

  let currentSection: Partial<TemplateSection> | null = null;
  let currentContent: string[] = [];
  let position = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    const lineLength = line.length + 1; // +1 for newline

    // Check if this is a heading (simple heuristic)
    const isHeading = isLikelyHeading(trimmedLine);

    if (isHeading && trimmedLine.length > 0) {
      // Save previous section if exists
      if (currentSection) {
        currentSection.content = currentContent.join("\n");
        currentSection.endPosition = position;
        currentSection.placeholders = placeholders.filter(
          (p) =>
            p.position >= currentSection!.startPosition! &&
            p.position < position
        );
        sections.push(currentSection as TemplateSection);
      }

      // Determine section type
      const sectionType = determineSectionType(trimmedLine, currentContent.join("\n"));

      // Start new section
      currentSection = {
        name: trimmedLine,
        heading: trimmedLine,
        headingLevel: determineHeadingLevel(trimmedLine),
        type: sectionType,
        startPosition: position,
        placeholders: [],
      };
      currentContent = [];
    } else {
      currentContent.push(line);
    }

    position += lineLength;
  }

  // Save final section
  if (currentSection) {
    currentSection.content = currentContent.join("\n");
    currentSection.endPosition = position;
    currentSection.placeholders = placeholders.filter(
      (p) =>
        p.position >= currentSection!.startPosition! && p.position < position
    );
    sections.push(currentSection as TemplateSection);
  }

  return sections;
}

/**
 * Determine if a line is likely a heading
 */
function isLikelyHeading(line: string): boolean {
  if (!line || line.length === 0) return false;
  if (line.length > 100) return false; // Too long for heading

  // Check for common heading patterns
  const headingPatterns = [
    /^[IVX]+\.\s+/, // Roman numerals
    /^[0-9]+\.\s+/, // Numbered
    /^[A-Z][A-Z\s]+$/, // ALL CAPS
    /^(Section|Chapter|Part)\s+/i,
    /Overview$/i,
    /Analysis$/i,
    /Conclusion$/i,
    /Summary$/i,
    /Methodology$/i,
  ];

  return headingPatterns.some((pattern) => pattern.test(line));
}

/**
 * Determine heading level (1, 2, or 3)
 */
function determineHeadingLevel(heading: string): number {
  // Simple heuristic based on formatting
  if (/^[IVX]+\./.test(heading)) return 1;
  if (/^[0-9]+\./.test(heading)) return 2;
  if (/^[a-z]\./.test(heading)) return 3;

  // Default based on ALL CAPS
  if (heading === heading.toUpperCase()) return 1;

  return 2;
}

/**
 * Determine section type based on heading and content
 */
function determineSectionType(heading: string, content: string): TemplateSectionType {
  const headingLower = heading.toLowerCase();

  // Check for generated sections
  for (const [, patterns] of Object.entries(GENERATED_SECTIONS)) {
    if (patterns.some((p) => headingLower.includes(p))) {
      return "generated";
    }
  }

  // Check for placeholders in content
  if (/\*[A-Z]/.test(content)) {
    return "substitution";
  }

  return "boilerplate";
}

/**
 * Validate template for a specific report type
 */
export function validateTemplate(
  template: TemplateContent,
  reportType: "FOUR09A" | "FIFTY_NINE_SIXTY"
): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingPlaceholders: string[] = [];
  const unknownPlaceholders: string[] = [];

  // Check template type matches
  if (template.type !== reportType) {
    errors.push(`Template type ${template.type} does not match expected type ${reportType}`);
  }

  // Check for required placeholders
  const foundPlaceholders = new Set(template.placeholders.map((p) => p.placeholder));

  for (const [placeholder, def] of Object.entries(STANDARD_PLACEHOLDERS)) {
    if (def.required && !foundPlaceholders.has(placeholder)) {
      missingPlaceholders.push(placeholder);
      warnings.push(`Required placeholder ${placeholder} not found in template`);
    }
  }

  // Check for unknown placeholders
  for (const p of template.placeholders) {
    if (!STANDARD_PLACEHOLDERS[p.placeholder]) {
      unknownPlaceholders.push(p.placeholder);
    }
  }

  if (unknownPlaceholders.length > 0) {
    warnings.push(`Unknown placeholders found: ${unknownPlaceholders.join(", ")}`);
  }

  // Check for required sections
  const hasCompanySection = template.sections.some(
    (s) => s.type === "generated" &&
      GENERATED_SECTIONS.COMPANY_OVERVIEW.some((p) =>
        s.name.toLowerCase().includes(p)
      )
  );

  if (!hasCompanySection) {
    warnings.push("No Company Overview section identified");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingPlaceholders,
    unknownPlaceholders,
  };
}

/**
 * Extract just the text content from a template file
 */
export async function extractTemplateText(filePath: string): Promise<string> {
  if (!existsSync(filePath)) {
    throw new Error(`Template file not found: ${filePath}`);
  }

  const buffer = await readFile(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

