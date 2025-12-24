import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { saveFile, generateFileName, getDirectoryForType } from '@/lib/storage';
import { 
  validateFileType, 
  validateFileSize, 
  validateFileExtension,
  MAX_FILE_SIZE,
  getAllowedExtensionsString 
} from '@/lib/utils/fileValidation';
import type { UploadType } from '@/types/storage';
import type { UploadResponse, ErrorResponse } from '@/types/api';

export async function POST(
  request: NextRequest
): Promise<NextResponse<UploadResponse | ErrorResponse>> {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as UploadType | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!type || !['model', 'template', 'outlook', 'example'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid upload type. Must be: model, template, outlook, or example' },
        { status: 400 }
      );
    }

    // Validate file extension (primary validation)
    if (!validateFileExtension(file.name, type)) {
      const allowed = getAllowedExtensionsString(type);
      return NextResponse.json(
        { success: false, error: `Invalid file type. Allowed extensions for ${type}: ${allowed}` },
        { status: 400 }
      );
    }

    // MIME type validation is skipped if extension is valid
    // Browsers report inconsistent MIME types, especially for .xlsm files

    // Validate file size
    if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
      const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename and save
    const fileName = generateFileName(file.name, type);
    const directory = getDirectoryForType(type);
    const filePath = await saveFile(buffer, directory, fileName);

    return NextResponse.json({
      success: true,
      fileName,
      filePath,
      size: file.size,
      mimeType: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during upload' },
      { status: 500 }
    );
  }
}

