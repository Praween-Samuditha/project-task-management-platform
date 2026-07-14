"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "./Navbar";
import { useWorkspace } from "@/lib/WorkspaceContext";

const accentBlue = "#0052CC";

const LIGHT_SIDEBAR = {
  bg: "#FAFBFC", border: "#DCDFE4",
  textPrimary: "#172B4D", textSecondary: "#44546F", textMuted: "#8590A2",
  activeBg: "#E8F0FE", hoverBg: "#F1F2F4",
  footerBorder: "#DCDFE4", logoutBg: "#fff", logoutBorder: "#D9E1EC",
  dropdownBg: "#FFFFFF", dropdownBorder: "#DCDFE4", dropdownHover: "#F1F2F4",
  dropdownShadow: "0 8px 24px rgba(0,0,0,0.12)",
  inputBg: "#F8F9FB", inputBorder: "#D1D5DB",
};
const DARK_SIDEBAR = {
  bg: "#1D2125", border: "#2C333A",
  textPrimary: "#DFE1E6", textSecondary: "#8A94A5", textMuted: "#6B7280",
  activeBg: "rgba(0,82,204,0.18)", hoverBg: "#2C333A",
  footerBorder: "#2C333A", logoutBg: "#22272B", logoutBorder: "#2C333A",
  dropdownBg: "#22272B", dropdownBorder: "#2C333A", dropdownHover: "#2C333A",
  dropdownShadow: "0 8px 24px rgba(0,0,0,0.4)",
  inputBg: "#161A1D", inputBorder: "#2C333A",
};

