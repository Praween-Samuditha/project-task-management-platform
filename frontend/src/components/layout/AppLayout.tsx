"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useTheme } from "./Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <ProtectedRoute>
      <div style={{
        display: "flex", height: "100vh", overflow: "hidden",
        background: isDark ? "#161A1D" : "#F7F8F9",
        fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        transition: "background 0.2s",
      }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div style={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden" }}>
          <Navbar />
          <main style={{
            flex: 1, overflowY: "auto",
            background: isDark ? "#1D2125" : "#FFFFFF",
            transition: "background 0.2s",
          }}>
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
