"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { Message } from "primereact/message";
import { isValidExtension, MAX_FILE_SIZE } from "@/schemas/document";

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<
    "IDLE" | "UPLOADING" | "PROCESSING" | "SUCCESS" | "FAILED"
  >("IDLE");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFile = (selectedFile: File) => {
    setErrorMessage("");
    setUploadStatus("IDLE");

    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrorMessage("File size exceeds the 20MB limit.");
      setFile(null);
      return;
    }

    if (selectedFile.size === 0) {
      setErrorMessage("Empty files are not supported.");
      setFile(null);
      return;
    }

    if (!isValidExtension(selectedFile.name)) {
      setErrorMessage(
        "Unsupported file type. Allowed formats: PDF, DOCX, TXT, MD",
      );
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus("IDLE");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadStatus("UPLOADING");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadStatus("PROCESSING");

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setUploadStatus("SUCCESS");
      setFile(null);
      onUploadSuccess();

      setTimeout(() => {
        setUploadStatus("IDLE");
      }, 4000);
    } catch (err: any) {
      console.error("File upload error:", err);
      setUploadStatus("FAILED");
      setErrorMessage(err.message || "An error occurred during upload.");
    }
  };

  return (
    <div className="docmind-card mb-4">
      <div className="flex align-items-center justify-content-between mb-3">
        <div className="flex align-items-center gap-2">
          <i className="pi pi-cloud-upload text-indigo-500 text-xl"></i>
          <h3 className="text-xl font-bold text-900 m-0">Upload Document</h3>
        </div>
        <span className="text-xs text-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 border-round">
          Max 20MB
        </span>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.txt,.md"
        className="hidden"
      />

      {!file && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`upload-dropzone flex flex-column align-items-center justify-content-center p-5 ${
            dragActive ? "drag-active" : ""
          }`}
          style={{ minHeight: "170px" }}
        >
          <div
            className="w-3rem h-3rem border-circle bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex align-items-center justify-content-center mb-3 shadow-1"
          >
            <i className="pi pi-upload text-2xl"></i>
          </div>
          <span className="font-bold text-800 text-center text-base">
            Drag & drop document here, or{" "}
            <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
          </span>
          <span className="text-xs text-500 mt-2">
            Supported formats: PDF, DOCX, TXT, MD
          </span>
        </div>
      )}

      {file && (
        <div className="p-3 border-1 border-200 border-round-lg bg-gray-50 dark:bg-gray-800 flex flex-column gap-3">
          <div className="flex align-items-center justify-content-between">
            <div className="flex align-items-center gap-3">
              <div
                className="flex align-items-center justify-content-center bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border-round-lg"
                style={{ width: "44px", height: "44px" }}
              >
                <i className="pi pi-file text-xl"></i>
              </div>
              <div className="flex flex-column">
                <span className="font-bold text-800 max-w-15rem md:max-w-30rem overflow-hidden text-overflow-ellipsis white-space-nowrap">
                  {file.name}
                </span>
                <span className="text-xs text-500">
                  {formatBytes(file.size)}
                </span>
              </div>
            </div>

            {uploadStatus === "IDLE" && (
              <Button
                icon="pi pi-times"
                className="p-button-rounded p-button-text p-button-secondary"
                onClick={removeFile}
                tooltip="Remove file"
              />
            )}
          </div>

          {uploadStatus === "IDLE" && (
            <div className="flex justify-content-end gap-2 pt-2 border-top-1 border-200">
              <Button
                label="Cancel"
                className="p-button-outlined p-button-secondary"
                onClick={removeFile}
                size="small"
              />
              <Button
                label="Upload & Index"
                icon="pi pi-cloud-upload"
                onClick={handleUpload}
                size="small"
                className="p-button-primary"
              />
            </div>
          )}

          {(uploadStatus === "UPLOADING" || uploadStatus === "PROCESSING") && (
            <div className="flex flex-column gap-2 mt-2">
              <div className="flex justify-content-between text-xs font-semibold">
                <span className="text-indigo-600 dark:text-indigo-400">
                  {uploadStatus === "UPLOADING"
                    ? "Uploading file to server..."
                    : "AI Processing (extracting text & generating vector embeddings)..."}
                </span>
                <i className="pi pi-spin pi-spinner text-indigo-600 dark:text-indigo-400"></i>
              </div>
              <ProgressBar mode="indeterminate" style={{ height: "6px" }} />
            </div>
          )}
        </div>
      )}

      {uploadStatus === "SUCCESS" && (
        <div className="mt-3">
          <Message
            severity="success"
            text="Document uploaded, parsed, and indexed into vectors successfully!"
            className="w-full justify-content-start"
          />
        </div>
      )}

      {errorMessage && (
        <div className="mt-3">
          <Message
            severity="error"
            text={errorMessage}
            className="w-full justify-content-start"
          />
        </div>
      )}
    </div>
  );
}
