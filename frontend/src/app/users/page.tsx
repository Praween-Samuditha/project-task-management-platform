"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";
import PermissionRoute from "@/components/PermissionRoute";
import api from "@/services/api";

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
const darkCard = { background: "#22272B", border: "1px solid #2C333A", borderRadius: 4 };
const thStyle: React.CSSProperties = { 
  padding: "10px 14px", 
  textAlign: "left", 
  fontSize: 11, 
  fontWeight: 700, 
  color: "#8A94A5", 
  textTransform: "uppercase", 
  letterSpacing: 1, 
  borderBottom: "1px solid #2C333A" 
};
const tdStyle: React.CSSProperties = { 
  padding: "11px 14px", 
  fontSize: 13, 
  color: "#B3BAC5", 
  borderBottom: "1px solid #2C333A" 
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

  const getInitials = (u: User) => `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <PermissionRoute requiredRoles={["ADMIN"]}>
      <AppLayout>
        <div style={{ maxWidth: 1200, fontFamily: "inherit" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "#DFE1E6", margin: "0 0 4px" }}>Users Management</h2>
              <p style={{ fontSize: 13, color: "#8A94A5", margin: 0 }}>{users.length} workspace members</p>
            </div>
          </div>

          {/* Users Table */}
          <div style={{ ...darkCard, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#1D2125" }}>
                <tr>
                  {["Member", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} style={tdStyle}>
                          <div style={{ height: 12, background: "#2C333A", borderRadius: 4 }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 60, textAlign: "center", color: "#8A94A5", fontSize: 14 }}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, idx) => (
                    <tr
                      key={user.id}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#1D2125")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      style={{ transition: "background 0.1s", cursor: "default" }}
                    >
                      <td style={tdStyle}>
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
                            <p style={{ fontWeight: 600, color: "#DFE1E6", margin: "0 0 2px", fontSize: 13 }}>
                              {user.firstName} {user.lastName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}>{user.email}</td>
                      <td style={tdStyle}>
                        <RoleBadge role={user.role.name} />
                      </td>
                      <td style={tdStyle}>
                        <StatusBadge isActive={user.isActive} />
                      </td>
                      <td style={tdStyle}>
                        {new Date(user.createdAt).toLocaleDateString(undefined, { 
                          month: "short", 
                          day: "numeric", 
                          year: "numeric" 
                        })}
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setNewRole(user.role.id);
                            }}
                            style={{
                              background: "#2C333A",
                              border: "none",
                              color: "#8A94A5",
                              cursor: "pointer",
                              borderRadius: 3,
                              padding: "4px 8px",
                              fontSize: 12,
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = "#388BFF20";
                              (e.currentTarget as HTMLButtonElement).style.color = "#4C9AFF";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = "#2C333A";
                              (e.currentTarget as HTMLButtonElement).style.color = "#8A94A5";
                            }}
                          >
                            Change Role
                          </button>
                          <button
                            onClick={() => {
                              setActionUser(user);
                              setActionType(user.isActive ? "deactivate" : "activate");
                            }}
                            style={{
                              background: "#2C333A",
                              border: "none",
                              color: "#8A94A5",
                              cursor: "pointer",
                              borderRadius: 3,
                              padding: "4px 8px",
                              fontSize: 12,
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = "#FF563020";
                              (e.currentTarget as HTMLButtonElement).style.color = "#FF5630";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = "#2C333A";
                              (e.currentTarget as HTMLButtonElement).style.color = "#8A94A5";
                            }}
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
              <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "12px 16px", borderTop: "1px solid #2C333A" }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: p === page ? accentBlue : "#2C333A",
                      background: p === page ? accentBlue : "transparent",
                      color: p === page ? "#fff" : "#8A94A5",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Role Change Modal */}
        {selectedUser && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={() => setSelectedUser(null)} />
            <div style={{ position: "relative", background: "#22272B", border: "1px solid #2C333A", borderRadius: 6, width: 400, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#DFE1E6", margin: "0 0 16px" }}>
                Change Role for {selectedUser.firstName} {selectedUser.lastName}
              </h3>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#8A94A5", marginBottom: 8 }}>
                  Select New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(parseInt(e.target.value))}
                  style={{
                    width: "100%",
                    height: 40,
                    background: "#161A1D",
                    border: "2px solid #2C333A",
                    borderRadius: 3,
                    color: "#DFE1E6",
                    fontSize: 14,
                    padding: "0 12px",
                    fontFamily: "inherit",
                  }}
                >
                  {ROLES.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  onClick={() => setSelectedUser(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 3,
                    border: "1px solid #2C333A",
                    background: "transparent",
                    color: "#8A94A5",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateRole}
                  disabled={updating}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 3,
                    border: "none",
                    background: updating ? "#42526E" : accentBlue,
                    color: "#fff",
                    cursor: updating ? "not-allowed" : "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {updating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Confirmation Modal */}
        {actionUser && actionType && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={() => setActionUser(null)} />
            <div style={{ position: "relative", background: "#22272B", border: "1px solid #2C333A", borderRadius: 6, width: 400, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#DFE1E6", margin: "0 0 8px" }}>
                {actionType === "activate" ? "Activate" : "Deactivate"} User?
              </h3>
              <p style={{ fontSize: 13, color: "#8A94A5", margin: "0 0 20px" }}>
                {actionType === "activate" 
                  ? `Activate ${actionUser.firstName} ${actionUser.lastName}?`
                  : `Deactivate ${actionUser.firstName} ${actionUser.lastName}? They will not be able to access the system.`
                }
              </p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  onClick={() => setActionUser(null)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 3,
                    border: "1px solid #2C333A",
                    background: "transparent",
                    color: "#8A94A5",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={actioning}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 3,
                    border: "none",
                    background: actioning ? "#42526E" : actionType === "deactivate" ? "#DE350B" : "#36B37E",
                    color: "#fff",
                    cursor: actioning ? "not-allowed" : "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
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
