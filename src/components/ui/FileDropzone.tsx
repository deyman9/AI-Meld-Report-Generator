"use client";

import { useCallback, useState, useRef } from "react";

interface FileDropzoneProps {
  accept?: string;
  onFile: (file: File) => void;
  disabled?: boolean;
  uploading?: boolean;
  currentFileName?: string | null;
}

export default function FileDropzone({
  accept = ".xlsx,.xls",
  onFile,
  disabled = false,
  uploading = false,
  currentFileName = null,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  }, [disabled, uploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = useCallback(
    (file: File): boolean => {
      const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;

      if (!acceptedTypes.includes(fileExtension)) {
        setError(`Invalid file type. Accepted: ${accept}`);
        return false;
      }

      // Max 50MB
      if (file.size > 50 * 1024 * 1024) {
        setError("File too large. Maximum size is 50MB.");
        return false;
      }

      setError(null);
      return true;
    },
    [accept]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || uploading) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          onFile(file);
        }
      }
    },
    [disabled, uploading, validateFile, onFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          onFile(file);
        }
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [validateFile, onFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploading]);

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${disabled || uploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          ${
            isDragging
              ? "border-slate-500 bg-slate-50"
              : error
              ? "border-red-300 bg-red-50"
              : currentFileName
              ? "border-green-300 bg-green-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Uploading...</p>
          </div>
        ) : currentFileName ? (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-gray-900 font-medium">{currentFileName}</p>
            <p className="text-sm text-gray-500 mt-1">
              Click or drag to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">
              {isDragging ? "Drop file here" : "Drag and drop your file here"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Accepts {accept} (max 50MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
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
          {error}
        </p>
      )}
    </div>
  );
}

