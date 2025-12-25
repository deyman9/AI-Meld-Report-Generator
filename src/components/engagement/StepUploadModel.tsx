"use client";

import { useState, useEffect } from "react";
import FileDropzone from "@/components/ui/FileDropzone";
import ParsedDataPreview from "./ParsedDataPreview";
import Button from "@/components/ui/Button";
import type { ParsedModelResponse } from "@/types/excel";

interface StepUploadModelProps {
  onModelParsed: (
    filePath: string,
    fileName: string,
    data: ParsedModelResponse
  ) => void;
  currentFileName: string | null;
  parsedData: ParsedModelResponse | null;
}

export default function StepUploadModel({
  onModelParsed,
  currentFileName,
  parsedData,
}: StepUploadModelProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Manual override fields
  const [manualCompanyName, setManualCompanyName] = useState("");
  const [manualValuationDate, setManualValuationDate] = useState("");
  const [manualDLOM, setManualDLOM] = useState("");
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [currentParsedData, setCurrentParsedData] = useState<ParsedModelResponse | null>(null);
  
  // Update manual fields when parsed data changes
  useEffect(() => {
    if (parsedData) {
      setManualCompanyName(parsedData.companyName || "");
      setManualValuationDate(parsedData.valuationDate ? new Date(parsedData.valuationDate).toISOString().split('T')[0] : "");
      setManualDLOM(parsedData.dlom ? (parsedData.dlom * 100).toString() : "");
    }
  }, [parsedData]);
  
  // Update parent when manual fields change
  const updateParentWithManualData = () => {
    if (currentFilePath && currentParsedData && currentFileName) {
      const updatedData: ParsedModelResponse = {
        ...currentParsedData,
        companyName: manualCompanyName || currentParsedData.companyName,
        valuationDate: manualValuationDate ? new Date(manualValuationDate).toISOString() : currentParsedData.valuationDate,
        dlom: manualDLOM ? parseFloat(manualDLOM) / 100 : currentParsedData.dlom,
      };
      onModelParsed(currentFilePath, currentFileName, updatedData);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      // Upload the file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "model");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const uploadResult = await uploadResponse.json();
      setIsUploading(false);
      setIsParsing(true);

      // Parse the model
      const parseResponse = await fetch("/api/parse-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: uploadResult.filePath }),
      });

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        throw new Error(errorData.error || "Parsing failed");
      }

      const parseResult = await parseResponse.json();

      if (!parseResult.success) {
        throw new Error(parseResult.error || "Parsing failed");
      }

      // Store for manual overrides
      setCurrentFilePath(uploadResult.filePath);
      setCurrentParsedData(parseResult.data);
      
      // Pre-fill manual fields
      setManualCompanyName(parseResult.data.companyName || "");
      setManualValuationDate(parseResult.data.valuationDate ? new Date(parseResult.data.valuationDate).toISOString().split('T')[0] : "");
      setManualDLOM(parseResult.data.dlom ? (parseResult.data.dlom * 100).toString() : "");
      
      // Success - call parent callback
      onModelParsed(uploadResult.filePath, file.name, parseResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsUploading(false);
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Upload Valuation Exhibits</h2>
        <p className="mt-2 text-gray-500">
          Upload your valuation model (Excel or PDF) to extract company information
        </p>
      </div>

      {/* File Dropzone */}
      <FileDropzone
        accept=".xlsx,.xls,.xlsm,.pdf"
        onFile={handleFile}
        disabled={isParsing}
        uploading={isUploading}
        currentFileName={parsedData ? currentFileName : null}
      />

      {/* Parsing state */}
      {isParsing && (
        <div className="flex items-center justify-center gap-3 p-4 bg-slate-50 rounded-lg">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          <span className="text-gray-600">Parsing model...</span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setError(null)}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Parsed Data Preview */}
      {parsedData && !error && <ParsedDataPreview data={parsedData} />}
      
      {/* Manual Override Fields - shown after parsing */}
      {currentParsedData && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="font-medium text-blue-800">Edit Extracted Data</h3>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            Review and correct the extracted values if needed:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={manualCompanyName}
                onChange={(e) => setManualCompanyName(e.target.value)}
                onBlur={updateParentWithManualData}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter company name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valuation Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={manualValuationDate}
                onChange={(e) => setManualValuationDate(e.target.value)}
                onBlur={updateParentWithManualData}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DLOM (%)
              </label>
              <input
                type="number"
                value={manualDLOM}
                onChange={(e) => setManualDLOM(e.target.value)}
                onBlur={updateParentWithManualData}
                min="0"
                max="50"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 15"
              />
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="font-medium text-gray-700 mb-2">Supported formats:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>PDF files (.pdf) - Exhibits in PDF format</li>
          <li>Excel files (.xlsx, .xls, .xlsm) - Valuation models</li>
          <li>Company name and valuation date can be entered manually</li>
        </ul>
      </div>
    </div>
  );
}

