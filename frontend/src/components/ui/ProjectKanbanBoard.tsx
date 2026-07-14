"use client";

import React from "react";
import { Project } from "@/types";
import Loader from "./Loader";
import { useTheme } from "@/components/layout/Navbar";

// ── theme tokens ──────────────────────────────────────────────────────────────
const LIGHT = {
  boardBg:    "#F1F2F4",
  colBg:      "#FFFFFF",
  colBorder:  "#E8ECF0",
  cardBg:     "#FFFFFF",
  cardBorder: "#E8ECF0",
  cardHover:  "#F8F9FB",
  idText:     "#8590A2",
  titleText:  "#172B4D",
  descText:   "#44546F",
  statsText:  "#44546F",
  memberLabel:"#172B4D",
  memberText: "#44546F",
  ownerText:  "#8590A2",
  divider:    "#E8ECF0",
  emptyText:  "#8590A2",
  colHeaderText: "#FFFFFF",
  btnMembers: { bg: "#F1F2F4", color: "#172B4D", hover: "#E2E6EA" },
};

const DARK = {
  boardBg:    "#161A1D",
  colBg:      "#22272B",
  colBorder:  "#2C333A",
  cardBg:     "#1D2125",
  cardBorder: "#2C333A",
  cardHover:  "#22272B",
  idText:     "#8A94A5",
  titleText:  "#DFE1E6",
  descText:   "#8A94A5",
  statsText:  "#B3BAC5",
  memberLabel:"#DFE1E6",
  memberText: "#B3BAC5",
  ownerText:  "#6B7280",
  divider:    "#2C333A",
  emptyText:  "#6B7280",
  colHeaderText: "#FFFFFF",
  btnMembers: { bg: "#2C333A", color: "#B3BAC5", hover: "#3A4149" },
};

const COLUMNS = [
  { id: "PLANNING",  title: "PLANNING",  headerBg: "#1D4ED8" },
  { id: "ACTIVE",    title: "ACTIVE",    headerBg: "#166534" },
  { id: "COMPLETED", title: "COMPLETED", headerBg: "#374151" },
];

// ── Card ──────────────────────────────────────────────────────────────────────
interface ProjectKanbanCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onMembers?: (project: Project) => void;
  onDelete?: (id: number) => void;
}

function ProjectKanbanCard({ project, onEdit, onMembers, onDelete }: ProjectKanbanCardProps) {
  const { theme } = useTheme();
  const T = theme === "dark" ? DARK : LIGHT;

  return (
    <div
      style={{
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 10,
        padding: "14px 16px",
        marginBottom: 12,
        transition: "background 0.15s, border-color 0.15s",
        cursor: "default",
      }}
      onMouseEnter={e => (e.currentTarget.style.background = T.cardHover)}
      onMouseLeave={e => (e.currentTarget.style.background = T.cardBg)}
    >
      {/* ID */}
      <div style={{ fontSize: 11, color: T.idText, marginBottom: 6 }}>#{project.id}</div>

      {/* Title */}
      <h3 style={{ fontSize: 14, fontWeight: 700, color: T.titleText, margin: "0 0 4px", lineHeight: 1.3 }}>
        {project.name}
      </h3>

      {/* Description */}
      {project.description && (
        <p style={{ fontSize: 12, color: T.descText, margin: "0 0 10px", lineHeight: 1.4 }}>
          {project.description}
        </p>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 20, fontSize: 12, color: T.statsText, marginBottom: 10 }}>
        <span>Tasks: {project._count?.tasks ?? 0}</span>
        <span>Members: {project._count?.members ?? 0}</span>
      </div>

      {/* Members list */}
      {project.members && project.members.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: T.memberLabel, marginBottom: 4 }}>
            Members
          </div>
          <div style={{ fontSize: 12, color: T.memberText, lineHeight: 1.6 }}>
            {project.members.slice(0, 2).map((m, i) => (
              <span key={m.user.id}>
                {m.user.firstName} {m.user.lastName}
                {i < Math.min(project.members!.length, 2) - 1 ? ", " : ""}
              </span>
            ))}
            {project.members.length > 2 && (
              <span style={{ color: T.idText }}> +{project.members.length - 2} more</span>
            )}
          </div>
        </div>
      )}

      {/* Owner */}
      <div style={{ fontSize: 11, color: T.ownerText, borderTop: `1px solid ${T.divider}`, paddingTop: 8, marginBottom: (onEdit || onMembers || onDelete) ? 10 : 0 }}>
        Owner: {project.owner.firstName} {project.owner.lastName}
      </div>

      {/* Actions */}
      {(onEdit || onMembers || onDelete) && (
        <div style={{ display: "flex", gap: 6 }}>
          {onEdit && (
            <button
              onClick={() => onEdit(project)}
              style={{ flex: 1, fontSize: 12, fontWeight: 600, background: "#1D4ED8", color: "#fff", border: "none", borderRadius: 6, padding: "6px 0", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1E40AF")}
              onMouseLeave={e => (e.currentTarget.style.background = "#1D4ED8")}
            >
              Edit
            </button>
          )}
          {onMembers && (
            <button
              onClick={() => onMembers(project)}
              style={{ flex: 1, fontSize: 12, fontWeight: 600, background: T.btnMembers.bg, color: T.btnMembers.color, border: "none", borderRadius: 6, padding: "6px 0", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = T.btnMembers.hover)}
              onMouseLeave={e => (e.currentTarget.style.background = T.btnMembers.bg)}
            >
              Members
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(project.id)}
              style={{ flex: 1, fontSize: 12, fontWeight: 600, background: "#B91C1C", color: "#fff", border: "none", borderRadius: 6, padding: "6px 0", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#991B1B")}
              onMouseLeave={e => (e.currentTarget.style.background = "#B91C1C")}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Board ─────────────────────────────────────────────────────────────────────
interface ProjectKanbanBoardProps {
  projects: Project[];
  isLoading?: boolean;
  onProjectEdit?: (project: Project) => void;
  onProjectMembers?: (project: Project) => void;
  onProjectDelete?: (id: number) => void;
}

export default function ProjectKanbanBoard({
  projects,
  isLoading = false,
  onProjectEdit,
  onProjectMembers,
  onProjectDelete,
}: ProjectKanbanBoardProps) {
  const { theme } = useTheme();
  const T = theme === "dark" ? DARK : LIGHT;

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = projects.filter(p => p.status === col.id);
    return acc;
  }, {} as Record<string, Project[]>);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 384 }}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20,
      padding: 20, background: T.boardBg, borderRadius: 10,
      transition: "background 0.2s",
    }}>
      {COLUMNS.map(col => (
        <div key={col.id} style={{
          background: T.colBg, border: `1px solid ${T.colBorder}`,
          borderRadius: 10, overflow: "hidden",
          transition: "background 0.2s, border-color 0.2s",
        }}>
          {/* Column header */}
          <div style={{ background: col.headerBg, padding: "12px 16px" }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: T.colHeaderText, margin: 0, letterSpacing: 0.5 }}>
              {col.title}
            </h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }}>
              {grouped[col.id]?.length ?? 0} projects
            </p>
          </div>

          {/* Cards */}
          <div style={{ padding: 12, minHeight: 300 }}>
            {grouped[col.id]?.length > 0 ? (
              grouped[col.id].map(p => (
                <ProjectKanbanCard
                  key={p.id}
                  project={p}
                  onEdit={onProjectEdit}
                  onMembers={onProjectMembers}
                  onDelete={onProjectDelete}
                />
              ))
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
                <p style={{ fontSize: 13, color: T.emptyText }}>No projects</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
