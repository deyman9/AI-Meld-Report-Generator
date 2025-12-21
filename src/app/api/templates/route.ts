import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { saveFile, generateFileName, STORAGE_DIRS } from '@/lib/storage';
import { 
  validateFileExtension, 
  validateFileSize,
  MAX_FILE_SIZE 
} from '@/lib/utils/fileValidation';
import type { ApiResponse, TemplateData } from '@/types/api';

// GET - List all templates
export async function GET(): Promise<NextResponse<ApiResponse<TemplateData[]>>> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const templates = await prisma.template.findMany({
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        filePath: true,
        uploadedAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: templates as TemplateData[],
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST - Upload new template
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<TemplateData>>> {
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
        { success: false, error: 'Template name is required' },
        { status: 400 }
      );
    }

    if (!type || !['FOUR09A', 'FIFTY_NINE_SIXTY'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid template type. Must be FOUR09A or FIFTY_NINE_SIXTY' },
        { status: 400 }
      );
    }

    // Validate file
    if (!validateFileExtension(file.name, 'template')) {
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
    const fileName = generateFileName(file.name, 'template');
    const filePath = await saveFile(buffer, STORAGE_DIRS.templates, fileName);

    // Create database record
    const template = await prisma.template.create({
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
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: template as TemplateData,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

