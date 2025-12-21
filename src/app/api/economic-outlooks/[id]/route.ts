import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { deleteFile } from '@/lib/storage';
import type { ApiResponse } from '@/types/api';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE - Delete economic outlook
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

    // Get outlook to find file path
    const outlook = await prisma.economicOutlook.findUnique({
      where: { id },
    });

    if (!outlook) {
      return NextResponse.json(
        { success: false, error: 'Economic outlook not found' },
        { status: 404 }
      );
    }

    // Delete file from storage
    await deleteFile(outlook.filePath);

    // Delete database record
    await prisma.economicOutlook.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Economic outlook deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting economic outlook:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete economic outlook' },
      { status: 500 }
    );
  }
}

