"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";
import PermissionRoute from "@/components/PermissionRoute";
import api from "@/services/api";
import { createUser } from "@/services/user.service";
import { useTheme } from "@/components/layout/Navbar";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  role: {
    id: number;
    name: string;
  };
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const accentBlue = "#0052CC";

const LIGHT_USERS = {
  cardBg: "#FFFFFF", cardBorder: "#E8ECF0",
  theadBg: "#F8F9FB",
  thColor: "#6B7280", thBorder: "#E8ECF0",
  tdColor: "#172B4D", tdBorder: "#E8ECF0",
  rowHover: "#F8F9FB",
  skeletonBg: "#F1F2F4",
  emptyColor: "#8590A2",
  titleColor: "#172B4D", subColor: "#6B7280",
  btnBg: "#F1F2F4", btnColor: "#44546F", btnHoverBg: "#E2E6EA",
  modalBg: "#FFFFFF", modalBorder: "#E8ECF0",
  modalTitle: "#172B4D", labelColor: "#6B7280",
  inputBg: "#F8F9FB", inputBorder: "#E8ECF0", inputColor: "#172B4D",
  cancelBorder: "#E8ECF0", cancelColor: "#6B7280",
  paginBorder: "#E8ECF0", paginColor: "#6B7280",
};

const DARK_USERS = {
  cardBg: "#22272B", cardBorder: "#2C333A",
  theadBg: "#1D2125",
  thColor: "#8A94A5", thBorder: "#2C333A",
  tdColor: "#B3BAC5", tdBorder: "#2C333A",
  rowHover: "#1D2125",
  skeletonBg: "#2C333A",
  emptyColor: "#8A94A5",
  titleColor: "#DFE1E6", subColor: "#8A94A5",
  btnBg: "#2C333A", btnColor: "#8A94A5", btnHoverBg: "#3A4149",
  modalBg: "#22272B", modalBorder: "#2C333A",
  modalTitle: "#DFE1E6", labelColor: "#8A94A5",
  inputBg: "#161A1D", inputBorder: "#2C333A", inputColor: "#DFE1E6",
  cancelBorder: "#2C333A", cancelColor: "#8A94A5",
  paginBorder: "#2C333A", paginColor: "#8A94A5",
};

const AVATAR_COLORS = [
  "linear-gradient(135deg,#0052CC,#6554C0)",
  "linear-gradient(135deg,#36B37E,#00B8D9)",
  "linear-gradient(135deg,#FF5630,#FF8B00)",
  "linear-gradient(135deg,#6554C0,#8777D9)",
  "linear-gradient(135deg,#FFAB00,#FF8B00)",
  "linear-gradient(135deg,#00B8D9,#0052CC)",
];

const ROLES = [
  { id: 1, name: "ADMIN" },
  { id: 2, name: "MANAGER" },
  { id: 3, name: "MEMBER" },
];

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  ADMIN: { bg: "rgba(255, 86, 48, 0.15)", color: "#FF5630" },
  MANAGER: { bg: "rgba(255, 171, 0, 0.15)", color: "#FFAB00" },
  MEMBER: { bg: "rgba(54, 179, 126, 0.15)", color: "#36B37E" },
};

