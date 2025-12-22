/**
 * Footnote Handling Utilities
 */

import type { Citation } from "@/types/research";

/**
 * Result of adding footnotes to content
 */
export interface FootnotedContent {
  content: string;
  footnotes: string[];
}

/**
 * Add footnote markers and generate footnote list
 */
export function addFootnotes(
  content: string,
  citations: Citation[]
): FootnotedContent {
  if (!citations || citations.length === 0) {
    return { content, footnotes: [] };
  }

  let modifiedContent = content;
  const footnotes: string[] = [];

  // Add footnote markers for each citation
  citations.forEach((citation, index) => {
    const footnoteNumber = index + 1;
    footnotes.push(`${footnoteNumber}. ${citation.source}`);

    // Try to find the citation text in the content and add marker
    if (citation.text && content.includes(citation.text)) {
      modifiedContent = modifiedContent.replace(
        citation.text,
        `${citation.text}[${footnoteNumber}]`
      );
    }
  });

  return {
    content: modifiedContent,
    footnotes,
  };
}

/**
 * Format footnotes section for document
 */
export function formatFootnotesSection(footnotes: string[]): string {
  if (footnotes.length === 0) {
    return "";
  }

  let section = "\n\n---\nSources:\n";
  footnotes.forEach((footnote) => {
    section += `${footnote}\n`;
  });

  return section;
}

/**
 * Add superscript footnote markers to text
 */
export function addFootnoteMarkers(text: string, positions: number[]): string {
  if (positions.length === 0) return text;

  // Sort positions in descending order to avoid offset issues
  const sortedPositions = [...positions].sort((a, b) => b - a);

  let result = text;
  sortedPositions.forEach((pos, index) => {
    const footnoteNum = positions.length - index;
    result = result.slice(0, pos) + `[${footnoteNum}]` + result.slice(pos);
  });

  return result;
}

/**
 * Extract citations from content with placeholder markers
 */
export function extractCitationsFromContent(content: string): {
  cleanContent: string;
  citations: Citation[];
} {
  const citations: Citation[] = [];
  const citationRegex = /\[cite:\s*([^\]]+)\]/g;

  let match;
  while ((match = citationRegex.exec(content)) !== null) {
    citations.push({
      text: "",
      source: match[1].trim(),
    });
  }

  // Remove citation markers from content
  const cleanContent = content.replace(citationRegex, "");

  return {
    cleanContent,
    citations,
  };
}

/**
 * Create bibliography section from citations
 */
export function createBibliography(citations: Citation[]): string {
  if (citations.length === 0) return "";

  const uniqueSources = Array.from(new Set(citations.map((c) => c.source)));

  let bibliography = "\n\nReferences:\n";
  uniqueSources.forEach((source, index) => {
    bibliography += `${index + 1}. ${source}\n`;
  });

  return bibliography;
}

