"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { chatRequestSchema } from "@/schemas/chat";
import { SourceCitation } from "@/types/chat";
import MarkdownRenderer from "@/components/chat/MarkdownRenderer";

interface MessageState {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<MessageState[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am **DocMind**, your AI company knowledge assistant. Ask me anything about your uploaded company documentation.",
    },
  ]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [sourceDetail, setSourceDetail] = useState<SourceCitation | null>(null);
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(chatRequestSchema),
    defaultValues: {
      message: "",
    },
  });

  const fetchActiveDocuments = async () => {
    setLoadingDocs(true);
    try {
      const response = await fetch("/api/documents");
      if (response.ok) {
        const data = await response.json();
        const activeFiles = (data.documents || []).filter(
          (d: any) => d.status === "COMPLETED",
        );
        setDocuments(activeFiles);
      }
    } catch (err) {
      console.error("Error fetching active documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchActiveDocuments();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiLoading]);

  const handleSendMessage = async (data: { message: string }) => {
    const userMessage = data.message.trim();
    if (!userMessage) return;

    const userMsgId = Math.random().toString(36).substring(7);
    const updatedMessages = [
      ...messages,
      { id: userMsgId, role: "user" as const, content: userMessage },
    ];
    setMessages(updatedMessages);
    reset();
    setAiLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to get response");
      }

      const assistantMsgId = Math.random().toString(36).substring(7);
      setMessages([
        ...updatedMessages,
        {
          id: assistantMsgId,
          role: "assistant",
          content: result.answer,
          sources: result.sources || [],
        },
      ]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errMsgId = Math.random().toString(36).substring(7);
      setMessages([
        ...updatedMessages,
        {
          id: errMsgId,
          role: "assistant",
          content: `Sorry, I encountered an error: ${
            err.message || "Could not fetch response from server."
          }`,
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const openSourceDialog = (source: SourceCitation) => {
    setSourceDetail(source);
    setDialogVisible(true);
  };

  const handleQuickQuestion = (question: string) => {
    setValue("message", question);
    handleSendMessage({ message: question });
  };

  const quickQuestions = [
    "What are the main topics covered in the uploaded documents?",
    "Summarize key responsibilities or policies.",
    "List important deadlines or dates mentioned.",
  ];

  return (
    <div className="flex flex-column h-full flex-1 min-h-0">
      <div className="mb-3 flex-shrink-0 flex align-items-center justify-content-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-900 m-0">
            Ask DocMind
          </h1>
          <p className="text-500 text-sm mt-1 mb-0">
            Query your company documents using verified AI Retrieval-Augmented
            Generation.
          </p>
        </div>
      </div>

      <div className="grid flex-1 overflow-hidden m-0 p-0 gap-3 md:gap-0 min-h-0">
        <div className="col-12 md:col-4 lg:col-3 p-2 h-full flex flex-column min-h-0">
          <div className="docmind-card flex-1 flex flex-column overflow-hidden p-3">
            <div className="flex align-items-center justify-content-between pb-3 border-bottom-1 border-100">
              <h4 className="text-base font-bold text-800 m-0 flex align-items-center gap-2">
                <i className="pi pi-shield text-indigo-500"></i>
                Active Sources
              </h4>
              <span className="text-xs bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 border-round">
                {documents.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pt-3">
              {loadingDocs ? (
                <div className="flex align-items-center justify-content-center py-5">
                  <i className="pi pi-spin pi-spinner text-indigo-500 text-2xl"></i>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-5">
                  <i className="pi pi-folder-open text-400 text-3xl mb-2"></i>
                  <p className="text-500 text-xs m-0">
                    No active documents. Upload files under
                    &quot;Documents&quot; to start asking questions.
                  </p>
                </div>
              ) : (
                <ul className="list-none p-0 m-0 flex flex-column gap-2">
                  {documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex align-items-center gap-2 p-2 border-round-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <i className="pi pi-file text-indigo-500 text-sm flex-shrink-0"></i>
                      <div className="flex flex-column min-w-0 flex-1">
                        <span
                          className="text-xs text-800 font-semibold text-overflow-ellipsis overflow-hidden white-space-nowrap"
                          title={doc.name}
                        >
                          {doc.name}
                        </span>
                        <span className="text-400" style={{ fontSize: "10px" }}>
                          {doc.chunksCount} chunks indexed
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 md:col-8 lg:col-9 p-2 h-full flex flex-column min-h-0">
          <div className="docmind-card flex-1 flex flex-column overflow-hidden p-0">
            <div className="flex-1 overflow-y-auto p-4 flex flex-column gap-4 bg-surface-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user"
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                >
                  <div
                    className={`max-w-30rem md:max-w-45rem p-3 border-round-xl shadow-1 ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white border-round-tr-none"
                        : "bg-white dark:bg-gray-800 border-1 border-200 dark:border-gray-700 text-800 border-round-tl-none"
                    }`}
                  >
                    <div className="flex align-items-center gap-2 mb-2 pb-1 border-bottom-1 border-200 dark:border-gray-700">
                      <i
                        className={`text-xs ${
                          msg.role === "user"
                            ? "pi pi-user text-white"
                            : "pi pi-bolt text-indigo-500"
                        }`}
                      ></i>
                      <span
                        className={`text-xs font-bold ${
                          msg.role === "user"
                            ? "text-white"
                            : "text-indigo-600 dark:text-indigo-400"
                        }`}
                      >
                        {msg.role === "user" ? "You" : "DocMind"}
                      </span>
                    </div>

                    {msg.role === "user" ? (
                      <div className="line-height-3 text-sm white-space-pre-wrap">
                        {msg.content}
                      </div>
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}

                    {msg.role === "assistant" &&
                      msg.sources &&
                      msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-top-1 border-200 dark:border-gray-700">
                          <div className="text-xs text-500 font-bold mb-2 flex align-items-center gap-1 uppercase tracking-wider">
                            <i className="pi pi-bookmark text-indigo-500"></i>{" "}
                            Citations / Sources
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((source, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => openSourceDialog(source)}
                                className="p-link text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-900 text-indigo-700 dark:text-indigo-300 border-round hover:bg-indigo-50 dark:hover:bg-gray-750 cursor-pointer transition-colors duration-150 flex align-items-center gap-1 border-1 border-200 dark:border-gray-700"
                                title="Click to view extracted chunk snippet"
                              >
                                <i className="pi pi-file text-xs"></i>
                                <span className="max-w-10rem overflow-hidden text-overflow-ellipsis white-space-nowrap">
                                  {source.documentName}
                                </span>
                                <span className="text-500 font-normal">
                                  (Chunk {source.chunkIndex})
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="flex justify-content-start">
                  <div className="bg-white dark:bg-gray-800 border-1 border-200 dark:border-gray-700 text-800 border-round-xl border-round-tl-none p-3 shadow-1 max-w-20rem">
                    <div className="flex align-items-center gap-2">
                      <i className="pi pi-spin pi-spinner text-indigo-500"></i>
                      <span className="text-sm text-500 font-semibold">
                        Searching documents & generating answer...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {messages.length <= 1 && !aiLoading && documents.length > 0 && (
                <div className="mt-4 pt-3 border-top-1 border-200 dark:border-gray-700">
                  <span className="text-xs font-bold text-400 uppercase tracking-wider block mb-2">
                    Suggested Questions
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickQuestion(q)}
                        className="p-link text-xs font-medium px-3 py-2 border-round-lg bg-white dark:bg-gray-800 text-700 dark:text-300 border-1 border-200 dark:border-gray-700 hover:border-indigo-500 hover:text-indigo-600 transition-all duration-150 shadow-1 text-left"
                      >
                        <i className="pi pi-search text-xs mr-2 text-indigo-500"></i>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-top-1 border-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <form
                onSubmit={handleSubmit(handleSendMessage)}
                className="flex flex-column gap-1"
              >
                <div className="flex gap-2">
                  <IconField iconPosition="left" className="flex-1">
                    <InputIcon className="pi pi-comments text-indigo-500" />
                    <InputText
                      {...register("message")}
                      placeholder={
                        aiLoading
                          ? "DocMind is thinking..."
                          : "Ask any question about your company documents..."
                      }
                      disabled={aiLoading}
                      autoComplete="off"
                      className={`w-full ${errors.message ? "p-invalid" : ""}`}
                    />
                  </IconField>
                  <Button
                    type="submit"
                    icon="pi pi-send"
                    className="p-button-primary"
                    disabled={aiLoading}
                    tooltip="Send question"
                  />
                </div>
                {errors.message && (
                  <span className="text-xs text-red-500 ml-2 mt-1 block font-medium">
                    {errors.message.message}
                  </span>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        header={
          <div className="flex align-items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <i className="pi pi-file text-xl"></i>
            <span className="font-bold">{sourceDetail?.documentName}</span>
            <span className="text-xs font-normal text-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 border-round">
              Chunk Index #{sourceDetail?.chunkIndex}
            </span>
          </div>
        }
        visible={dialogVisible}
        style={{ width: "90vw", maxWidth: "650px" }}
        onHide={() => setDialogVisible(false)}
        footer={
          <div className="flex justify-content-end">
            <Button
              label="Close"
              icon="pi pi-times"
              onClick={() => setDialogVisible(false)}
              className="p-button-text"
            />
          </div>
        }
      >
        <div className="p-3 bg-gray-50 dark:bg-gray-800 border-1 border-200 dark:border-gray-700 border-round-lg line-height-3 text-sm text-800 dark:text-200 white-space-pre-wrap max-h-20rem overflow-y-auto font-mono">
          {sourceDetail?.content ||
            "No text snippet content available for preview."}
        </div>
      </Dialog>
    </div>
  );
}
