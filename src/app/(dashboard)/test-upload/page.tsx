"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type UploadType = "model" | "template" | "outlook" | "example";

interface UploadResult {
  success: boolean;
  fileName?: string;
  filePath?: string;
  size?: number;
  mimeType?: string;
  error?: string;
}

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<UploadType>("model");
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setResult({ success: false, error: "Please select a file" });
      return;
    }

    setIsUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: "Upload failed. Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const getAcceptedTypes = () => {
    switch (type) {
      case "model":
        return ".xlsx,.xls";
      case "template":
      case "outlook":
      case "example":
        return ".docx";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Test File Upload</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Type */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Upload Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => {
                setType(e.target.value as UploadType);
                setFile(null); // Reset file when type changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="model">Model (.xlsx, .xls)</option>
              <option value="template">Template (.docx)</option>
              <option value="outlook">Economic Outlook (.docx)</option>
              <option value="example">Style Example (.docx)</option>
            </select>
          </div>

          {/* File Input */}
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select File
            </label>
            <input
              type="file"
              id="file"
              accept={getAcceptedTypes()}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" isLoading={isUploading} className="w-full">
            Upload File
          </Button>
        </form>

        {/* Result */}
        {result && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              result.success
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <h3
              className={`font-medium ${
                result.success ? "text-green-800" : "text-red-800"
              }`}
            >
              {result.success ? "Upload Successful!" : "Upload Failed"}
            </h3>
            {result.success ? (
              <div className="mt-2 text-sm text-green-700">
                <p>
                  <strong>File Name:</strong> {result.fileName}
                </p>
                <p>
                  <strong>File Path:</strong> {result.filePath}
                </p>
                <p>
                  <strong>Size:</strong> {((result.size || 0) / 1024).toFixed(2)}{" "}
                  KB
                </p>
                <p>
                  <strong>MIME Type:</strong> {result.mimeType}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-red-700">{result.error}</p>
            )}
          </div>
        )}
      </Card>

      <p className="mt-4 text-sm text-gray-500 text-center">
        This is a temporary test page. Remove before production.
      </p>
    </div>
  );
}

