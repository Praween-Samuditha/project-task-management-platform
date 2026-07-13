"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ProtectedRoute>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#F7F8F9", fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div style={{ display: "flex", flex: 1, flexDirection: "column", overflow: "hidden" }}>
          <Navbar />
          <main style={{ flex: 1, overflowY: "auto", background: "#FFFFFF" }}>
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
