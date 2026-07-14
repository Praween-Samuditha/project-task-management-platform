"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { getTasks, createTask, updateTask, deleteTask } from "@/services/task.service";
import { getProjects } from "@/services/project.service";
import { getUsers } from "@/services/user.service";
import { Task, Project, User } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import KanbanBoard from "@/components/ui/KanbanBoard";
import { useTheme } from "@/components/layout/Navbar";

const LIGHT = {
  bg: "#F8F9FB", card: "#FFFFFF", border: "#E8ECF0",
  textPrimary: "#1A1D23", textSecondary: "#6B7280", textMuted: "#9CA3AF",
  accent: "#0052CC", inputBg: "#F8F9FB", inputBorder: "#D1D5DB",
  inputText: "#1A1D23", labelColor: "#6B7280", selectBg: "#FFFFFF",
  modalBg: "#FFFFFF", modalOverlay: "rgba(0,0,0,0.4)",
  errorColor: "#EF4444", deleteBg: "#DC2626",
  skeletonBg: "#F1F2F4",
};

const DARK = {
  bg: "#1D2125", card: "#22272B", border: "#2C333A",
  textPrimary: "#DFE1E6", textSecondary: "#8A94A5", textMuted: "#6B7280",
  accent: "#4C9EFF", inputBg: "#161A1D", inputBorder: "#2C333A",
  inputText: "#DFE1E6", labelColor: "#8A94A5", selectBg: "#1D2125",
  modalBg: "#22272B", modalOverlay: "rgba(0,0,0,0.7)",
  errorColor: "#FF5630", deleteBg: "#DE350B",
  skeletonBg: "#2C333A",
};

