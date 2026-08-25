import React from "react";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/utils/date";

export const revalidate = 0; // Disable caching to ensure fresh metrics

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default async function DashboardPage() {
  // Query database metrics directly
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
  });

  const chunksCount = await prisma.documentChunk.count();

  const totalDocs = documents.length;
  const failedDocs = documents.filter((d) => d.status === "FAILED").length;
  const completedDocs = documents.filter(
    (d) => d.status === "COMPLETED",
  ).length;
  const processingDocs = documents.filter(
    (d) => d.status === "PROCESSING" || d.status === "UPLOADING",
  ).length;

  const recentDocuments = documents.slice(0, 5);

  const stats = [
    {
      label: "Total Documents",
      value: totalDocs,
      icon: "pi-file",
      iconColor: "text-indigo-500",
      bgClass: "bg-indigo-50 dark:bg-indigo-950",
    },
    {
      label: "Indexed Chunks",
      value: chunksCount,
      icon: "pi-database",
      iconColor: "text-blue-500",
      bgClass: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Processing / Queue",
      value: processingDocs,
      icon: "pi-spin pi-spinner",
      iconColor: "text-orange-500",
      bgClass: "bg-orange-50 dark:bg-orange-950",
    },
    {
      label: "Failed Documents",
      value: failedDocs,
      icon: "pi-exclamation-triangle",
      iconColor: "text-red-500",
      bgClass: "bg-red-50 dark:bg-red-950",
    },
  ];

  return (
    <div className="flex flex-column gap-4">
      {/* Title & Quick Actions Block */}
      <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-900 m-0">
            System Overview
          </h1>
          <p className="text-500 text-sm mt-1 mb-0">
            Real-time status of your indexed enterprise documentation and AI knowledge base.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/documents"
            className="p-button p-button-sm p-button-outlined p-button-secondary flex align-items-center gap-2 no-underline"
          >
            <i className="pi pi-upload"></i>
            <span>Upload Files</span>
          </Link>
          <Link
            href="/chat"
            className="p-button p-button-sm p-button-primary flex align-items-center gap-2 no-underline"
          >
            <i className="pi pi-comments"></i>
            <span>Start Chat</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid col-12 p-0 m-0 gap-3 md:gap-0">
        {stats.map((stat, i) => (
          <div key={i} className="col-12 sm:col-6 lg:col-3 p-2">
            <div className="kpi-card">
              <div>
                <span className="block text-500 text-xs font-bold uppercase tracking-wider mb-2">
                  {stat.label}
                </span>
                <span className="text-3xl font-extrabold text-900">
                  {stat.value.toLocaleString()}
                </span>
              </div>
              <div
                className={`flex align-items-center justify-content-center border-round-xl ${stat.bgClass}`}
                style={{ width: "50px", height: "50px" }}
              >
                <i className={`pi ${stat.icon} text-2xl ${stat.iconColor}`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recently Uploaded Documents Block */}
      <div className="docmind-card">
        <div className="flex align-items-center justify-content-between mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-900 m-0">
              Recently Uploaded Documents
            </h3>
            <span className="text-xs text-500">
              Showing latest {recentDocuments.length} document{recentDocuments.length !== 1 ? "s" : ""}
            </span>
          </div>

          <Link
            href="/documents"
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-sm flex align-items-center gap-1 no-underline"
          >
            View all documents <i className="pi pi-arrow-right text-xs"></i>
          </Link>
        </div>

        {recentDocuments.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-4rem h-4rem border-circle bg-gray-100 dark:bg-gray-800 text-400 flex align-items-center justify-content-center mx-auto mb-3">
              <i className="pi pi-file-excel text-3xl"></i>
            </div>
            <p className="text-700 font-semibold m-0">No documents uploaded yet</p>
            <p className="text-500 text-xs mt-1">
              Upload your company documents to start querying the AI assistant.
            </p>
            <Link
              href="/documents"
              className="p-button p-button-sm p-button-primary mt-3 inline-flex align-items-center gap-2 no-underline"
            >
              <i className="pi pi-upload"></i>
              <span>Upload Your First File</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-bottom-1 border-200 text-500 text-xs uppercase font-bold tracking-wider">
                  <th className="py-3 px-3">Document Name</th>
                  <th className="py-3 px-3">Mime Type</th>
                  <th className="py-3 px-3">Size</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created At</th>
                </tr>
              </thead>
              <tbody>
                {recentDocuments.map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-bottom-1 border-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-100 text-sm text-800"
                  >
                    <td className="py-3 px-3 font-semibold max-w-15rem overflow-hidden text-overflow-ellipsis white-space-nowrap">
                      <div className="flex align-items-center gap-2">
                        <i className="pi pi-file text-indigo-500"></i>
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-500 text-xs">{doc.mimeType}</td>
                    <td className="py-3 px-3 text-600 font-medium text-xs">
                      {formatBytes(doc.size)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`docmind-badge badge-${doc.status.toLowerCase()}`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-500 text-xs">
                      {formatDate(doc.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
