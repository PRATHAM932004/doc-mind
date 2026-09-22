"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let currentParagraphLines: string[] = [];
  let currentListLines: string[] = [];
  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const flushParagraph = (key: string | number) => {
    if (currentParagraphLines.length > 0) {
      elements.push(
        <p
          key={`p-${key}`}
          className="m-0 mb-2 text-sm line-height-3 text-800 dark:text-200"
        >
          {currentParagraphLines.map((line, idx) => (
            <React.Fragment key={idx}>
              {parseInline(line)}
              {idx < currentParagraphLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>,
      );
      currentParagraphLines = [];
    }
  };

  const flushList = (key: string | number) => {
    if (currentListLines.length > 0) {
      elements.push(
        <ul
          key={`ul-${key}`}
          className="list-none pl-2 m-0 mb-2 flex flex-column gap-1"
        >
          {currentListLines.map((line, idx) => {
            const cleanLine = line.trim().substring(2);
            return (
              <li
                key={idx}
                className="flex align-items-start gap-2 text-sm line-height-3 text-800 dark:text-200"
              >
                <span className="text-indigo-500 font-bold select-none">•</span>
                <span className="flex-1">{parseInline(cleanLine)}</span>
              </li>
            );
          })}
        </ul>,
      );
      currentListLines = [];
    }
  };

  const flushCodeBlock = (key: string | number) => {
    if (codeBlockLines.length > 0) {
      elements.push(
        <div
          key={`codeblock-${key}`}
          className="p-3 my-2 border-round-md bg-gray-900 text-gray-100 text-xs font-mono overflow-x-auto border-1 border-gray-800"
        >
          <pre className="m-0 white-space-pre">{codeBlockLines.join("\n")}</pre>
        </div>,
      );
      codeBlockLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock(i);
        inCodeBlock = false;
      } else {
        flushParagraph(i);
        flushList(i);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph(i);
      flushList(i);
      elements.push(
        <h4
          key={`h4-${i}`}
          className="text-base font-bold text-900 m-0 mt-3 mb-1"
        >
          {parseInline(trimmed.substring(4))}
        </h4>,
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph(i);
      flushList(i);
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-lg font-bold text-900 m-0 mt-3 mb-1"
        >
          {parseInline(trimmed.substring(3))}
        </h3>,
      );
      continue;
    }
    if (trimmed.startsWith("# ")) {
      flushParagraph(i);
      flushList(i);
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-xl font-bold text-900 m-0 mt-3 mb-1"
        >
          {parseInline(trimmed.substring(2))}
        </h2>,
      );
      continue;
    }

    if (trimmed === "---") {
      flushParagraph(i);
      flushList(i);
      elements.push(
        <hr key={`hr-${i}`} className="border-top-1 border-200 w-full my-3" />,
      );
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph(i);
      currentListLines.push(line);
      continue;
    }

    if (trimmed === "") {
      flushParagraph(i);
      flushList(i);
      continue;
    }

    flushList(i);
    currentParagraphLines.push(line);
  }

  flushParagraph("final");
  flushList("final");
  flushCodeBlock("final");

  return <div className="flex flex-column gap-1">{elements}</div>;
}

function parseInline(text: string): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|`.*?`|\*[^\s\*](?:.*?[^\s\*])?\*)/g;
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-900">
          {parseInline(part.slice(2, -2))}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 border-round font-monospace text-xs text-indigo-600 dark:text-indigo-400 border-1 border-200"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={idx} className="font-italic text-800 dark:text-200">
          {parseInline(part.slice(1, -1))}
        </em>
      );
    }
    return part;
  });
}
