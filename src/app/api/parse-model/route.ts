import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { parseValuationModel, formatForAPI, validateModelFilePath } from '@/lib/excel';
import { fileExists } from '@/lib/storage';
import type { ApiResponse, ParsedModelResponse } from '@/types/api';

interface ParseModelRequest {
  filePath: string;
}

// POST - Parse a valuation model
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ParsedModelResponse>>> {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as ParseModelRequest;
    const { filePath } = body;

    // Validate file path
    const validation = validateModelFilePath(filePath);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Check if file exists
    const exists = await fileExists(filePath);
    if (!exists) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Parse the model
    const parsedModel = await parseValuationModel(filePath);

    // Check for critical errors
    if (parsedModel.errors.length > 0 && !parsedModel.companyName && !parsedModel.valuationDate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to parse model: ' + parsedModel.errors.join('; ') 
        },
        { status: 400 }
      );
    }

    // Format for API response
    const response = formatForAPI(parsedModel);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error parsing model:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to parse model' },
      { status: 500 }
    );
  }
}

