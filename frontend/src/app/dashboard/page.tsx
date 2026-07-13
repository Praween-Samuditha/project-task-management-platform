"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/services/api";
import { DashboardStats, Task } from "@/types";
import { getTasks } from "@/services/task.service";
import { useAuth } from "@/hooks/useAuth";
import KanbanBoard from "@/components/ui/KanbanBoard";

const accentBlue = "#0052CC";
const border = "#DCDFE4";
const textPrimary = "#172B4D";
const textSecondary = "#44546F";

const STAT_CONFIG = [
  { key: "totalUsers", label: "Total Users", icon: "👥", color: accentBlue, bg: "#E8F0FE" },
  { key: "totalProjects", label: "Total Projects", icon: "📁", color: "#6554C0", bg: "#EAE6FF" },
  { key: "activeProjects", label: "Active Projects", icon: "✅", color: "#006644", bg: "#E3FCEF" },
  { key: "totalTasks", label: "Total Tasks", icon: "📋", color: "#FF8B00", bg: "#FFF7E6" },
  { key: "todoTasks", label: "To Do", icon: "🔵", color: "#44546F", bg: "#F1F2F4" },
  { key: "inProgressTasks", label: "In Progress", icon: "🟡", color: "#FF8B00", bg: "#FFF7E6" },
  { key: "completedTasks", label: "Completed", icon: "🟢", color: "#006644", bg: "#E3FCEF" },
];

export default function DashboardPage() {
  const { role } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "board">("summary");

  useEffect(() => {
    api.get("/dashboard").then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "board") {
      setTaskLoading(true);
      getTasks({ page: 1, limit: 100 })
        .then((data) => setTasks(data.tasks ?? []))
        .catch(() => setTasks([]))
        .finally(() => setTaskLoading(false));
    }
  }, [activeTab]);

  const completionRate = stats && stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const activityRate = stats && stats.totalProjects > 0 ? Math.round((stats.activeProjects / stats.totalProjects) * 100) : 0;

  return (
    <AppLayout>
      <div style={{ fontFamily: "inherit" }}>
        {/* Page header */}
        <div style={{ borderBottom: `1px solid ${border}`, padding: "16px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: textSecondary }}>Spaces</span>
            <span style={{ color: textSecondary }}>›</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, background: "#FF5630", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 10 }}>FP</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: textPrimary, margin: 0 }}>FlowPilot — Dashboard</h1>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0 }}>
            {["Summary", "Projects", "Board", "Members"].map((tab, i) => {
              const tabKey = (tab.toLowerCase() === "board" ? "board" : tab === "Summary" ? "summary" : "summary") as "summary" | "board";
              const isActive = (tab === "Summary" && activeTab === "summary") || (tab === "Board" && activeTab === "board");
              return (
                <div key={tab} style={{
                  padding: "8px 16px", fontSize: 14, fontWeight: isActive ? 600 : 400,
                  color: isActive ? accentBlue : textSecondary, cursor: "pointer",
                  borderBottom: isActive ? `2px solid ${accentBlue}` : "2px solid transparent",
                  transition: "color 0.1s"
                }}
                onClick={() => {
                  if (tab === "Summary") setActiveTab("summary");
                  else if (tab === "Board") setActiveTab("board");
                }}>
                  {tab}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {activeTab === "board" ? (
            // Board View - Kanban
            <KanbanBoard 
              tasks={tasks}
              isLoading={taskLoading}
              onTaskUpdate={(updatedTask) => {
                // Handle task update if needed
                setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
              }}
            />
          ) : (
            // Summary View - Stats and Progress
            <>
          {/* Stat cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 12, marginBottom: 24 }}>
            {loading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} style={{ border: `1px solid ${border}`, borderRadius: 8, padding: 16, background: "#fff" }}>
                    <div style={{ height: 10, width: 80, background: "#F1F2F4", borderRadius: 4, marginBottom: 12 }} />
                    <div style={{ height: 28, width: 60, background: "#F1F2F4", borderRadius: 4 }} />
                  </div>
                ))
              : stats && STAT_CONFIG.map(({ key, label, icon, color, bg }) => (
                  <div key={key} style={{ border: `1px solid ${border}`, borderRadius: 8, padding: 16, background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 2px rgba(9,30,66,0.04)" }}>
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: textSecondary, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 6px" }}>{label}</p>
                      <p style={{ fontSize: 28, fontWeight: 700, color, margin: 0 }}>{(stats as any)[key]}</p>
                    </div>
                    <div style={{ width: 40, height: 40, background: bg, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
                  </div>
                ))
            }
          </div>

          {!loading && stats && (
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
              {/* Task Progress */}
              <div style={{ border: `1px solid ${border}`, borderRadius: 8, padding: 20, background: "#fff", boxShadow: "0 1px 2px rgba(9,30,66,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: textPrimary, margin: 0 }}>Task Progress</h3>
                  <span style={{ fontSize: 12, color: textSecondary }}>{stats.completedTasks} / {stats.totalTasks} completed</span>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: textSecondary }}>Overall completion</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#006644" }}>{completionRate}%</span>
                  </div>
                  <div style={{ height: 8, background: "#F1F2F4", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${completionRate}%`, background: "#36B37E", borderRadius: 999, transition: "width 0.7s" }} />
                  </div>
                </div>

                {[
                  { label: "To Do", count: stats.todoTasks, color: "#8590A2" },
                  { label: "In Progress", count: stats.inProgressTasks, color: "#FFAB00" },
                  { label: "Completed", count: stats.completedTasks, color: "#36B37E" },
                ].map(({ label, count, color }) => (
                  <div key={label} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: textSecondary }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>{count}</span>
                    </div>
                    <div style={{ height: 6, background: "#F1F2F4", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: stats.totalTasks > 0 ? `${(count / stats.totalTasks) * 100}%` : "0%", background: color, borderRadius: 999, transition: "width 0.7s" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Projects Panel */}
              <div style={{ border: `1px solid ${border}`, borderRadius: 8, padding: 20, background: "#fff", boxShadow: "0 1px 2px rgba(9,30,66,0.04)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: textPrimary, margin: "0 0 16px" }}>Projects</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { label: "Total", value: stats.totalProjects, color: textPrimary },
                    { label: "Active", value: stats.activeProjects, color: "#006644" },
                    { label: "Other", value: stats.totalProjects - stats.activeProjects, color: textSecondary },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: textSecondary }}>{label}</span>
                      <span style={{ fontSize: 24, fontWeight: 700, color }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: textSecondary }}>Activity rate</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#006644" }}>{activityRate}%</span>
                  </div>
                  <div style={{ height: 6, background: "#F1F2F4", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${activityRate}%`, background: "#36B37E", borderRadius: 999, transition: "width 0.7s" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
