"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";
import { getProjects, createProject, updateProject, deleteProject } from "@/services/project.service";
import { Project } from "@/types";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "PLANNING", "COMPLETED"]).optional(),
});
type FormData = z.infer<typeof schema>;
const STATUS_OPTIONS = ["ACTIVE", "PLANNING", "COMPLETED"];

const accentBlue = "#0052CC";
const darkCard = { background: "#22272B", border: "1px solid #2C333A", borderRadius: 4 };
const inputSty: React.CSSProperties = {
  width: "100%", height: 40, background: "#161A1D",
  border: "2px solid #2C333A", borderRadius: 3,
  color: "#DFE1E6", fontSize: 14, padding: "0 12px", outline: "none",
  fontFamily: "inherit", transition: "border-color 0.2s"
};
const labelSty: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 600, color: "#8A94A5", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    ACTIVE: { bg: "rgba(54,179,126,0.15)", color: "#36B37E", label: "Active" },
    PLANNING: { bg: "rgba(0,82,204,0.15)", color: "#4C9AFF", label: "Planning" },
    COMPLETED: { bg: "rgba(137,147,164,0.15)", color: "#8993A4", label: "Completed" },
  };
  const s = map[status] ?? map.PLANNING;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 3, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={onClose} />
      <div style={{ position: "relative", background: "#22272B", border: "1px solid #2C333A", borderRadius: 6, width: "100%", maxWidth: 480, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#DFE1E6", margin: "0 0 24px" }}>{title}</h3>
        {children}
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#8A94A5", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const fetchProjects = useCallback(() => {
    setLoading(true);
    getProjects(page, 20, search)
      .then((data) => { setProjects(data.projects ?? []); setTotalPages(data.pagination?.totalPages ?? 1); })
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openCreate = () => { setEditProject(null); reset({ name: "", description: "", status: "ACTIVE" }); setModalOpen(true); };
  const openEdit = (p: Project) => { setEditProject(p); reset({ name: p.name, description: p.description ?? "", status: (p.status as "ACTIVE" | "PLANNING" | "COMPLETED") }); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editProject) { await updateProject(editProject.id, data); toast.success("Project updated"); }
      else { await createProject(data); toast.success("Project created"); }
      setModalOpen(false); fetchProjects();
    } catch (error: any) { toast.error(error.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await deleteProject(deleteTarget.id); toast.success("Project deleted"); setDeleteTarget(null); fetchProjects(); }
    catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  const thStyle: React.CSSProperties = { padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8A94A5", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #2C333A", whiteSpace: "nowrap" };
  const tdStyle: React.CSSProperties = { padding: "12px 16px", fontSize: 13, color: "#B3BAC5", borderBottom: "1px solid #2C333A" };

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#DFE1E6", margin: "0 0 4px" }}>Projects</h2>
            <p style={{ fontSize: 13, color: "#8A94A5", margin: 0 }}>{projects.length} projects</p>
          </div>
          <button onClick={openCreate} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: accentBlue, color: "#fff", border: "none",
            borderRadius: 3, padding: "8px 14px", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit"
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#0065FF")}
          onMouseLeave={e => (e.currentTarget.style.background = accentBlue)}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Project
          </button>
        </div>

        {/* Table card */}
        <div style={{ ...darkCard, overflow: "hidden" }}>
          {/* Search bar */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #2C333A", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", width: 260 }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#8A94A5", pointerEvents: "none" }}>🔍</span>
              <input
                style={{ ...inputSty, paddingLeft: 32, height: 34 }}
                placeholder="Search projects..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); setSearch(searchInput); } }}
              />
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#1D2125" }}>
              <tr>
                {["Name", "Description", "Status", "Owner", "Actions"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} style={tdStyle}><div style={{ height: 12, background: "#2C333A", borderRadius: 4 }} /></td>
                    ))}
                  </tr>
                ))
              ) : projects.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 60, textAlign: "center", color: "#8A94A5", fontSize: 14 }}>No projects yet. Create your first one!</td></tr>
              ) : projects.map((project) => (
                <tr key={project.id}
                  onMouseEnter={e => (e.currentTarget.style.background = "#1D2125")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  style={{ transition: "background 0.1s", cursor: "default" }}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: "#DFE1E6" }}>{project.name}</td>
                  <td style={{ ...tdStyle, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{project.description || "—"}</td>
                  <td style={tdStyle}><StatusBadge status={project.status} /></td>
                  <td style={tdStyle}>{project.owner ? `${project.owner.firstName} ${project.owner.lastName}` : "—"}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => openEdit(project)} style={{ background: "#2C333A", border: "none", color: "#8A94A5", cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontSize: 12 }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#388BFF20"; e.currentTarget.style.color = "#4C9AFF"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#2C333A"; e.currentTarget.style.color = "#8A94A5"; }}>
                        Edit
                      </button>
                      <button onClick={() => setDeleteTarget(project)} style={{ background: "#2C333A", border: "none", color: "#8A94A5", cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontSize: 12 }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#FF563020"; e.currentTarget.style.color = "#FF5630"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#2C333A"; e.currentTarget.style.color = "#8A94A5"; }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "12px 16px", borderTop: "1px solid #2C333A" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ width: 28, height: 28, borderRadius: 3, border: "1px solid", borderColor: p === page ? accentBlue : "#2C333A", background: p === page ? accentBlue : "transparent", color: p === page ? "#fff" : "#8A94A5", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editProject ? "Edit Project" : "Create Project"}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelSty}>Project Name</label>
            <input style={inputSty} placeholder="e.g. Website Redesign" {...register("name")}
              onFocus={e => (e.target.style.borderColor = accentBlue)} onBlur={e => (e.target.style.borderColor = "#2C333A")} />
            {errors.name && <p style={{ fontSize: 12, color: "#FF5630", marginTop: 4 }}>{errors.name.message}</p>}
          </div>
          <div>
            <label style={labelSty}>Description</label>
            <textarea style={{ ...inputSty, height: 80, resize: "none", paddingTop: 10 }} placeholder="Optional..." {...register("description")}
              onFocus={e => (e.target.style.borderColor = accentBlue)} onBlur={e => (e.target.style.borderColor = "#2C333A")} />
          </div>
          <div>
            <label style={labelSty}>Status</label>
            <select style={{ ...inputSty }} {...register("status")}
              onFocus={e => (e.target.style.borderColor = accentBlue)} onBlur={e => (e.target.style.borderColor = "#2C333A")}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ padding: "8px 16px", borderRadius: 3, border: "1px solid #2C333A", background: "transparent", color: "#8A94A5", cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding: "8px 16px", borderRadius: 3, border: "none", background: saving ? "#42526E" : accentBlue, color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600 }}>
              {saving ? "Saving..." : (editProject ? "Update" : "Create")}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={() => setDeleteTarget(null)} />
          <div style={{ position: "relative", background: "#22272B", border: "1px solid #2C333A", borderRadius: 6, width: 400, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#DFE1E6", margin: "0 0 8px" }}>Delete project?</h3>
            <p style={{ fontSize: 13, color: "#8A94A5", margin: "0 0 20px" }}>Delete &quot;{deleteTarget.name}&quot;? This cannot be undone.</p>
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
