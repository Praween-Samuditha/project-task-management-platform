import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/layout/Navbar";
import { WorkspaceProvider } from "@/lib/WorkspaceContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Task Management Platform",
  description: "Manage your projects and tasks efficiently",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <WorkspaceProvider>
            <Toaster position="top-right" />
            {children}
          </WorkspaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
