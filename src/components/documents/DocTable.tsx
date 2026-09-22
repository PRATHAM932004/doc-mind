"use client";

import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { formatDate } from "@/utils/date";

interface DocumentRow {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: string;
  chunksCount: number;
  createdAt: string;
}

interface DocTableProps {
  documents: DocumentRow[];
  loading: boolean;
  onDeleteSuccess: () => void;
}

export default function DocTable({
  documents,
  loading,
  onDeleteSuccess,
}: DocTableProps) {
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +
      " " +
      ["Bytes", "KB", "MB"][i]
    );
  };

  const getFileExtension = (name: string): string => {
    const dotIndex = name.lastIndexOf(".");
    return dotIndex !== -1 ? name.substring(dotIndex).toUpperCase() : "UNKNOWN";
  };

  const getFileIcon = (name: string) => {
    const ext = getFileExtension(name).toLowerCase();
    if (ext === ".pdf") return "pi pi-file-pdf text-red-500";
    if (ext === ".docx" || ext === ".doc")
      return "pi pi-file-word text-blue-500";
    if (ext === ".txt" || ext === ".md") return "pi pi-file-edit text-teal-500";
    return "pi pi-file text-indigo-500";
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${name}"? This will delete all its indexed vector chunks.`,
      )
    ) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete");
      }

      onDeleteSuccess();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "An error occurred while deleting the document.");
    } finally {
      setDeletingId(null);
    }
  };

  const statusBodyTemplate = (rowData: DocumentRow) => {
    const statusLower = rowData.status.toLowerCase();
    let iconClass = "pi pi-info-circle";
    if (rowData.status === "COMPLETED") iconClass = "pi pi-check-circle";
    else if (rowData.status === "FAILED") iconClass = "pi pi-times-circle";
    else if (rowData.status === "PROCESSING" || rowData.status === "UPLOADING")
      iconClass = "pi pi-spin pi-spinner";

    return (
      <span className={`docmind-badge badge-${statusLower}`}>
        <i className={`${iconClass} text-xs`}></i>
        {rowData.status}
      </span>
    );
  };

  const sizeBodyTemplate = (rowData: DocumentRow) => {
    return (
      <span className="text-600 font-medium">{formatBytes(rowData.size)}</span>
    );
  };

  const extensionBodyTemplate = (rowData: DocumentRow) => {
    return (
      <span className="font-bold text-xs uppercase px-2 py-1 bg-gray-100 dark:bg-gray-800 text-600 dark:text-300 border-round">
        {getFileExtension(rowData.name)}
      </span>
    );
  };

  const dateBodyTemplate = (rowData: DocumentRow) => {
    return (
      <span className="text-500 text-xs">{formatDate(rowData.createdAt)}</span>
    );
  };

  const actionBodyTemplate = (rowData: DocumentRow) => {
    const isDeleting = deletingId === rowData.id;
    return (
      <div className="flex gap-2 justify-content-center">
        <Button
          icon={isDeleting ? "pi pi-spin pi-spinner" : "pi pi-trash"}
          className="p-button-rounded p-button-text p-button-danger p-button-sm"
          onClick={() => handleDelete(rowData.id, rowData.name)}
          disabled={isDeleting || loading}
          tooltip="Delete document & chunks"
          tooltipOptions={{ position: "left" }}
        />
      </div>
    );
  };

  const filteredDocuments = statusFilter
    ? documents.filter((doc) => doc.status === statusFilter)
    : documents;

  const statusOptions = [
    { label: "All Statuses", value: null },
    { label: "COMPLETED", value: "COMPLETED" },
    { label: "PROCESSING", value: "PROCESSING" },
    { label: "UPLOADING", value: "UPLOADING" },
    { label: "FAILED", value: "FAILED" },
  ];

  const renderHeader = () => {
    return (
      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 pb-2">
        <div>
          <h3 className="text-xl font-bold text-900 m-0">Managed Documents</h3>
          <span className="text-xs text-500">
            {filteredDocuments.length} document
            {filteredDocuments.length !== 1 ? "s" : ""} registered
          </span>
        </div>

        <div className="flex flex-column sm:flex-row gap-2 align-items-stretch sm:align-items-center">
          <Dropdown
            value={statusFilter}
            options={statusOptions}
            onChange={(e) => setStatusFilter(e.value)}
            placeholder="Filter by Status"
            className="w-full sm:w-12rem p-inputtext-sm"
            showClear={!!statusFilter}
          />
          <IconField iconPosition="left" className="w-full sm:w-16rem">
            <InputIcon className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search filename..."
              className="w-full p-inputtext-sm"
            />
          </IconField>
        </div>
      </div>
    );
  };

  return (
    <div className="docmind-card">
      <DataTable
        value={filteredDocuments}
        paginator
        rows={10}
        dataKey="id"
        filters={{
          global: { value: globalFilter, matchMode: "contains" },
        }}
        globalFilterFields={["name"]}
        header={renderHeader()}
        emptyMessage={
          <div className="text-center py-6">
            <i className="pi pi-folder-open text-400 text-4xl mb-3"></i>
            <p className="text-600 font-semibold m-0">No documents found</p>
            <p className="text-400 text-xs mt-1">
              Upload files above to populate the knowledge repository.
            </p>
          </div>
        }
        responsiveLayout="scroll"
        className="p-datatable-sm"
        stripedRows
      >
        <Column
          field="name"
          header="Name"
          sortable
          style={{ minWidth: "16rem" }}
          body={(rowData) => (
            <div className="flex align-items-center gap-3">
              <div className="p-2 border-round bg-gray-50 dark:bg-gray-800 flex align-items-center justify-content-center">
                <i className={`${getFileIcon(rowData.name)} text-lg`}></i>
              </div>
              <div className="flex flex-column max-w-15rem md:max-w-22rem">
                <span
                  className="font-bold text-800 text-sm text-overflow-ellipsis overflow-hidden white-space-nowrap"
                  title={rowData.name}
                >
                  {rowData.name}
                </span>
                <span className="text-xs text-400">{rowData.mimeType}</span>
              </div>
            </div>
          )}
        />
        <Column
          header="Type"
          body={extensionBodyTemplate}
          sortable
          style={{ width: "7rem" }}
        />
        <Column
          header="Size"
          body={sizeBodyTemplate}
          sortable
          style={{ width: "8rem" }}
        />
        <Column
          header="Status"
          body={statusBodyTemplate}
          sortable
          style={{ width: "11rem" }}
        />
        <Column
          field="chunksCount"
          header="Chunks"
          sortable
          style={{ width: "7rem" }}
          body={(rowData) => (
            <span className="font-semibold text-700 bg-gray-50 dark:bg-gray-800 px-2 py-1 border-round text-xs">
              {rowData.chunksCount}
            </span>
          )}
          className="text-center"
        />
        <Column
          header="Created At"
          body={dateBodyTemplate}
          sortable
          style={{ width: "13rem" }}
        />
        <Column
          header="Actions"
          body={actionBodyTemplate}
          style={{ width: "6rem", textAlign: "center" }}
        />
      </DataTable>
    </div>
  );
}
