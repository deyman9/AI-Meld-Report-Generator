"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface ParsedModelData {
  companyName: string | null;
  valuationDate: string | null;
  exhibitCount: number;
  exhibitNames: string[];
  approaches: { name: string; indicatedValue: number | null; weight: number | null }[];
  concludedValue: number | null;
  dlom: number | null;
  warnings: string[];
  errors: string[];
}

interface UploadResult {
  success: boolean;
  fileName?: string;
  filePath?: string;
  error?: string;
}

interface ParseResult {
  success: boolean;
  data?: ParsedModelData;
  error?: string;
}

export default function TestParserPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadResult(null);
    setParseResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "model");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setUploadResult(data);
    } catch (error) {
      setUploadResult({ success: false, error: "Upload failed" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleParse = async () => {
    if (!uploadResult?.filePath) return;

    setIsParsing(true);
    setParseResult(null);

    try {
      const response = await fetch("/api/parse-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath: uploadResult.filePath }),
      });

      const data = await response.json();
      setParseResult(data);
    } catch (error) {
      setParseResult({ success: false, error: "Parsing failed" });
    } finally {
      setIsParsing(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number | null) => {
    if (value === null) return "N/A";
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Test Excel Parser
      </h1>

      {/* Step 1: Upload */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Step 1: Upload Excel Model
        </h2>

        <div className="space-y-4">
          <div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <Button onClick={handleUpload} isLoading={isUploading} disabled={!file}>
            Upload File
          </Button>
        </div>

        {uploadResult && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              uploadResult.success
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {uploadResult.success ? (
              <p>✓ Uploaded: {uploadResult.fileName}</p>
            ) : (
              <p>✗ {uploadResult.error}</p>
            )}
          </div>
        )}
      </Card>

      {/* Step 2: Parse */}
      {uploadResult?.success && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Step 2: Parse Model
          </h2>

          <Button onClick={handleParse} isLoading={isParsing}>
            Parse Excel File
          </Button>
        </Card>
      )}

      {/* Results */}
      {parseResult && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Parsing Results
          </h2>

          {parseResult.success && parseResult.data ? (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Company Name
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {parseResult.data.companyName || "Not found"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Valuation Date
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(parseResult.data.valuationDate)}
                  </p>
                </div>
              </div>

              {/* Exhibits */}
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  Exhibits Found ({parseResult.data.exhibitCount})
                </p>
                <div className="flex flex-wrap gap-2">
                  {parseResult.data.exhibitNames.map((name, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-slate-100 text-slate-700 text-sm rounded"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Approaches */}
              {parseResult.data.approaches.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Valuation Approaches
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-500">
                            Approach
                          </th>
                          <th className="text-right py-2 font-medium text-gray-500">
                            Indicated Value
                          </th>
                          <th className="text-right py-2 font-medium text-gray-500">
                            Weight
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {parseResult.data.approaches.map((approach, i) => (
                          <tr key={i} className="border-b border-gray-100">
                            <td className="py-2">{approach.name}</td>
                            <td className="py-2 text-right">
                              {formatCurrency(approach.indicatedValue)}
                            </td>
                            <td className="py-2 text-right">
                              {formatPercentage(approach.weight)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Summary Values */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Concluded Value
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(parseResult.data.concludedValue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">DLOM</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatPercentage(parseResult.data.dlom)}
                  </p>
                </div>
              </div>

              {/* Warnings */}
              {parseResult.data.warnings.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-yellow-600 mb-2">
                    Warnings ({parseResult.data.warnings.length})
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {parseResult.data.warnings.map((warning, i) => (
                      <li key={i} className="text-sm text-yellow-700">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Errors */}
              {parseResult.data.errors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-600 mb-2">
                    Errors ({parseResult.data.errors.length})
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {parseResult.data.errors.map((error, i) => (
                      <li key={i} className="text-sm text-red-700">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {parseResult.error}
            </div>
          )}
        </Card>
      )}

      <p className="mt-4 text-sm text-gray-500 text-center">
        This is a temporary test page. Remove before production.
      </p>
    </div>
  );
}

