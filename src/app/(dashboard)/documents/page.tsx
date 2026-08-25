"use client";

import React, { useState, useEffect } from "react";
import FileUpload from "@/components/documents/FileUpload";
import DocTable from "@/components/documents/DocTable";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/documents");
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error("Error loading documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="flex flex-column gap-4">
      {/* Page Title & Subtitle */}
      <div className="flex flex-column sm:flex-row sm:align-items-center sm:justify-content-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-900 m-0">
            Document Repository
          </h1>
          <p className="text-500 text-sm mt-1 mb-0">
            Upload, manage, and index your company documents into vector
            embeddings for AI answering.
          </p>
        </div>
      </div>

      {/* Ingestion Dropzone */}
      <FileUpload onUploadSuccess={fetchDocuments} />

      {/* Document Records Data Table */}
      <DocTable
        documents={documents}
        loading={loading}
        onDeleteSuccess={fetchDocuments}
      />
    </div>
  );
}
