"use client";

import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import ThemeToggle from "@/components/common/ThemeToggle";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Dashboard Overview";
      case "/documents":
        return "Knowledge Documents";
      case "/chat":
        return "Chat Assistant";
      default:
        return "DocMind Console";
    }
  };

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <header className="content-header">
          <div className="flex align-items-center gap-3">
            <button
              type="button"
              className="p-link lg:hidden text-700 hover:text-900 p-2 border-round-md bg-surface-100 flex align-items-center justify-content-center cursor-pointer"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <i className="pi pi-bars text-xl"></i>
            </button>

            <div className="flex align-items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-900 m-0">
                {getPageTitle()}
              </h2>
            </div>
          </div>

          <div className="flex align-items-center gap-3">
            <ThemeToggle compact />
          </div>
        </header>

        <main className="content-body">{children}</main>
      </div>
    </div>
  );
}
