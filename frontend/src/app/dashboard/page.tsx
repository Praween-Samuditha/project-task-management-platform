"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import api from "@/services/api";
import { DashboardStats, Task, Project } from "@/types";
import { getTasks } from "@/services/task.service";
import { getProjects } from "@/services/project.service";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/layout/Navbar";
import { useWorkspace } from "@/lib/WorkspaceContext";

const LIGHT = {
  bg: "#F8F9FB", white: "#FFFFFF", border: "#E8ECF0",
  textPrimary: "#1A1D23", textSecondary: "#6B7280", textMuted: "#9CA3AF",
  accent: "#0052CC", green: "#10B981", greenBg: "#D1FAE5", greenText: "#065F46",
  amber: "#F59E0B", amberBg: "#FEF3C7", red: "#EF4444", redBg: "#FEE2E2",
  purple: "#8B5CF6", purpleBg: "#EDE9FE", skeletonBg: "#F1F2F4",
  cardShadow: "0 1px 3px rgba(0,0,0,0.04)", cardHoverShadow: "0 4px 12px rgba(0,82,204,0.10)",
  cardHoverBorder: "#B3C6E8", overdueCountBg: "#F3F4F6",
};

const DARK = {
  bg: "#1D2125", white: "#22272B", border: "#2C333A",
  textPrimary: "#E6EDF3", textSecondary: "#8B949E", textMuted: "#6B7280",
  accent: "#4C9EFF", green: "#3FB950", greenBg: "#1A3A2A", greenText: "#3FB950",
  amber: "#D29922", amberBg: "#2D2208", red: "#F85149", redBg: "#3D1A1A",
  purple: "#A371F7", purpleBg: "#2D1F4A", skeletonBg: "#2C333A",
  cardShadow: "0 1px 3px rgba(0,0,0,0.3)", cardHoverShadow: "0 4px 12px rgba(76,158,255,0.15)",
  cardHoverBorder: "#4C9EFF", overdueCountBg: "#2C333A",
};

const PRIORITY_COLOR_LIGHT: Record<string, string> = {
  LOW: LIGHT.textMuted, MEDIUM: LIGHT.amber, HIGH: "#F97316", URGENT: LIGHT.red,
};
const PRIORITY_COLOR_DARK: Record<string, string> = {
  LOW: DARK.textMuted, MEDIUM: DARK.amber, HIGH: "#F97316", URGENT: DARK.red,
};

type Tokens = typeof LIGHT;

function StatCard({ label, value, sub, icon, iconBg, T }: {
  label: string; value: number | string; sub: string;
  icon: React.ReactNode; iconBg: string; T: Tokens;
}) {
  return (
    <div style={{
      background: T.white, border: `1px solid ${T.border}`, borderRadius: 12,
      padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: T.cardShadow, transition: "background 0.2s",
    }}>
      <div>
        <p style={{ fontSize: 13, color: T.textSecondary, margin: "0 0 6px", fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 32, fontWeight: 700, color: T.textPrimary, margin: "0 0 4px", lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>{sub}</p>
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {icon}
      </div>
    </div>
  );
}

function StatusBadge({ status, T }: { status: string; T: Tokens }) {
  const map: Record<string, { bg: string; color: string }> = {
    ACTIVE:    { bg: T.greenBg,  color: T.greenText },
    PLANNING:  { bg: T === LIGHT ? "#DBEAFE" : "#1A2A4A", color: T === LIGHT ? "#1E40AF" : "#60A5FA" },
    COMPLETED: { bg: T === LIGHT ? "#F3F4F6" : "#2C333A", color: T === LIGHT ? "#374151" : "#8B949E" },
  };
  const s = map[status] ?? map.PLANNING;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
      textTransform: "uppercase", letterSpacing: 0.5,
    }}>
      {status}
    </span>
  );
}