const NAV_BY_ROLE: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
  ADMIN: [
    { href: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
    { href: "/users",     label: "Members",   icon: <IconMembers /> },
  ],
  MANAGER: [
    { href: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
    { href: "/users",     label: "Members",   icon: <IconMembers /> },
  ],
  MEMBER: [
    { href: "/dashboard", label: "Dashboard", icon: <IconDashboard /> },
  ],
};

function IconDashboard() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
}
function IconUser() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function IconFolder() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
}
function IconTask() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>;
}
function IconMembers() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>;
}
function IconPlus() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function IconEdit() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function IconTrash() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
}
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function WorkspaceAvatar({ name, color, size = 28 }: { name: string; color: string; size?: number }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: 6, background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user, role } = useAuth();
  const { theme } = useTheme();
  const T = theme === "dark" ? DARK_SIDEBAR : LIGHT_SIDEBAR;
  const { workspaces, current, switchWorkspace, createWorkspace, editWorkspace, deleteWorkspace } = useWorkspace();

  const [wsOpen, setWsOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setWsOpen(false);
        setCreating(false);
        setNewName("");
        setEditingId(null);
        setDeleteConfirmId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (creating && inputRef.current) inputRef.current.focus();
  }, [creating]);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createWorkspace(newName);
    setNewName("");
    setCreating(false);
    setWsOpen(false);
  };

  const startEdit = (ws: { id: string; name: string }, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(ws.id);
    setEditName(ws.name);
    setDeleteConfirmId(null);
  };

  const handleEdit = (id: string) => {
    if (!editName.trim()) return;
    editWorkspace(id, editName);
    setEditingId(null);
  };

  const startDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
    setEditingId(null);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteWorkspace(id);
    setDeleteConfirmId(null);
  };

  const navItems = NAV_BY_ROLE[role ?? "MEMBER"] ?? NAV_BY_ROLE.MEMBER;
  const uniqueNavItems = navItems.filter((item, idx, arr) => arr.findIndex(i => i.label === item.label) === idx);

  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "?";
  const roleBadgeColor: Record<string, string> = { ADMIN: "#FF5630", MANAGER: "#FFAB00", MEMBER: "#36B37E" };

  return (
    <aside style={{
      width: collapsed ? 72 : 240, minWidth: collapsed ? 72 : 240,
      height: "100vh", background: T.bg, borderRight: `1px solid ${T.border}`,
      display: "flex", flexDirection: "column", overflow: "hidden",
      transition: "width 0.2s ease, background 0.2s",
      fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      flexShrink: 0, position: "relative",
    }}>

      {/* ── Workspace Switcher ── */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <div
          onClick={() => !collapsed && setWsOpen(o => !o)}
          style={{
            display: "flex", alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            padding: collapsed ? "14px 0" : "12px 14px",
            borderBottom: `1px solid ${T.border}`,
            cursor: collapsed ? "default" : "pointer",
            userSelect: "none",
            transition: "background 0.12s",
          }}
          onMouseEnter={e => { if (!collapsed) e.currentTarget.style.background = T.hoverBg; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {current && <WorkspaceAvatar name={current.name} color={current.color} size={32} />}
            {!collapsed && current && (
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, lineHeight: 1.2 }}>{current.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}</div>
              </div>
            )}
          </div>
          {!collapsed && (
            <div style={{ color: T.textMuted }}>
              <IconChevron open={wsOpen} />
            </div>
          )}
        </div>

        {/* Dropdown */}
        {wsOpen && !collapsed && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200,
            background: T.dropdownBg, border: `1px solid ${T.dropdownBorder}`,
            borderRadius: "0 0 8px 8px", boxShadow: T.dropdownShadow,
            overflow: "hidden",
          }}>
            {/* Section label */}
            <div style={{ padding: "10px 14px 6px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1 }}>
              Workspaces
            </div>

            {/* Workspace list */}
            {workspaces.map(ws => (
              <div key={ws.id}>
                {editingId === ws.id ? (
                  // ── Inline edit row ──
                  <div style={{ padding: "6px 14px" }} onClick={e => e.stopPropagation()}>
                    <input
                      ref={editInputRef}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleEdit(ws.id); if (e.key === "Escape") setEditingId(null); }}
                      style={{ width: "100%", height: 30, background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 4, color: T.textPrimary, fontSize: 13, padding: "0 8px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                    />
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <button onClick={() => handleEdit(ws.id)} style={{ flex: 1, height: 26, background: accentBlue, color: "#fff", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Save</button>
                      <button onClick={() => setEditingId(null)} style={{ flex: 1, height: 26, background: "transparent", color: T.textSecondary, border: `1px solid ${T.dropdownBorder}`, borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                    </div>
                  </div>
                ) : deleteConfirmId === ws.id ? (
                  // ── Delete confirm row ──
                  <div style={{ padding: "8px 14px", background: "rgba(222,53,11,0.08)" }} onClick={e => e.stopPropagation()}>
                    <p style={{ fontSize: 12, color: "#FF5630", margin: "0 0 8px", fontWeight: 600 }}>Delete "{ws.name}"?</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={e => confirmDelete(ws.id, e)} style={{ flex: 1, height: 26, background: "#DE350B", color: "#fff", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                      <button onClick={e => { e.stopPropagation(); setDeleteConfirmId(null); }} style={{ flex: 1, height: 26, background: "transparent", color: T.textSecondary, border: `1px solid ${T.dropdownBorder}`, borderRadius: 4, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  // ── Normal row ──
                  <div
                    onClick={() => { switchWorkspace(ws.id); setWsOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 14px", cursor: "pointer",
                      background: ws.id === current?.id ? T.activeBg : "transparent",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={e => { if (ws.id !== current?.id) e.currentTarget.style.background = T.dropdownHover; }}
                    onMouseLeave={e => { if (ws.id !== current?.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <WorkspaceAvatar name={ws.name} color={ws.color} size={28} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ws.name}</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>{ws.memberCount} member{ws.memberCount !== 1 ? "s" : ""}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, marginLeft: 6 }}>
                      {ws.id === current?.id && <span style={{ color: accentBlue, marginRight: 2 }}><IconCheck /></span>}
                      <button
                        onClick={e => startEdit(ws, e)}
                        title="Rename"
                        style={{ width: 22, height: 22, borderRadius: 4, border: "none", background: "transparent", color: T.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                        onMouseEnter={e => (e.currentTarget.style.color = T.textPrimary)}
                        onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}
                      >
                        <IconEdit />
                      </button>
                      {workspaces.length > 1 && (
                        <button
                          onClick={e => startDelete(ws.id, e)}
                          title="Delete"
                          style={{ width: 22, height: 22, borderRadius: 4, border: "none", background: "transparent", color: T.textMuted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#FF5630")}
                          onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}
                        >
                          <IconTrash />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Divider */}
            <div style={{ height: 1, background: T.dropdownBorder, margin: "4px 0" }} />

            {/* Create workspace */}
            {creating ? (
              <div style={{ padding: "10px 14px" }}>
                <input
                  ref={inputRef}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setCreating(false); setNewName(""); } }}
                  placeholder="Workspace name..."
                  style={{
                    width: "100%", height: 32, background: T.inputBg, border: `1px solid ${T.inputBorder}`,
                    borderRadius: 4, color: T.textPrimary, fontSize: 13, padding: "0 10px",
                    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                  }}
                />
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button
                    onClick={handleCreate}
                    style={{ flex: 1, height: 28, background: accentBlue, color: "#fff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setCreating(false); setNewName(""); }}
                    style={{ flex: 1, height: 28, background: "transparent", color: T.textSecondary, border: `1px solid ${T.dropdownBorder}`, borderRadius: 4, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setCreating(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 14px", cursor: "pointer", color: accentBlue,
                  fontSize: 13, fontWeight: 600, transition: "background 0.12s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = T.dropdownHover)}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <IconPlus /> Create Workspace
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Role badge ── */}
      {!collapsed && role && (
        <div style={{ padding: "8px 14px", borderBottom: `1px solid ${T.border}` }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
            background: `${roleBadgeColor[role]}20`, color: roleBadgeColor[role],
            padding: "3px 8px", borderRadius: 3,
          }}>
            {role}
          </span>
        </div>
      )}

      {/* ── Nav items ── */}
      <nav style={{ flex: 1, padding: collapsed ? "12px 0" : "12px 10px", overflowY: "auto" }}>
        {uniqueNavItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: collapsed ? "12px 0" : "9px 12px",
                margin: "2px 0",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: 8,
                background: active ? T.activeBg : "transparent",
                color: active ? accentBlue : T.textPrimary,
                textDecoration: "none",
                fontSize: 14, fontWeight: active ? 600 : 500,
                transition: "background 0.12s",
                borderLeft: active && !collapsed ? `3px solid ${accentBlue}` : "3px solid transparent",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.hoverBg; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Collapse toggle ── */}
      <div style={{ padding: collapsed ? "8px 0" : "0 10px 8px", display: "flex", justifyContent: collapsed ? "center" : "flex-end" }}>
        <button
          onClick={onToggle}
          style={{
            width: 28, height: 28, borderRadius: 8, border: `1px solid ${T.border}`,
            background: T.logoutBg, color: T.textSecondary, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
          }}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* ── User footer ── */}
      <div style={{ borderTop: `1px solid ${T.footerBorder}`, padding: collapsed ? "12px 0" : "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start" }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: `linear-gradient(135deg, ${roleBadgeColor[role ?? "MEMBER"] ?? accentBlue}, #6554C0)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{user?.email}</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={logout}
            style={{
              marginTop: 10, width: "100%", padding: "8px 12px",
              borderRadius: 8, border: `1px solid ${T.logoutBorder}`,
              background: T.logoutBg, color: T.textSecondary,
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#FFF0EE"; e.currentTarget.style.color = "#FF5630"; e.currentTarget.style.borderColor = "#FF5630"; }}
            onMouseLeave={e => { e.currentTarget.style.background = T.logoutBg; e.currentTarget.style.color = T.textSecondary; e.currentTarget.style.borderColor = T.logoutBorder; }}
          >
            <span>⏻</span> Logout
          </button>
        )}
        {collapsed && (
          <button
            onClick={logout}
            title="Logout"
            style={{ marginTop: 8, width: "100%", padding: "8px 0", border: "none", background: "transparent", color: T.textMuted, fontSize: 16, cursor: "pointer", display: "flex", justifyContent: "center" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#FF5630")}
            onMouseLeave={e => (e.currentTarget.style.color = T.textMuted)}
          >
            ⏻
          </button>
        )}
      </div>
    </aside>
  );
}
