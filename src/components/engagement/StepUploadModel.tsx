"use client";

import { useState } from "react";
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
        <h2 className="text-2xl font-bold text-gray-900">Upload Valuation Model</h2>
        <p className="mt-2 text-gray-500">
          Upload your Excel valuation model to extract company information
        </p>
      </div>

      {/* File Dropzone */}
      <FileDropzone
        accept=".xlsx,.xls"
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

      {/* Help text */}
      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="font-medium text-gray-700 mb-2">Expected file structure:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Sheet named &quot;LEs&quot; with company info in cells G819 and G824</li>
          <li>Exhibits bounded by &quot;start&quot; and &quot;end&quot; sheets</li>
          <li>Summary sheet with valuation approaches and weights</li>
        </ul>
      </div>
    </div>
  );
}