function ProgressBar({ value, T }: { value: number; T: Tokens }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 5, background: T.skeletonBg, borderRadius: 999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: T.accent, borderRadius: 999, transition: "width 0.6s" }} />
      </div>
      <span style={{ fontSize: 12, color: T.textMuted, minWidth: 30, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

function ProjectCard({ project, T }: { project: Project; T: Tokens }) {
  const memberCount = project._count?.members ?? 0;
  const dueDate = new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const progress = 0;
  return (
    <Link href={`/tasks?projectId=${project.id}&projectName=${encodeURIComponent(project.name)}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          background: T.white, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: "20px 24px", marginBottom: 12, boxShadow: T.cardShadow,
          cursor: "pointer", transition: "box-shadow 0.15s, border-color 0.15s, background 0.2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = T.cardHoverShadow; (e.currentTarget as HTMLDivElement).style.borderColor = T.cardHoverBorder; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = T.cardShadow; (e.currentTarget as HTMLDivElement).style.borderColor = T.border; }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, margin: "0 0 4px" }}>{project.name}</h3>
            {project.description && <p style={{ fontSize: 13, color: T.textSecondary, margin: 0 }}>{project.description}</p>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 16 }}>
            <StatusBadge status={project.status} T={T} />
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: project.status === "ACTIVE" ? T.amber : "#D1D5DB" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 20, margin: "12px 0", fontSize: 12, color: T.textSecondary }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {memberCount} member{memberCount !== 1 ? "s" : ""}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {dueDate}
          </span>
        </div>
        <div>
          <span style={{ fontSize: 12, color: T.textSecondary }}>Progress</span>
          <ProgressBar value={progress} T={T} />
        </div>
      </div>
    </Link>
  );
}

function TaskItem({ task, T }: { task: Task; T: Tokens }) {
  const PRIORITY_COLOR = T === LIGHT ? PRIORITY_COLOR_LIGHT : PRIORITY_COLOR_DARK;
  const priorityColor = PRIORITY_COLOR[task.priority] ?? T.textMuted;
  const tag = task.project?.name?.toUpperCase().slice(0, 8) ?? "TASK";
  return (
    <div style={{ padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, margin: "0 0 4px" }}>{task.title}</p>
      <p style={{ fontSize: 12, color: T.textSecondary, margin: 0 }}>
        <span style={{ color: priorityColor, fontWeight: 600 }}>{tag}</span>
        {" • "}
        <span style={{ color: priorityColor, fontWeight: 600 }}>{task.priority} Priority</span>
      </p>
    </div>
  );
}

const IconFolder = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconCheck = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconUser = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconAlert = ({ color }: { color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default function DashboardPage() {
  const { user, role } = useAuth();
  const { theme } = useTheme();
  const T = theme === "dark" ? DARK : LIGHT;
  const { current: currentWs, currentProjectIds } = useWorkspace();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.firstName ?? "there";

  useEffect(() => {
    Promise.all([
      api.get("/dashboard").then(r => setStats(r.data)).catch(() => {}),
      getProjects(1, 10).then(d => setProjects(d.projects ?? [])).catch(() => {}),
      getTasks({ page: 1, limit: 20, ...(user?.id ? { assigneeId: user.id } : {}) })
        .then(d => {
          const tasks = d.tasks ?? [];
          const now = new Date();
          setMyTasks(tasks.filter(t => t.status !== "DONE").slice(0, 5));
          setOverdueTasks(tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE"));
        })
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [user?.id]);

  const completedProjects = projects.filter(p => p.status === "COMPLETED").length;

  // filter to workspace projects only
  const wsProjects = currentProjectIds.length > 0
    ? projects.filter(p => currentProjectIds.includes(p.id))
    : [];
  const wsCompleted = wsProjects.filter(p => p.status === "COMPLETED").length;

  return (
    <AppLayout>
      <div style={{ background: T.bg, minHeight: "100%", padding: "32px 32px 48px", fontFamily: "inherit", transition: "background 0.2s" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: T.textPrimary, margin: "0 0 4px", transition: "color 0.2s" }}>
              Welcome back, {firstName} 👋
            </h1>
            <p style={{ fontSize: 14, color: T.textSecondary, margin: 0 }}>
              Here's what's happening with your projects today
            </p>
          </div>
          <Link
            href="/projects"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: T.accent, color: "#fff", textDecoration: "none",
              borderRadius: 8, padding: "10px 18px", fontSize: 14, fontWeight: 600,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Project
          </Link>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 24px", height: 100 }}>
                <div style={{ height: 10, width: "60%", background: T.skeletonBg, borderRadius: 4, marginBottom: 12 }} />
                <div style={{ height: 28, width: "40%", background: T.skeletonBg, borderRadius: 4 }} />
              </div>
            ))
          ) : (
            <>
              <StatCard label="Total Projects" value={wsProjects.length} sub={`projects in ${currentWs?.name ?? "FlowPilot"}`} iconBg={theme === "dark" ? "#1E2A4A" : "#EEF2FF"} icon={<IconFolder color={theme === "dark" ? "#818CF8" : "#6366F1"} />} T={T} />
              <StatCard label="Completed Projects" value={wsCompleted} sub={`of ${wsProjects.length} total`} iconBg={T.greenBg} icon={<IconCheck color={T.green} />} T={T} />
              <StatCard label="My Tasks" value={stats?.totalTasks ?? myTasks.length} sub="assigned to me" iconBg={T.purpleBg} icon={<IconUser color={T.purple} />} T={T} />
              <StatCard label="Overdue" value={overdueTasks.length} sub="need attention" iconBg={T.amberBg} icon={<IconAlert color={T.amber} />} T={T} />
            </>
          )}
        </div>

        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

          {/* Left — Project Overview */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, margin: 0 }}>Project Overview</h2>
              <Link href="/projects" style={{ fontSize: 13, color: T.accent, textDecoration: "none", fontWeight: 600 }}>
                View all →
              </Link>
            </div>

            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12, padding: "20px 24px", marginBottom: 12, height: 130 }}>
                  <div style={{ height: 12, width: "50%", background: T.skeletonBg, borderRadius: 4, marginBottom: 10 }} />
                  <div style={{ height: 10, width: "80%", background: T.skeletonBg, borderRadius: 4 }} />
                </div>
              ))
            ) : wsProjects.length === 0 ? (
              <div style={{ background: T.white, border: `2px dashed ${T.border}`, borderRadius: 12, padding: "40px 32px", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📂</div>
                <p style={{ color: T.textPrimary, fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>No projects yet</p>
                <p style={{ color: T.textMuted, fontSize: 13, margin: "0 0 20px" }}>Create your first project in <strong>{currentWs?.name}</strong></p>
                <Link href="/projects" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.accent, color: "#fff", textDecoration: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 600 }}>
                  <span>+</span> New Project
                </Link>
              </div>
            ) : (
              wsProjects.slice(0, 5).map(p => <ProjectCard key={p.id} project={p} T={T} />)
            )}
          </div>

          {/* Right — My Tasks + Overdue */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* My Tasks */}
            <div style={{
              background: T.white, border: `1px solid ${T.border}`, borderRadius: 12,
              padding: "20px 20px 8px", boxShadow: T.cardShadow, transition: "background 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textSecondary} strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: 0 }}>My Tasks</h3>
                </div>
                <span style={{
                  background: T.accent, color: "#fff",
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, minWidth: 22, textAlign: "center",
                }}>
                  {myTasks.length}
                </span>
              </div>

              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ padding: "14px 0", borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ height: 10, width: "70%", background: T.skeletonBg, borderRadius: 4, marginBottom: 6 }} />
                    <div style={{ height: 8, width: "50%", background: T.skeletonBg, borderRadius: 4 }} />
                  </div>
                ))
              ) : myTasks.length === 0 ? (
                <p style={{ fontSize: 13, color: T.textMuted, padding: "16px 0", margin: 0 }}>No tasks assigned.</p>
              ) : (
                myTasks.map(t => <TaskItem key={t.id} task={t} T={T} />)
              )}

              <Link href="/tasks" style={{
                display: "block", textAlign: "center", padding: "12px 0 4px",
                fontSize: 13, color: T.accent, textDecoration: "none", fontWeight: 600,
              }}>
                View all tasks →
              </Link>
            </div>

            {/* Overdue */}
            <div style={{
              background: T.white, border: `1px solid ${T.border}`, borderRadius: 12,
              padding: "20px 20px 16px", boxShadow: T.cardShadow, transition: "background 0.2s",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.amber} strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: 0 }}>Overdue</h3>
                </div>
                <span style={{
                  background: overdueTasks.length > 0 ? T.redBg : T.overdueCountBg,
                  color: overdueTasks.length > 0 ? T.red : T.textMuted,
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, minWidth: 22, textAlign: "center",
                }}>
                  {overdueTasks.length}
                </span>
              </div>

              {overdueTasks.length === 0 ? (
                <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>🎉 No overdue tasks. Great work!</p>
              ) : (
                overdueTasks.slice(0, 3).map(t => (
                  <div key={t.id} style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: T.red, margin: "0 0 2px" }}>{t.title}</p>
                    <p style={{ fontSize: 12, color: T.textMuted, margin: 0 }}>
                      Due {t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </p>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
