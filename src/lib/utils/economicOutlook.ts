import { prisma } from '@/lib/db/prisma';

/**
 * Gets the quarter and year from a date
 * Q1: Jan-Mar, Q2: Apr-Jun, Q3: Jul-Sep, Q4: Oct-Dec
 */
export function getQuarterFromDate(date: Date): { quarter: number; year: number } {
  const month = date.getMonth(); // 0-11
  const year = date.getFullYear();

  let quarter: number;
  if (month < 3) {
    quarter = 1;
  } else if (month < 6) {
    quarter = 2;
  } else if (month < 9) {
    quarter = 3;
  } else {
    quarter = 4;
  }

  return { quarter, year };
}

/**
 * Finds the economic outlook for a specific date
 */
export async function findOutlookForDate(date: Date) {
  const { quarter, year } = getQuarterFromDate(date);

  const outlook = await prisma.economicOutlook.findFirst({
    where: {
      quarter,
      year,
    },
  });

  return outlook;
}

/**
 * Validates a quarter value (1-4)
 */
export function isValidQuarter(quarter: number): boolean {
  return Number.isInteger(quarter) && quarter >= 1 && quarter <= 4;
}

/**
 * Validates a year value (reasonable range)
 */
export function isValidYear(year: number): boolean {
  return Number.isInteger(year) && year >= 2020 && year <= 2100;
}

/**
 * Formats quarter for display (e.g., "Q1 2024")
 */
export function formatQuarterYear(quarter: number, year: number): string {
  return `Q${quarter} ${year}`;
}

/**
 * Gets all quarters that are missing outlooks for a given year range
 */
export async function getMissingOutlooks(startYear: number, endYear: number) {
  const existingOutlooks = await prisma.economicOutlook.findMany({
    where: {
      year: {
        gte: startYear,
        lte: endYear,
      },
    },
    select: {
      quarter: true,
      year: true,
    },
  });

  const existingSet = new Set(
    existingOutlooks.map((o) => `${o.year}-${o.quarter}`)
  );

  const missing: { quarter: number; year: number }[] = [];

  for (let year = startYear; year <= endYear; year++) {
    for (let quarter = 1; quarter <= 4; quarter++) {
      const key = `${year}-${quarter}`;
      if (!existingSet.has(key)) {
        missing.push({ quarter, year });
      }
    }
  }

  return missing;
}

