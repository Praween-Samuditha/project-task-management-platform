"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";
import { getUsers } from "@/services/user.service";
import { User } from "@/types";

const darkCard = { background: "#22272B", border: "1px solid #2C333A", borderRadius: 4 };
const thStyle: React.CSSProperties = { padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#8A94A5", textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #2C333A" };
const tdStyle: React.CSSProperties = { padding: "12px 16px", fontSize: 13, color: "#B3BAC5", borderBottom: "1px solid #2C333A" };

const AVATAR_COLORS = [
  "linear-gradient(135deg,#0052CC,#6554C0)",
  "linear-gradient(135deg,#36B37E,#00B8D9)",
  "linear-gradient(135deg,#FF5630,#FF8B00)",
  "linear-gradient(135deg,#6554C0,#8777D9)",
  "linear-gradient(135deg,#FFAB00,#FF8B00)",
  "linear-gradient(135deg,#00B8D9,#0052CC)",
];

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role.toUpperCase().includes("ADMIN");
  return (
    <span style={{
      background: isAdmin ? "rgba(0,82,204,0.15)" : "rgba(137,147,164,0.15)",
      color: isAdmin ? "#4C9AFF" : "#8993A4",
      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 3
    }}>
      {role}
    </span>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getUsers(page, 20)
      .then((data) => { setUsers(data.users ?? []); setTotalPages(data.pagination?.totalPages ?? 1); })
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const getInitials = (u: User) => `${u.firstName?.[0] ?? ""}${u.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "#DFE1E6", margin: "0 0 4px" }}>Members</h2>
            <p style={{ fontSize: 13, color: "#8A94A5", margin: 0 }}>{users.length} workspace members</p>
          </div>
        </div>

        {/* Table */}
        <div style={{ ...darkCard, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#1D2125" }}>
              <tr>
                {["Member", "Email Address", "Workspace Role", "Status", "Joined"].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} style={tdStyle}><div style={{ height: 12, background: "#2C333A", borderRadius: 4 }} /></td>)}</tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 60, textAlign: "center", color: "#8A94A5", fontSize: 14 }}>No members found.</td></tr>
              ) : users.map((user, idx) => (
                <tr key={user.id} style={{ transition: "background 0.1s", cursor: "default" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#1D2125")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>

                  {/* Member */}
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
                        <p style={{ fontWeight: 600, color: "#DFE1E6", margin: "0 0 2px", fontSize: 13 }}>{user.firstName} {user.lastName}</p>
                        <p style={{ fontSize: 11, color: "#8A94A5", margin: 0 }}>ID: {user.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ ...tdStyle, color: "#8A94A5" }}>{user.email}</td>

                  {/* Role */}
                  <td style={tdStyle}><RoleBadge role={user.role?.name ?? "MEMBER"} /></td>

                  {/* Status */}
                  <td style={tdStyle}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: user.isActive ? "rgba(54,179,126,0.15)" : "rgba(137,147,164,0.15)",
                      color: user.isActive ? "#36B37E" : "#8993A4",
                      fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 3
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: user.isActive ? "#36B37E" : "#8993A4", display: "inline-block" }} />
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Joined */}
                  <td style={{ ...tdStyle, color: "#8A94A5" }}>
                    {new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "12px 16px", borderTop: "1px solid #2C333A" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ width: 28, height: 28, borderRadius: 3, border: "1px solid", borderColor: p === page ? "#0052CC" : "#2C333A", background: p === page ? "#0052CC" : "transparent", color: p === page ? "#fff" : "#8A94A5", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
