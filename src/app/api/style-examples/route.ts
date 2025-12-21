import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { saveFile, generateFileName, STORAGE_DIRS } from '@/lib/storage';
import { 
  validateFileExtension, 
  validateFileSize,
  MAX_FILE_SIZE 
} from '@/lib/utils/fileValidation';
import type { ApiResponse, StyleExampleData } from '@/types/api';

// GET - List all style examples
export async function GET(): Promise<NextResponse<ApiResponse<StyleExampleData[]>>> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const examples = await prisma.styleExample.findMany({
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        filePath: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: examples as StyleExampleData[],
    });
  } catch (error) {
    console.error('Error fetching style examples:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch style examples' },
      { status: 500 }
    );
  }
}

// POST - Upload new style example
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<StyleExampleData>>> {
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
    const name = formData.get('name') as string | null;
    const type = formData.get('type') as 'FOUR09A' | 'FIFTY_NINE_SIXTY' | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Example name is required' },
        { status: 400 }
      );
    }

    if (!type || !['FOUR09A', 'FIFTY_NINE_SIXTY'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid example type. Must be FOUR09A or FIFTY_NINE_SIXTY' },
        { status: 400 }
      );
    }

    // Validate file
    if (!validateFileExtension(file.name, 'example')) {
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

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = generateFileName(file.name, 'example');
    const filePath = await saveFile(buffer, STORAGE_DIRS.examples, fileName);

    // Create database record
    const example = await prisma.styleExample.create({
      data: {
        name: name.trim(),
        type,
        filePath,
      },
      select: {
        id: true,
        name: true,
        type: true,
        filePath: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: example as StyleExampleData,
    });
  } catch (error) {
    console.error('Error creating style example:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create style example' },
      { status: 500 }
    );
  }
}

