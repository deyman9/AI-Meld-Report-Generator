import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { deleteFile } from '@/lib/storage';
import type { ApiResponse, TemplateData } from '@/types/api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get single template
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<TemplateData>>> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const template = await prisma.template.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true,
        filePath: true,
        uploadedAt: true,
        updatedAt: true,
      },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template as TemplateData,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get template to find file path
    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    // Delete file from storage
    await deleteFile(template.filePath);

    // Delete database record
    await prisma.template.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

