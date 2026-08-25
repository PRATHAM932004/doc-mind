"use client";

import React from "react";
import { PrimeReactProvider } from "primereact/api";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PrimeReactProvider value={{ ripple: true }}>
        {children}
      </PrimeReactProvider>
    </ThemeProvider>
  );
}
