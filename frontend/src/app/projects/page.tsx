"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";
import { getProjects, createProject, updateProject, deleteProject, getProjectMembers, addProjectMember, removeProjectMember } from "@/services/project.service";
import { getUsers } from "@/services/user.service";
import { Project, User } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import ProjectKanbanBoard from "@/components/ui/ProjectKanbanBoard";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { useTheme } from "@/components/layout/Navbar";

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
  const { role, user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { current: currentWs, currentProjectIds, addProjectToWorkspace, removeProjectFromWorkspace } = useWorkspace();
  const canCreateProject = ["ADMIN", "MANAGER"].includes(role ?? "");
  const canManageMembers = ["ADMIN", "MANAGER"].includes(role ?? "");
  const canRemoveMembers = role === "ADMIN";
  const canEditProject = ["ADMIN", "MANAGER"].includes(role ?? "");
  const canDeleteProject = role === "ADMIN";
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showMyProjects, setShowMyProjects] = useState(role === "MANAGER");
  const [searchInput, setSearchInput] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [memberLoading, setMemberLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const fetchProjects = useCallback(() => {
    setLoading(true);
    const memberId = showMyProjects && user?.id ? user.id : undefined;
    getProjects(page, 100, search, memberId)
      .then((data) => { setProjects(data.projects ?? []); setTotalPages(data.pagination?.totalPages ?? 1); })
      .catch(() => toast.error("Failed to load projects"))
      .finally(() => setLoading(false));
  }, [page, search, showMyProjects, user?.id]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  useEffect(() => {
    if (canManageMembers) {
      getUsers(1, 100)
        .then((data) => setAvailableUsers(data.users ?? []))
        .catch(() => toast.error("Failed to load users"));
    }
  }, [canManageMembers]);

  const loadProjectMembers = async (projectId: number) => {
    setMemberLoading(true);
    try {
      const members = await getProjectMembers(projectId);
      setProjectMembers(members);
    } catch {
      toast.error("Failed to load project members");
    } finally {
      setMemberLoading(false);
    }
  };

  const openMembers = (project: Project) => {
    setSelectedProject(project);
    setMembersModalOpen(true);
    setSelectedUserId("");
    loadProjectMembers(project.id);
  };

  const addMember = async () => {
    if (!selectedProject || !selectedUserId) return;
    setMemberLoading(true);
    try {
      await addProjectMember(selectedProject.id, selectedUserId as number);
      toast.success("Member added");
      loadProjectMembers(selectedProject.id);
      fetchProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add member");
    } finally {
      setMemberLoading(false);
    }
  };

  const removeMember = async (userId: number) => {
    if (!selectedProject) return;
    setMemberLoading(true);
    try {
      await removeProjectMember(selectedProject.id, userId);
      toast.success("Member removed");
      loadProjectMembers(selectedProject.id);
      fetchProjects();
    } catch {
      toast.error("Failed to remove member");
    } finally {
      setMemberLoading(false);
    }
  };

  const openCreate = () => { setEditProject(null); reset({ name: "", description: "", status: "ACTIVE" }); setModalOpen(true); };
  const openEdit = (p: Project) => { setEditProject(p); reset({ name: p.name, description: p.description ?? "", status: (p.status as "ACTIVE" | "PLANNING" | "COMPLETED") }); setModalOpen(true); };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editProject) {
        await updateProject(editProject.id, data);
        toast.success("Project updated");
      } else {
        const created = await createProject(data);
        addProjectToWorkspace(created.id);
        toast.success("Project created");
      }
      setModalOpen(false); fetchProjects();
    } catch (error: any) { toast.error(error.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProject(deleteTarget.id);
      removeProjectFromWorkspace(deleteTarget.id);
      toast.success("Project deleted");
      setDeleteTarget(null);
      fetchProjects();
    }
    catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  // filter to only projects in current workspace
  const wsProjects = currentProjectIds.length > 0
    ? projects.filter(p => currentProjectIds.includes(p.id))
    : [];

  const textPrimary = isDark ? "#DFE1E6" : "#1A1D23";
  const textSecondary = isDark ? "#8A94A5" : "#6B7280";
  const accent = isDark ? "#4C9EFF" : "#0052CC";
  const emptyBg = isDark ? "#22272B" : "#FFFFFF";
  const emptyBorder = isDark ? "#2C333A" : "#E8ECF0";

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: textPrimary, margin: "0 0 4px" }}>
              {currentWs?.name ?? "Projects"}
            </h2>
            <p style={{ fontSize: 13, color: textSecondary, margin: 0 }}>{wsProjects.length} project{wsProjects.length !== 1 ? "s" : ""}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#8A94A5", fontSize: 13 }}>
              <input type="checkbox" checked={showMyProjects} onChange={(e) => setShowMyProjects(e.target.checked)} style={{ accent: accentBlue }} />
              My projects only
            </label>
            {canCreateProject && (
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
            )}
          </div>
        </div>

        {/* Empty workspace state */}
        {!loading && wsProjects.length === 0 && (
          <div style={{
            background: emptyBg, border: `2px dashed ${emptyBorder}`, borderRadius: 16,
            padding: "64px 32px", textAlign: "center",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📂</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, margin: "0 0 8px" }}>
              No projects in this workspace
            </h3>
            <p style={{ fontSize: 14, color: textSecondary, margin: "0 0 24px" }}>
              Get started by creating your first project in <strong>{currentWs?.name}</strong>
            </p>
            {canCreateProject && (
              <button
                onClick={openCreate}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: accent, color: "#fff", border: "none",
                  borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <span style={{ fontSize: 18 }}>+</span> Create First Project
              </button>
            )}
          </div>
        )}

        {/* Kanban Board */}
        {(loading || wsProjects.length > 0) && (
          <ProjectKanbanBoard
            projects={wsProjects}
            isLoading={loading}
            onProjectEdit={canEditProject ? openEdit : undefined}
            onProjectMembers={canManageMembers ? openMembers : undefined}
            onProjectDelete={canDeleteProject ? (id) => {
              const project = projects.find(p => p.id === id);
              if (project) setDeleteTarget(project);
            } : undefined}
          />
        )}
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

      {/* Members Modal */}
      {membersModalOpen && selectedProject && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={() => setMembersModalOpen(false)} />
          <div style={{ position: "relative", background: "#22272B", border: "1px solid #2C333A", borderRadius: 6, width: "100%", maxWidth: 540, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#DFE1E6", margin: "0 0 16px" }}>Project Members</h3>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#8A94A5", marginBottom: 4 }}>Project</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{selectedProject.name}</div>
            </div>

            {canManageMembers && (
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 18 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelSty}>Add member</label>
                  <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : "")} style={{ ...inputSty, width: "100%" }}>
                    <option value="">Select user</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>{user.firstName} {user.lastName} ({user.role.name})</option>
                    ))}
                  </select>
                </div>
                <button onClick={addMember} disabled={!selectedUserId || memberLoading} style={{ padding: "10px 16px", borderRadius: 4, border: "none", background: accentBlue, color: "#fff", fontWeight: 600, cursor: selectedUserId && !memberLoading ? "pointer" : "not-allowed" }}>
                  {memberLoading ? "Adding..." : "Add"}
                </button>
              </div>
            )}

            <div>
              <div style={{ fontSize: 12, color: "#8A94A5", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Current Members</div>
              <div style={{ display: "grid", gap: 12 }}>
                {memberLoading ? (
                  <div style={{ color: "#8A94A5" }}>Loading members…</div>
                ) : projectMembers.length === 0 ? (
                  <div style={{ color: "#8A94A5" }}>No members assigned.</div>
                ) : (
                  projectMembers.map((member) => (
                    <div key={member.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "#161A1D", borderRadius: 8, border: "1px solid #2C333A" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{member.firstName} {member.lastName}</div>
                        <div style={{ fontSize: 12, color: "#8A94A5" }}>{member.email}</div>
                      </div>
                      {canRemoveMembers && (
                        <button onClick={() => removeMember(member.id)} disabled={memberLoading} style={{ padding: "8px 12px", borderRadius: 6, border: "none", background: "#DE350B", color: "#fff", cursor: memberLoading ? "not-allowed" : "pointer" }}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            <button onClick={() => setMembersModalOpen(false)} style={{ marginTop: 20, padding: "10px 16px", borderRadius: 6, border: "1px solid #2C333A", background: "transparent", color: "#8A94A5" }}>Close</button>
          </div>
        </div>
      )}

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

