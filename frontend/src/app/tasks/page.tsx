"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";
import { getTasks, createTask, updateTask, deleteTask } from "@/services/task.service";
import { getProjects } from "@/services/project.service";
import { Task, Project } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import KanbanBoard from "@/components/ui/KanbanBoard";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  projectId: z.string().refine((val) => val.length > 0, {
    message: "Please select a project",
  }),
});
type FormData = z.infer<typeof schema>;
const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const accentBlue = "#0052CC";
const darkCard = { background: "#22272B", border: "1px solid #2C333A", borderRadius: 4 };
const inputSty: React.CSSProperties = { width: "100%", height: 40, background: "#161A1D", border: "2px solid #2C333A", borderRadius: 3, color: "#DFE1E6", fontSize: 14, padding: "0 12px", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" };
const labelSty: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#8A94A5", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" };
const thStyle: React.CSSProperties = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8A94A5", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #2C333A" };
const tdStyle: React.CSSProperties = { padding: "11px 14px", fontSize: 13, color: "#B3BAC5", borderBottom: "1px solid #2C333A" };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    TODO: { bg: "rgba(137,147,164,0.15)", color: "#8993A4" },
    IN_PROGRESS: { bg: "rgba(255,171,0,0.15)", color: "#FFAB00" },
    IN_REVIEW: { bg: "rgba(0,82,204,0.15)", color: "#4C9AFF" },
    DONE: { bg: "rgba(54,179,126,0.15)", color: "#36B37E" },
  };
  const s = map[status] ?? map.TODO;
  return <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 3 }}>{status.replace("_", " ")}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { color: string; icon: string }> = {
    LOW: { color: "#8993A4", icon: "↓" },
    MEDIUM: { color: "#FFAB00", icon: "→" },
    HIGH: { color: "#FF8B00", icon: "↑" },
    URGENT: { color: "#DE350B", icon: "⚡" },
  };
  const p = map[priority] ?? map.MEDIUM;
  return <span style={{ color: p.color, fontSize: 13, fontWeight: 700 }}>{p.icon} {priority}</span>;
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={onClose} />
      <div style={{ position: "relative", background: "#22272B", border: "1px solid #2C333A", borderRadius: 6, width: "100%", maxWidth: 560, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#DFE1E6", margin: "0 0 24px" }}>{title}</h3>
        {children}
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#8A94A5", cursor: "pointer", fontSize: 20 }}>×</button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { role } = useAuth();
  const canCreateTask = ["ADMIN", "MANAGER"].includes(role ?? "");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ 
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { projectId: "", status: "TODO", priority: "MEDIUM" }
  });

  const fetchTasks = useCallback(() => {
    setLoading(true);
    getTasks({ page, limit: 20, status: filterStatus || undefined, priority: filterPriority || undefined })
      .then((data) => { 
        console.log("Tasks fetched:", data);
        setTasks(data.tasks ?? []); 
        setTotalPages(data.pagination?.totalPages ?? 1); 
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks");
      })
      .finally(() => setLoading(false));
  }, [page, filterStatus, filterPriority]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { 
    getProjects(1, 100)
      .then((d) => {
        console.log("Projects fetched:", d);
        setProjects(d.projects ?? []);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      });
  }, []);

  const openCreate = () => { setEditTask(null); reset({ title: "", description: "", status: "TODO", priority: "MEDIUM", projectId: "", dueDate: "" }); setModalOpen(true); };
  const openEdit = (t: Task) => {
    setEditTask(t);
    reset({ title: t.title, description: t.description ?? "", status: t.status, priority: t.priority, projectId: String(t.projectId), dueDate: t.dueDate ? t.dueDate.split("T")[0] : "" });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = { ...data, projectId: Number(data.projectId), dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined };
      if (editTask) { await updateTask(editTask.id, payload); toast.success("Task updated"); }
      else { await createTask(payload as Parameters<typeof createTask>[0]); toast.success("Task created"); }
      setModalOpen(false); fetchTasks();
    } catch (error: any) { toast.error(error.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteTask(deleteTarget.id); toast.success("Task deleted"); setDeleteTarget(null); fetchTasks(); }
    catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      await updateTask(updatedTask.id, {
        status: updatedTask.status,
      });
      toast.success("Task status updated");
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const selectSty: React.CSSProperties = { height: 34, background: "#1D2125", border: "1px solid #2C333A", borderRadius: 3, color: "#B3BAC5", fontSize: 13, padding: "0 10px", outline: "none", cursor: "pointer", fontFamily: "inherit" };

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#DFE1E6", margin: "0 0 4px" }}>Tasks</h2>
            <p style={{ fontSize: 13, color: "#8A94A5", margin: 0 }}>{tasks.length} tasks</p>
          </div>
          {canCreateTask && (
            <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 6, background: accentBlue, color: "#fff", border: "none", borderRadius: 3, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0065FF")} onMouseLeave={e => (e.currentTarget.style.background = accentBlue)}>
              <span style={{ fontSize: 16 }}>+</span> New Task
            </button>
          )}
        </div>

        <div style={{ ...darkCard, overflow: "hidden" }}>
          {/* Filters */}
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #2C333A", display: "flex", gap: 12, alignItems: "center" }}>
            <select style={selectSty} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
            <select style={selectSty} value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}>
              <option value="">All Priorities</option>
              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <KanbanBoard 
            tasks={tasks}
            isLoading={loading}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={(id) => {
              const task = tasks.find(t => t.id === id);
              if (task) setDeleteTarget(task);
            }}
          />
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? "Edit Task" : "Create Task"}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelSty}>Title</label>
            <input style={inputSty} placeholder="Task title" {...register("title")} onFocus={e => (e.target.style.borderColor = accentBlue)} onBlur={e => (e.target.style.borderColor = "#2C333A")} />
            {errors.title && <p style={{ fontSize: 12, color: "#FF5630", marginTop: 4 }}>{errors.title.message}</p>}
          </div>
          <div>
            <label style={labelSty}>Description</label>
            <textarea style={{ ...inputSty, height: 72, resize: "none", paddingTop: 10 }} placeholder="Description..." {...register("description")} onFocus={e => (e.target.style.borderColor = accentBlue)} onBlur={e => (e.target.style.borderColor = "#2C333A")} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSty}>Project</label>
              <select style={{ ...inputSty }} {...register("projectId")} onFocus={e => (e.target.style.borderColor = accentBlue)} onBlur={e => (e.target.style.borderColor = "#2C333A")}>
                <option value="">Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.projectId && <p style={{ fontSize: 12, color: "#FF5630", marginTop: 4 }}>{errors.projectId.message}</p>}
            </div>
            <div>
              <label style={labelSty}>Status</label>
              <select style={{ ...inputSty }} {...register("status")} onFocus={e => (e.target.style.borderColor = accentBlue)} onBlur={e => (e.target.style.borderColor = "#2C333A")}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSty}>Priority</label>
              <select style={{ ...inputSty }} {...register("priority")} onFocus={e => (e.target.style.borderColor = accentBlue)} onBlur={e => (e.target.style.borderColor = "#2C333A")}>
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSty}>Due Date</label>
              <input type="date" style={{ ...inputSty, colorScheme: "dark" }} {...register("dueDate")} onFocus={e => (e.target.style.borderColor = accentBlue)} onBlur={e => (e.target.style.borderColor = "#2C333A")} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ padding: "8px 16px", borderRadius: 3, border: "1px solid #2C333A", background: "transparent", color: "#8A94A5", cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: "8px 16px", borderRadius: 3, border: "none", background: saving ? "#42526E" : accentBlue, color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600 }}>
              {saving ? "Saving..." : (editTask ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </Modal>

      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={() => setDeleteTarget(null)} />
          <div style={{ position: "relative", background: "#22272B", border: "1px solid #2C333A", borderRadius: 6, width: 400, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#DFE1E6", margin: "0 0 8px" }}>Delete task?</h3>
            <p style={{ fontSize: 13, color: "#8A94A5", margin: "0 0 20px" }}>Delete &quot;{deleteTarget.title}&quot;? This cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: "8px 16px", borderRadius: 3, border: "1px solid #2C333A", background: "transparent", color: "#8A94A5", cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{ padding: "8px 16px", borderRadius: 3, border: "none", background: deleting ? "#42526E" : "#DE350B", color: "#fff", cursor: deleting ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
