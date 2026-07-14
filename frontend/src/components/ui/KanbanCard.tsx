"use client";

import React from "react";
import { Task } from "@/types";
import { format } from "date-fns";
import { useTheme } from "@/components/layout/Navbar";

interface KanbanCardProps {
  task: Task;
  onUpdate?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: number) => void;
  readOnly?: boolean;
}

const NEXT_STATUS: Record<string, string> = {
  TODO: "IN_PROGRESS",
  IN_PROGRESS: "IN_REVIEW",
  IN_REVIEW: "DONE",
};

const NEXT_LABEL: Record<string, string> = {
  TODO: "In Progress",
  IN_PROGRESS: "In Review",
  IN_REVIEW: "Done",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#6B7280", MEDIUM: "#F59E0B", HIGH: "#F97316", URGENT: "#EF4444",
};

const LIGHT = {
  cardBg: "#FFFFFF", cardBorder: "#E8ECF0", cardHoverBorder: "#D1D5DB",
  idColor: "#9CA3AF", titleColor: "#1A1D23", projectColor: "#6B7280",
  assigneeColor: "#374151", createdByColor: "#9CA3AF", dividerColor: "#F3F4F6",
  deleteBg: "#FEE2E2", deleteColor: "#DC2626", deleteHoverBg: "#FECACA",
  moveBg: "#EEF4FF", moveColor: "#0052CC", moveHoverBg: "#D6E8FF", moveBorder: "#C7D9F8",
};

const DARK = {
  cardBg: "#22272B", cardBorder: "#2C333A", cardHoverBorder: "#3D4B56",
  idColor: "#6B7280", titleColor: "#DFE1E6", projectColor: "#8A94A5",
  assigneeColor: "#B3BAC5", createdByColor: "#6B7280", dividerColor: "#2C333A",
  deleteBg: "rgba(222,53,11,0.15)", deleteColor: "#FF5630", deleteHoverBg: "rgba(222,53,11,0.25)",
  moveBg: "rgba(76,158,255,0.12)", moveColor: "#4C9EFF", moveHoverBg: "rgba(76,158,255,0.22)", moveBorder: "rgba(76,158,255,0.25)",
};

export default function KanbanCard({ task, onUpdate, onEdit, onDelete, readOnly = false }: KanbanCardProps) {
  const { theme } = useTheme();
  const T = theme === "dark" ? DARK : LIGHT;

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== "DONE";
  const priorityColor = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.MEDIUM;
  const nextStatus = NEXT_STATUS[task.status];

  return (
    <div
      style={{ background: T.cardBg, borderRadius: 8, padding: 16, marginBottom: 12, border: `1px solid ${T.cardBorder}`, cursor: readOnly ? "default" : "move", transition: "border-color 0.15s, background 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = T.cardHoverBorder)}
      onMouseLeave={e => (e.currentTarget.style.borderColor = T.cardBorder)}
    >
      <div style={{ fontSize: 11, color: T.idColor, marginBottom: 6 }}>#{task.id}</div>

      <h3 style={{ fontWeight: 600, color: T.titleColor, fontSize: 14, lineHeight: 1.4, margin: "0 0 10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {task.title}
      </h3>

      {task.project && <div style={{ fontSize: 12, color: T.projectColor, marginBottom: 8 }}>{task.project.name}</div>}

      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: priorityColor, background: `${priorityColor}20`, padding: "2px 8px", borderRadius: 4 }}>
          {task.priority}
        </span>
      </div>

      {dueDate && (
        <div style={{ fontSize: 12, color: isOverdue ? "#EF4444" : T.projectColor, marginBottom: 10 }}>
          Due: {format(dueDate, "MMM d, yyyy")}
        </div>
      )}

      {task.assignee && (
        <div style={{ fontSize: 12, color: T.assigneeColor, marginBottom: 10 }}>
          Assigned to: {task.assignee.firstName} {task.assignee.lastName}
        </div>
      )}

      <div style={{ fontSize: 11, color: T.createdByColor, borderTop: `1px solid ${T.dividerColor}`, paddingTop: 8 }}>
        by {task.createdBy.firstName} {task.createdBy.lastName}
      </div>

      {!readOnly && (onUpdate || onEdit || onDelete) && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {onUpdate && nextStatus && (
            <button
              onClick={() => onUpdate({ ...task, status: nextStatus as Task["status"] })}
              style={{ width: "100%", fontSize: 12, fontWeight: 600, background: T.moveBg, color: T.moveColor, border: `1px solid ${T.moveBorder}`, borderRadius: 4, padding: "5px 0", cursor: "pointer", transition: "background 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}
              onMouseEnter={e => (e.currentTarget.style.background = T.moveHoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = T.moveBg)}
            >
              → Move to {NEXT_LABEL[task.status]}
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              style={{ width: "100%", fontSize: 12, fontWeight: 600, background: theme === "dark" ? "rgba(255,171,0,0.12)" : "#FFFBEB", color: theme === "dark" ? "#FFAB00" : "#92400E", border: `1px solid ${theme === "dark" ? "rgba(255,171,0,0.25)" : "#FDE68A"}`, borderRadius: 4, padding: "5px 0", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = theme === "dark" ? "rgba(255,171,0,0.22)" : "#FEF3C7")}
              onMouseLeave={e => (e.currentTarget.style.background = theme === "dark" ? "rgba(255,171,0,0.12)" : "#FFFBEB")}
            >
              ✏ Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              style={{ width: "100%", fontSize: 12, background: T.deleteBg, color: T.deleteColor, border: "none", borderRadius: 4, padding: "4px 0", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = T.deleteHoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = T.deleteBg)}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
