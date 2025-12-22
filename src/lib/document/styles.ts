/**
 * Document Styles
 * Defines consistent styling for valuation reports
 */

import { convertInchesToTwip } from "docx";

// Font settings
export const FONTS = {
  primary: "Calibri",
  secondary: "Times New Roman",
  monospace: "Consolas",
};

// Font sizes (in half-points, so 24 = 12pt)
export const FONT_SIZES = {
  title: 32,      // 16pt
  heading1: 28,   // 14pt
  heading2: 24,   // 12pt
  heading3: 22,   // 11pt
  body: 22,       // 11pt
  small: 18,      // 9pt
  footnote: 16,   // 8pt
};

// Colors
export const COLORS = {
  primary: "1F2937",      // Dark gray/navy
  secondary: "4B5563",    // Medium gray
  accent: "2563EB",       // Blue
  highlight: "FFFF00",    // Yellow
  error: "DC2626",        // Red
  success: "059669",      // Green
  border: "D1D5DB",       // Light gray
  headerBg: "F3F4F6",     // Very light gray
};

// Page margins (in twips)
export const MARGINS = {
  top: convertInchesToTwip(1),
  bottom: convertInchesToTwip(1),
  left: convertInchesToTwip(1.25),
  right: convertInchesToTwip(1.25),
  header: convertInchesToTwip(0.5),
  footer: convertInchesToTwip(0.5),
};

// Spacing (in twips, 20 twips = 1pt)
export const SPACING = {
  paragraphAfter: 200,    // 10pt after paragraphs
  paragraphBefore: 0,
  lineSpacing: 276,       // 1.15 line spacing (240 = single)
  headingAfter: 120,
  headingBefore: 240,
};

// Heading styles
export const HEADING_STYLES = {
  heading1: {
    font: FONTS.primary,
    size: FONT_SIZES.heading1,
    bold: true,
    color: COLORS.primary,
    spacingBefore: SPACING.headingBefore,
    spacingAfter: SPACING.headingAfter,
  },
  heading2: {
    font: FONTS.primary,
    size: FONT_SIZES.heading2,
    bold: true,
    color: COLORS.primary,
    spacingBefore: SPACING.headingBefore,
    spacingAfter: SPACING.headingAfter,
  },
  heading3: {
    font: FONTS.primary,
    size: FONT_SIZES.heading3,
    bold: true,
    color: COLORS.secondary,
    spacingBefore: 160,
    spacingAfter: 80,
  },
};

// Body text style
export const BODY_STYLE = {
  font: FONTS.primary,
  size: FONT_SIZES.body,
  color: COLORS.primary,
  spacingAfter: SPACING.paragraphAfter,
  lineSpacing: SPACING.lineSpacing,
};

// Table styles
export const TABLE_STYLES = {
  headerBackground: COLORS.headerBg,
  borderColor: COLORS.border,
  cellPadding: {
    top: 50,
    bottom: 50,
    left: 100,
    right: 100,
  },
};

// Report type specific styles
export const REPORT_TYPE_STYLES = {
  FOUR09A: {
    title: "409A Valuation Report",
    subtitle: "Fair Market Value of Common Stock",
  },
  FIFTY_NINE_SIXTY: {
    title: "Business Valuation Report",
    subtitle: "Fair Market Value Determination",
  },
};

