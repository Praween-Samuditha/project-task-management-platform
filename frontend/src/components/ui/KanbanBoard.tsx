"use client";

import React, { useState } from "react";
import { Task } from "@/types";
import KanbanCard from "./KanbanCard";
import Loader from "./Loader";
import { useTheme } from "@/components/layout/Navbar";

interface KanbanBoardProps {
  tasks: Task[];
  isLoading?: boolean;
  onTaskUpdate?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (id: number) => void;
  readOnly?: boolean;
}

const COLUMNS = [
  { id: "TODO",        title: "TO DO",       headerBg: "#1D4ED8" },
  { id: "IN_PROGRESS", title: "IN PROGRESS", headerBg: "#92400E" },
  { id: "IN_REVIEW",   title: "IN REVIEW",   headerBg: "#6B21A8" },
  { id: "DONE",        title: "DONE",        headerBg: "#14532D" },
];

const LIGHT = {
  boardBg: "#F1F2F4", colBg: "#FFFFFF", colBorder: "#E8ECF0",
  emptyText: "#9CA3AF", dragOverBg: "#E8ECF0",
};
const DARK = {
  boardBg: "#161A1D", colBg: "#1D2125", colBorder: "#2C333A",
  emptyText: "#4B5563", dragOverBg: "#2C333A",
};

export default function KanbanBoard({ tasks, isLoading = false, onTaskUpdate, onTaskEdit, onTaskDelete, readOnly = false }: KanbanBoardProps) {
  const { theme } = useTheme();
  const T = theme === "dark" ? DARK : LIGHT;
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const groupedTasks = COLUMNS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedTask) { onTaskUpdate?.({ ...draggedTask, status: newStatus as Task["status"] }); setDraggedTask(null); }
  };

  if (isLoading) {
    return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 384 }}><Loader /></div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, padding: 24, background: T.boardBg, borderRadius: 8, transition: "background 0.2s" }}>
      {COLUMNS.map(col => (
        <div key={col.id} style={{ background: T.colBg, borderRadius: 8, overflow: "hidden", border: `1px solid ${T.colBorder}`, transition: "background 0.2s" }}>
          <div style={{ background: col.headerBg, padding: "12px 16px" }}>
            <h2 style={{ fontWeight: 600, color: "#fff", fontSize: 14, margin: 0 }}>{col.title}</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", margin: "4px 0 0" }}>{groupedTasks[col.id]?.length ?? 0} tasks</p>
          </div>
          <div
            style={{ padding: 16, minHeight: 384, transition: "background 0.15s", background: dragOverCol === col.id ? T.dragOverBg : "transparent" }}
            onDragOver={!readOnly ? (e) => { e.preventDefault(); setDragOverCol(col.id); } : undefined}
            onDragLeave={!readOnly ? () => setDragOverCol(null) : undefined}
            onDrop={!readOnly ? (e) => handleDrop(e, col.id) : undefined}
          >
            {groupedTasks[col.id]?.length > 0 ? (
              groupedTasks[col.id].map(task => (
                <div key={task.id} draggable={!readOnly} onDragStart={!readOnly ? () => setDraggedTask(task) : undefined} style={{ opacity: draggedTask?.id === task.id ? 0.5 : 1 }}>
                  <KanbanCard task={task} onUpdate={!readOnly ? onTaskUpdate : undefined} onEdit={!readOnly ? onTaskEdit : undefined} onDelete={!readOnly ? onTaskDelete : undefined} readOnly={readOnly} />
                </div>
              ))
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 384 }}>
                <p style={{ fontSize: 14, color: T.emptyText }}>No tasks</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
