"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/common/ThemeToggle";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", icon: "pi pi-th-large", path: "/" },
    { label: "Documents", icon: "pi pi-file", path: "/documents" },
    { label: "Chat Assistant", icon: "pi pi-comments", path: "/chat" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="flex align-items-center justify-content-between p-3 md:p-4 border-bottom-1 border-100">
          <Link
            href="/"
            className="flex align-items-center gap-3 no-underline"
            onClick={onClose}
          >
            <div
              className="flex align-items-center justify-content-center bg-indigo-600 text-white border-round-xl shadow-2 flex-shrink-0"
              style={{ width: "38px", height: "38px" }}
            >
              <i className="pi pi-bolt text-xl"></i>
            </div>
            <div className="flex flex-column min-w-0">
              <h1 className="text-lg font-bold text-900 m-0 tracking-tight line-height-1 mb-1 white-space-nowrap">
                DocMind
              </h1>
              <span className="text-xs text-500 font-medium flex align-items-center gap-1 white-space-nowrap">
                <span
                  className="border-circle bg-green-500 inline-block flex-shrink-0"
                  style={{ width: "6px", height: "6px" }}
                ></span>
                <span>AI Knowledge Base</span>
              </span>
            </div>
          </Link>

          <button
            type="button"
            className="p-link lg:hidden text-500 hover:text-900 p-2 border-round-md"
            onClick={onClose}
          >
            <i className="pi pi-times text-lg"></i>
          </button>
        </div>

        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="text-xs font-bold text-400 uppercase tracking-wider px-3 mb-2">
            Main Menu
          </div>
          <ul className="list-none p-0 m-0 flex flex-column gap-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    onClick={onClose}
                    className={`flex align-items-center gap-3 px-3 py-3 border-round-lg transition-all duration-150 cursor-pointer no-underline ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 font-bold shadow-1"
                        : "text-600 dark:text-400 hover:bg-gray-100 hover:text-900 font-medium"
                    }`}
                  >
                    <i
                      className={`${item.icon} text-lg ${
                        isActive ? "text-indigo-600 dark:text-indigo-300" : ""
                      }`}
                    ></i>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-3 border-top-1 border-100 bg-gray-50 flex flex-column gap-3">
          <div className="flex align-items-center justify-content-between pt-2 border-top-1 border-100">
            <div className="flex align-items-center gap-2">
              <div className="w-2rem h-2rem border-circle bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex align-items-center justify-content-center font-bold text-xs">
                DM
              </div>
              <div className="flex flex-column">
                <span className="text-sm font-semibold text-800 line-height-1">
                  Admin Console
                </span>
                <span className="text-xs text-500">v1.0.0</span>
              </div>
            </div>
            <i className="pi pi-shield text-indigo-500 text-sm"></i>
          </div>
        </div>
      </aside>
    </>
  );
}