function RoleBadge({ role }: { role: string }) {
  const colors = ROLE_COLORS[role] || ROLE_COLORS.MEMBER;
  return (
    <span style={{ background: colors.bg, color: colors.color, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 3 }}>
      {role}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span style={{ 
      background: isActive ? "rgba(54, 179, 126, 0.15)" : "rgba(137, 147, 164, 0.15)", 
      color: isActive ? "#36B37E" : "#8993A4", 
      fontSize: 11, 
      fontWeight: 700, 
      padding: "3px 8px", 
      borderRadius: 3 
    }}>
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export default function UsersPage() {
  const { theme } = useTheme();
  const T = theme === "dark" ? DARK_USERS : LIGHT_USERS;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<number>(3);
  const [updating, setUpdating] = useState(false);
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"activate" | "deactivate" | null>(null);
  const [actioning, setActioning] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ firstName: "", lastName: "", email: "", password: "", roleId: 3 });
  const [creating, setCreating] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api.get<UsersResponse>("/users", { params: { page, limit: 20 } })
      .then((res) => {
        console.log("Users fetched:", res.data);
        setUsers(res.data.users);
        setTotalPages(res.data.pagination.totalPages);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      await api.put(`/users/${selectedUser.id}/role`, { roleId: newRole });
      toast.success("User role updated successfully");
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update role");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!actionUser || !actionType) return;
    setActioning(true);
    try {
      const endpoint = actionType === "activate" 
        ? `/users/${actionUser.id}/activate`
        : `/users/${actionUser.id}/deactivate`;
      
      await api.put(endpoint);
      toast.success(`User ${actionType}d successfully`);
      setActionUser(null);
      setActionType(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setActioning(false);
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.password) {
      toast.error("All fields are required");
      return;
    }
    setCreating(true);
    try {
      await createUser(createForm);
      toast.success("User created successfully");
      setCreateModalOpen(false);
      setCreateForm({ firstName: "", lastName: "", email: "", password: "", roleId: 3 });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (u: User) => `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <PermissionRoute requiredRoles={["ADMIN"]}>
      <AppLayout>
        <div style={{ maxWidth: 1200, fontFamily: "inherit" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: T.titleColor, margin: "0 0 4px" }}>Users Management</h2>
              <p style={{ fontSize: 13, color: T.subColor, margin: 0 }}>{users.length} workspace members</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, background: accentBlue, color: "#fff", border: "none", borderRadius: 3, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#0065FF")}
              onMouseLeave={e => (e.currentTarget.style.background = accentBlue)}
            >
              <span style={{ fontSize: 16 }}>+</span> Create User
            </button>
          </div>

          {/* Users Table */}
          <div style={{ background: T.cardBg, border: `1px solid ${T.cardBorder}`, borderRadius: 4, overflow: "hidden", transition: "background 0.2s" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: T.theadBg }}>
                <tr>
                  {["Member", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.thColor, textTransform: "uppercase", letterSpacing: 1, borderBottom: `1px solid ${T.thBorder}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} style={{ padding: "11px 14px", borderBottom: `1px solid ${T.tdBorder}` }}>
                          <div style={{ height: 12, background: T.skeletonBg, borderRadius: 4 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 60, textAlign: "center", color: T.emptyColor, fontSize: 14 }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <tr
                      key={user.id}
                      onMouseEnter={(e) => (e.currentTarget.style.background = T.rowHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      style={{ transition: "background 0.1s", cursor: "default" }}
                    >
                      <td style={{ padding: "11px 14px", fontSize: 13, color: T.tdColor, borderBottom: `1px solid ${T.tdBorder}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0
                          }}>
                            {getInitials(user)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: T.titleColor, margin: "0 0 2px", fontSize: 13 }}>
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: T.tdColor, borderBottom: `1px solid ${T.tdBorder}` }}>{user.email}</td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: T.tdColor, borderBottom: `1px solid ${T.tdBorder}` }}>
                        <RoleBadge role={user.role.name} />
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: T.tdColor, borderBottom: `1px solid ${T.tdBorder}` }}>
                        <StatusBadge isActive={user.isActive} />
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: T.tdColor, borderBottom: `1px solid ${T.tdBorder}` }}>
                        {new Date(user.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: 13, color: T.tdColor, borderBottom: `1px solid ${T.tdBorder}` }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={() => { setSelectedUser(user); setNewRole(user.role.id); }}
                            style={{ background: T.btnBg, border: "none", color: T.btnColor, cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontSize: 12 }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#388BFF20"; (e.currentTarget as HTMLButtonElement).style.color = "#4C9AFF"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = T.btnBg; (e.currentTarget as HTMLButtonElement).style.color = T.btnColor; }}
                          >
                            Change Role
                          </button>
                          <button
                            onClick={() => { setActionUser(user); setActionType(user.isActive ? "deactivate" : "activate"); }}
                            style={{ background: T.btnBg, border: "none", color: T.btnColor, cursor: "pointer", borderRadius: 3, padding: "4px 8px", fontSize: 12 }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FF563020"; (e.currentTarget as HTMLButtonElement).style.color = "#FF5630"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = T.btnBg; (e.currentTarget as HTMLButtonElement).style.color = T.btnColor; }}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "12px 16px", borderTop: `1px solid ${T.tdBorder}` }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{ width: 28, height: 28, borderRadius: 3, border: "1px solid", borderColor: p === page ? accentBlue : T.paginBorder, background: p === page ? accentBlue : "transparent", color: p === page ? "#fff" : T.paginColor, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create User Modal */}
        {createModalOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={() => setCreateModalOpen(false)} />
            <div style={{ position: "relative", background: T.modalBg, border: `1px solid ${T.modalBorder}`, borderRadius: 6, width: 440, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: T.modalTitle, margin: "0 0 20px" }}>Create New User</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {(["firstName", "lastName", "email", "password"] as const).map((field) => (
                  <div key={field}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.labelColor, marginBottom: 6, textTransform: "uppercase" }}>
                      {field === "firstName" ? "First Name" : field === "lastName" ? "Last Name" : field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      type={field === "password" ? "password" : "text"}
                      value={createForm[field]}
                      onChange={e => setCreateForm(f => ({ ...f, [field]: e.target.value }))}
                      style={{ width: "100%", height: 38, background: T.inputBg, border: `2px solid ${T.inputBorder}`, borderRadius: 3, color: T.inputColor, fontSize: 14, padding: "0 12px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.labelColor, marginBottom: 6, textTransform: "uppercase" }}>Role</label>
                  <select
                    value={createForm.roleId}
                    onChange={e => setCreateForm(f => ({ ...f, roleId: parseInt(e.target.value) }))}
                    style={{ width: "100%", height: 38, background: T.inputBg, border: `2px solid ${T.inputBorder}`, borderRadius: 3, color: T.inputColor, fontSize: 14, padding: "0 12px", fontFamily: "inherit" }}
                  >
                    {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
                <button onClick={() => setCreateModalOpen(false)} style={{ padding: "8px 16px", borderRadius: 3, border: `1px solid ${T.cancelBorder}`, background: "transparent", color: T.cancelColor, cursor: "pointer", fontSize: 14 }}>Cancel</button>
                <button onClick={handleCreateUser} disabled={creating} style={{ padding: "8px 16px", borderRadius: 3, border: "none", background: creating ? "#42526E" : accentBlue, color: "#fff", cursor: creating ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}>
                  {creating ? "Creating..." : "Create User"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Role Change Modal */}
        {selectedUser && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={() => setSelectedUser(null)} />
            <div style={{ position: "relative", background: T.modalBg, border: `1px solid ${T.modalBorder}`, borderRadius: 6, width: 400, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: T.modalTitle, margin: "0 0 16px" }}>
                Change Role for {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.labelColor, marginBottom: 8 }}>Select New Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(parseInt(e.target.value))}
                  style={{ width: "100%", height: 40, background: T.inputBg, border: `2px solid ${T.inputBorder}`, borderRadius: 3, color: T.inputColor, fontSize: 14, padding: "0 12px", fontFamily: "inherit" }}
                >
                  {ROLES.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => setSelectedUser(null)} style={{ padding: "8px 16px", borderRadius: 3, border: `1px solid ${T.cancelBorder}`, background: "transparent", color: T.cancelColor, cursor: "pointer", fontSize: 14 }}>Cancel</button>
                <button onClick={handleUpdateRole} disabled={updating} style={{ padding: "8px 16px", borderRadius: 3, border: "none", background: updating ? "#42526E" : accentBlue, color: "#fff", cursor: updating ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}>
                  {updating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Confirmation Modal */}
        {actionUser && actionType && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={() => setActionUser(null)} />
            <div style={{ position: "relative", background: T.modalBg, border: `1px solid ${T.modalBorder}`, borderRadius: 6, width: 400, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: T.modalTitle, margin: "0 0 8px" }}>
                {actionType === "activate" ? "Activate" : "Deactivate"} User?
              </h3>
              <p style={{ fontSize: 13, color: T.labelColor, margin: "0 0 20px" }}>
                {actionType === "activate"
                  ? `Activate ${actionUser.firstName} ${actionUser.lastName}?`
                  : `Deactivate ${actionUser.firstName} ${actionUser.lastName}? They will not be able to access the system.`}
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => setActionUser(null)} style={{ padding: "8px 16px", borderRadius: 3, border: `1px solid ${T.cancelBorder}`, background: "transparent", color: T.cancelColor, cursor: "pointer", fontSize: 14 }}>Cancel</button>
                <button onClick={handleToggleStatus} disabled={actioning} style={{ padding: "8px 16px", borderRadius: 3, border: "none", background: actioning ? "#42526E" : actionType === "deactivate" ? "#DE350B" : "#36B37E", color: "#fff", cursor: actioning ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}>
                  {actioning ? "Processing..." : (actionType === "activate" ? "Activate" : "Deactivate")}
                </button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </PermissionRoute>
  );
}
