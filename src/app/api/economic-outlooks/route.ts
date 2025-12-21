import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { saveFile, generateFileName, STORAGE_DIRS } from '@/lib/storage';
import { 
  validateFileExtension, 
  validateFileSize,
  MAX_FILE_SIZE 
} from '@/lib/utils/fileValidation';
import { isValidQuarter, isValidYear } from '@/lib/utils/economicOutlook';
import type { ApiResponse, EconomicOutlookData } from '@/types/api';

// GET - List all economic outlooks
export async function GET(): Promise<NextResponse<ApiResponse<EconomicOutlookData[]>>> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const outlooks = await prisma.economicOutlook.findMany({
      orderBy: [{ year: 'desc' }, { quarter: 'desc' }],
      select: {
        id: true,
        quarter: true,
        year: true,
        filePath: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: outlooks as EconomicOutlookData[],
    });
  } catch (error) {
    console.error('Error fetching economic outlooks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch economic outlooks' },
      { status: 500 }
    );
  }
}

// POST - Upload new economic outlook
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<EconomicOutlookData>>> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const quarterStr = formData.get('quarter') as string | null;
    const yearStr = formData.get('year') as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!quarterStr || !yearStr) {
      return NextResponse.json(
        { success: false, error: 'Quarter and year are required' },
        { status: 400 }
      );
    }

    const quarter = parseInt(quarterStr, 10);
    const year = parseInt(yearStr, 10);

    // Validate quarter and year
    if (!isValidQuarter(quarter)) {
      return NextResponse.json(
        { success: false, error: 'Quarter must be 1, 2, 3, or 4' },
        { status: 400 }
      );
    }

    if (!isValidYear(year)) {
      return NextResponse.json(
        { success: false, error: 'Year must be between 2020 and 2100' },
        { status: 400 }
      );
    }

    // Check for existing outlook for this quarter/year
    const existing = await prisma.economicOutlook.findFirst({
      where: { quarter, year },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `An economic outlook for Q${quarter} ${year} already exists` },
        { status: 400 }
      );
    }

    // Validate file
    if (!validateFileExtension(file.name, 'outlook')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only .docx files are allowed' },
        { status: 400 }
      );
    }

    if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 50MB' },
        { status: 400 }
      );
    }

    // Save file with naming convention
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `EOU_Q${quarter}_${year}_${generateFileName(file.name)}`;
    const filePath = await saveFile(buffer, STORAGE_DIRS.outlooks, fileName);

    // Create database record
    const outlook = await prisma.economicOutlook.create({
      data: {
        quarter,
        year,
        filePath,
      },
      select: {
        id: true,
        quarter: true,
        year: true,
        filePath: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: outlook as EconomicOutlookData,
    });
  } catch (error) {
    console.error('Error creating economic outlook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create economic outlook' },
      { status: 500 }
    );
  }
}

