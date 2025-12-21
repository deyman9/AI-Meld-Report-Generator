import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { deleteFile } from '@/lib/storage';
import type { ApiResponse } from '@/types/api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE - Delete style example
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

    // Get example to find file path
    const example = await prisma.styleExample.findUnique({
      where: { id },
    });

    if (!example) {
      return NextResponse.json(
        { success: false, error: 'Style example not found' },
        { status: 404 }
      );
    }

    // Delete file from storage
    await deleteFile(example.filePath);

    // Delete database record
    await prisma.styleExample.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Style example deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting style example:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete style example' },
      { status: 500 }
    );
  }
}

