"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Table from "@/components/ui/Table";

interface Template {
  id: string;
  name: string;
  type: "FOUR09A" | "FIFTY_NINE_SIXTY";
  filePath: string;
  uploadedAt: string;
  updatedAt: string;
}

export default function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<"FOUR09A" | "FIFTY_NINE_SIXTY">("FOUR09A");
  const [file, setFile] = useState<File | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/templates");
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch templates");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      formData.append("type", type);

      const response = await fetch("/api/templates", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        resetForm();
        fetchTemplates();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to upload template");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchTemplates();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to delete template");
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setName("");
    setType("FOUR09A");
    setFile(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatType = (type: string) => {
    return type === "FOUR09A" ? "409A" : "59-60";
  };

  const columns = [
    { key: "name", header: "Name" },
    {
      key: "type",
      header: "Type",
      render: (item: Template) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
          {formatType(item.type)}
        </span>
      ),
    },
    {
      key: "uploadedAt",
      header: "Uploaded",
      render: (item: Template) => formatDate(item.uploadedAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: Template) => (
        <button
          onClick={() => setDeleteId(item.id)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Templates</h3>
          <p className="text-sm text-gray-500">
            Word document templates with placeholders (*COMPANY, *VALUATIONDATE)
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Upload Template</Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-800 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
        </div>
      ) : (
        <Table
          columns={columns}
          data={templates}
          keyExtractor={(item) => item.id}
          emptyMessage="No templates uploaded yet"
        />
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Upload Template"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 409A Template v2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Type
            </label>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as "FOUR09A" | "FIFTY_NINE_SIXTY")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              <option value="FOUR09A">409A</option>
              <option value="FIFTY_NINE_SIXTY">59-60</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template File (.docx)
            </label>
            <input
              type="file"
              accept=".docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isUploading}>
              Upload
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Template"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this template? This action cannot be
          undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteId && handleDelete(deleteId)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

