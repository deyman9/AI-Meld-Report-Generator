import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/session';
import { parseValuationModel, formatForAPI, validateModelFilePath } from '@/lib/excel';
import { fileExists } from '@/lib/storage';
import type { ApiResponse, ParsedModelResponse } from '@/types/api';

interface ParseModelRequest {
  filePath: string;
}

/**
 * Check if file is a PDF
 */
function isPdfFile(filePath: string): boolean {
  return filePath.toLowerCase().endsWith('.pdf');
}

/**
 * Create a response for PDF files - requires manual input
 */
function createPdfResponse(): ParsedModelResponse {
  return {
    companyName: null,
    valuationDate: null,
    exhibitCount: 1,
    exhibitNames: ['PDF Exhibits'],
    approaches: [],
    concludedValue: null,
    dlom: null,
    warnings: [
      'PDF file uploaded - please enter company name and valuation date manually',
      'Valuation approaches should be selected manually',
    ],
    errors: [],
  };
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

    // Validate file path - allow PDFs too
    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'File path is required' },
        { status: 400 }
      );
    }

    const extension = filePath.toLowerCase().split('.').pop();
    if (!extension || !['xlsx', 'xls', 'xlsm', 'pdf'].includes(extension)) {
      return NextResponse.json(
        { success: false, error: 'File must be an Excel file (.xlsx, .xls, .xlsm) or PDF (.pdf)' },
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

    // Handle PDF files differently - no parsing, just return skeleton
    if (isPdfFile(filePath)) {
      console.log('PDF file detected - returning manual input response');
      return NextResponse.json({
        success: true,
        data: createPdfResponse(),
      });
    }

    // Parse Excel model
    const validation = validateModelFilePath(filePath);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

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

