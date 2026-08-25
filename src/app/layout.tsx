import React from "react";
import { Providers } from "@/components/common/Providers";
import "./globals.scss";

export const metadata = {
  title: "DocMind — AI Company Knowledge Assistant",
  description:
    "Upload documents and ask AI assistant details about your company knowledge base.",
};

const themeScript = `
  (function() {
    try {
      var saved = localStorage.getItem('docmind-theme') || 'system';
      var isDark = saved === 'dark' || (saved === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var theme = isDark ? 'lara-dark-indigo' : 'lara-light-indigo';
      var targetHref = '/themes/' + theme + '/theme.css';
      var themeLink = document.getElementById('primereact-theme');
      if (!themeLink) {
        themeLink = document.createElement('link');
        themeLink.id = 'primereact-theme';
        themeLink.rel = 'stylesheet';
        document.head.appendChild(themeLink);
      }
      themeLink.href = targetHref;
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