type Tokens = typeof LIGHT;

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  projectId: z.string().refine((val) => val.length > 0, { message: "Please select a project" }),
  assigneeId: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const STATUS_OPTIONS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function Modal({ open, onClose, title, children, T }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; T: Tokens }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: T.modalOverlay }} onClick={onClose} />
      <div style={{ position: "relative", background: T.modalBg, border: `1px solid ${T.border}`, borderRadius: 6, width: "100%", maxWidth: 560, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary, margin: "0 0 24px" }}>{title}</h3>
        {children}
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: T.textSecondary, cursor: "pointer", fontSize: 20 }}>×</button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { role, user } = useAuth();
  const { theme } = useTheme();
  const T = theme === "dark" ? DARK : LIGHT;

  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get("projectId") ? Number(searchParams.get("projectId")) : undefined;
  const urlProjectName = searchParams.get("projectName") ?? "";

  const canCreateTask = ["ADMIN", "MANAGER"].includes(role ?? "");
  const isReadOnly = role === "MEMBER";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterProject, setFilterProject] = useState<number | undefined>(urlProjectId);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { projectId: "", status: "TODO", priority: "MEDIUM" },
  });

  const fetchTasks = useCallback(() => {
    setLoading(true);
    getTasks({ page, limit: 20, status: filterStatus || undefined, priority: filterPriority || undefined, projectId: filterProject })
      .then((data) => { setTasks(data.tasks ?? []); setTotalPages(data.pagination?.totalPages ?? 1); })
      .catch(() => toast.error("Failed to load tasks"))
      .finally(() => setLoading(false));
  }, [page, filterStatus, filterPriority, filterProject]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => {
    getProjects(1, 100).then((d) => setProjects(d.projects ?? [])).catch(() => toast.error("Failed to load projects"));
    if (canCreateTask) getUsers(1, 100).then(d => setUsers(d.users ?? [])).catch(() => {});
  }, [canCreateTask]);

  const openCreate = () => {
    setEditTask(null);
    reset({ title: "", description: "", status: "TODO", priority: "MEDIUM", projectId: filterProject ? String(filterProject) : "", dueDate: "", assigneeId: "" });
    setModalOpen(true);
  };
  const openEdit = (t: Task) => {
    setEditTask(t);
    reset({ title: t.title, description: t.description ?? "", status: t.status, priority: t.priority, projectId: String(t.projectId), dueDate: t.dueDate ? t.dueDate.split("T")[0] : "", assigneeId: t.assigneeId ? String(t.assigneeId) : "" });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = { ...data, projectId: Number(data.projectId), assigneeId: data.assigneeId ? Number(data.assigneeId) : undefined, dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined };
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
    try { await updateTask(updatedTask.id, { status: updatedTask.status }); toast.success("Task status updated"); fetchTasks(); }
    catch (error: any) { toast.error(error.response?.data?.message || "Failed to update task"); }
  };

  const inputSty: React.CSSProperties = { width: "100%", height: 40, background: T.inputBg, border: `2px solid ${T.inputBorder}`, borderRadius: 3, color: T.inputText, fontSize: 14, padding: "0 12px", outline: "none", fontFamily: "inherit", transition: "border-color 0.2s" };
  const labelSty: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: T.labelColor, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" };
  const selectSty: React.CSSProperties = { height: 34, background: T.selectBg, border: `1px solid ${T.border}`, borderRadius: 3, color: T.textPrimary, fontSize: 13, padding: "0 10px", outline: "none", cursor: "pointer", fontFamily: "inherit" };

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            {filterProject && urlProjectName ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <button onClick={() => { setFilterProject(undefined); setPage(1); }} style={{ background: "none", border: "none", color: T.textSecondary, cursor: "pointer", fontSize: 13, padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                    ← All Tasks
                  </button>
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: T.textPrimary, margin: "0 0 4px" }}>{urlProjectName}</h2>
                <p style={{ fontSize: 13, color: T.textSecondary, margin: 0 }}>{tasks.length} tasks in this project</p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: T.textPrimary, margin: "0 0 4px" }}>Tasks</h2>
                <p style={{ fontSize: 13, color: T.textSecondary, margin: 0 }}>{tasks.length} tasks</p>
              </>
            )}
          </div>
          {canCreateTask && (
            <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 6, background: T.accent, color: "#fff", border: "none", borderRadius: 3, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              <span style={{ fontSize: 16 }}>+</span> New Task
            </button>
          )}
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, overflow: "hidden", transition: "background 0.2s" }}>
          {/* Filters */}
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 12, alignItems: "center" }}>
            <select style={selectSty} value={filterProject ?? ""} onChange={(e) => { setFilterProject(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}>
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
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
            readOnly={isReadOnly}
            onTaskUpdate={!isReadOnly ? handleTaskUpdate : undefined}
            onTaskEdit={!isReadOnly ? openEdit : undefined}
            onTaskDelete={!isReadOnly ? (id) => { const task = tasks.find(t => t.id === id); if (task) setDeleteTarget(task); } : undefined}
          />
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? "Edit Task" : "Create Task"} T={T}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelSty}>Title</label>
            <input style={inputSty} placeholder="Task title" {...register("title")} onFocus={e => (e.target.style.borderColor = T.accent)} onBlur={e => (e.target.style.borderColor = T.inputBorder)} />
            {errors.title && <p style={{ fontSize: 12, color: T.errorColor, marginTop: 4 }}>{errors.title.message}</p>}
          </div>
          <div>
            <label style={labelSty}>Description</label>
            <textarea style={{ ...inputSty, height: 72, resize: "none", paddingTop: 10 }} placeholder="Description..." {...register("description")} onFocus={e => (e.target.style.borderColor = T.accent)} onBlur={e => (e.target.style.borderColor = T.inputBorder)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelSty}>Project</label>
              <select style={{ ...inputSty }} {...register("projectId")} onFocus={e => (e.target.style.borderColor = T.accent)} onBlur={e => (e.target.style.borderColor = T.inputBorder)}>
                <option value="">Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              {errors.projectId && <p style={{ fontSize: 12, color: T.errorColor, marginTop: 4 }}>{errors.projectId.message}</p>}
            </div>
            <div>
              <label style={labelSty}>Status</label>
              <select style={{ ...inputSty }} {...register("status")} onFocus={e => (e.target.style.borderColor = T.accent)} onBlur={e => (e.target.style.borderColor = T.inputBorder)}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSty}>Priority</label>
              <select style={{ ...inputSty }} {...register("priority")} onFocus={e => (e.target.style.borderColor = T.accent)} onBlur={e => (e.target.style.borderColor = T.inputBorder)}>
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label style={labelSty}>Due Date</label>
              <input type="date" style={{ ...inputSty, colorScheme: theme === "dark" ? "dark" : "light" }} {...register("dueDate")} onFocus={e => (e.target.style.borderColor = T.accent)} onBlur={e => (e.target.style.borderColor = T.inputBorder)} />
            </div>
          </div>
          {canCreateTask && users.length > 0 && (
            <div>
              <label style={labelSty}>Assignee</label>
              <select style={{ ...inputSty }} {...register("assigneeId")} onFocus={e => (e.target.style.borderColor = T.accent)} onBlur={e => (e.target.style.borderColor = T.inputBorder)}>
                <option value="">Unassigned</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role.name})</option>)}
              </select>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ padding: "8px 16px", borderRadius: 3, border: `1px solid ${T.border}`, background: "transparent", color: T.textSecondary, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: "8px 16px", borderRadius: 3, border: "none", background: saving ? T.textMuted : T.accent, color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600 }}>
              {saving ? "Saving..." : (editTask ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </Modal>

      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: T.modalOverlay }} onClick={() => setDeleteTarget(null)} />
          <div style={{ position: "relative", background: T.modalBg, border: `1px solid ${T.border}`, borderRadius: 6, width: 400, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary, margin: "0 0 8px" }}>Delete task?</h3>
            <p style={{ fontSize: 13, color: T.textSecondary, margin: "0 0 20px" }}>Delete &quot;{deleteTarget.title}&quot;? This cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: "8px 16px", borderRadius: 3, border: `1px solid ${T.border}`, background: "transparent", color: T.textSecondary, cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} style={{ padding: "8px 16px", borderRadius: 3, border: "none", background: deleting ? T.textMuted : T.deleteBg, color: "#fff", cursor: deleting ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
