"use client";

import { useState, useEffect, useCallback } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Table from "@/components/ui/Table";

interface EconomicOutlook {
  id: string;
  quarter: number;
  year: number;
  filePath: string;
  uploadedAt: string;
}

export default function EconomicOutlookManager() {
  const [outlooks, setOutlooks] = useState<EconomicOutlook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [quarter, setQuarter] = useState<number>(1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [file, setFile] = useState<File | null>(null);

  const fetchOutlooks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/economic-outlooks");
      const data = await response.json();
      if (data.success) {
        setOutlooks(data.data);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch economic outlooks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOutlooks();
  }, [fetchOutlooks]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("quarter", quarter.toString());
      formData.append("year", year.toString());

      const response = await fetch("/api/economic-outlooks", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        resetForm();
        fetchOutlooks();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to upload economic outlook");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/economic-outlooks/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchOutlooks();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to delete economic outlook");
    } finally {
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setQuarter(1);
    setYear(new Date().getFullYear());
    setFile(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check for missing quarters in the current and previous year
  const getMissingQuarters = () => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear];
    const existing = new Set(outlooks.map((o) => `${o.year}-${o.quarter}`));
    const missing: { quarter: number; year: number }[] = [];

    for (const year of years) {
      for (let q = 1; q <= 4; q++) {
        if (!existing.has(`${year}-${q}`)) {
          missing.push({ quarter: q, year });
        }
      }
    }

    return missing;
  };

  const missingQuarters = getMissingQuarters();

  const columns = [
    {
      key: "quarter",
      header: "Quarter",
      render: (item: EconomicOutlook) => (
        <span className="font-medium">Q{item.quarter} {item.year}</span>
      ),
    },
    {
      key: "uploadedAt",
      header: "Uploaded",
      render: (item: EconomicOutlook) => formatDate(item.uploadedAt),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item: EconomicOutlook) => (
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
          <h3 className="text-lg font-medium text-gray-900">
            Economic Outlooks
          </h3>
          <p className="text-sm text-gray-500">
            Quarterly economic outlook documents matched to valuation dates
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Upload Outlook</Button>
      </div>

      {/* Missing quarters warning */}
      {missingQuarters.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Missing outlooks:</strong>{" "}
            {missingQuarters
              .map((m) => `Q${m.quarter} ${m.year}`)
              .join(", ")}
          </p>
        </div>
      )}

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
          data={outlooks}
          keyExtractor={(item) => item.id}
          emptyMessage="No economic outlooks uploaded yet"
        />
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Upload Economic Outlook"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quarter
              </label>
              <select
                value={quarter}
                onChange={(e) => setQuarter(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              >
                <option value={1}>Q1 (Jan-Mar)</option>
                <option value={2}>Q2 (Apr-Jun)</option>
                <option value={3}>Q3 (Jul-Sep)</option>
                <option value={4}>Q4 (Oct-Dec)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                min={2020}
                max={2100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outlook File (.docx)
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
        title="Delete Economic Outlook"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this economic outlook? This action
          cannot be undone.
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

