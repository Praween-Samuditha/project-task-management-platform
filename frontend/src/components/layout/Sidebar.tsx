"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const accentBlue = "#0052CC";
const sidebarBg = "#FAFBFC";
const sidebarBorder = "#DCDFE4";
const textPrimary = "#172B4D";
const textSecondary = "#44546F";
const textMuted = "#8590A2";
const activeBg = "#E8F0FE";
const hoverBg = "#F1F2F4";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/projects", label: "Projects", icon: "📁" },
  { href: "/tasks", label: "Tasks", icon: "🗂" },
];

const BOTTOM_LINKS = [
  { label: "Filters", icon: "⚡" },
  { label: "Dashboards", icon: "⊞" },
  { label: "Teams", icon: "👥" },
  { label: "Customize sidebar", icon: "⚙" },
];

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

const NAV_ITEMS_FULL = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/projects", label: "Projects", icon: "📁" },
  { href: "/tasks", label: "Board", icon: "🗂" },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "?";

  const navItems = [...NAV_ITEMS_FULL,
    ...(user?.role?.name === "ADMIN" ? [{ href: "/users", label: "Members", icon: "👥" }] : [])
  ];

  return (
    <aside style={{
      width: collapsed ? 72 : 240,
      minWidth: collapsed ? 72 : 240,
      height: "100vh",
      background: sidebarBg,
      borderRight: `1px solid ${sidebarBorder}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transition: "width 0.2s ease",
      fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      flexShrink: 0,
      position: "relative"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", padding: "16px 14px", borderBottom: `1px solid ${sidebarBorder}` }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, textDecoration: "none", color: textPrimary }}>
          <div style={{ width: 32, height: 32, background: accentBlue, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
            FP
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>FlowPilot</div>
              <div style={{ fontSize: 12, color: textMuted, marginTop: 2 }}>Project workspace</div>
            </div>
          )}
        </Link>
        <button onClick={onToggle} style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 32, height: 32, borderRadius: 10, border: "1px solid #D9E1EC",
          background: "#fff", color: textSecondary, cursor: "pointer"
        }} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      <div style={{ flex: 1, padding: collapsed ? "12px 0" : "16px" }}>
        {(collapsed ? navItems : navItems).map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: collapsed ? "12px 0" : "10px 14px",
              margin: collapsed ? "4px 0" : "0 0 8px",
              justifyContent: collapsed ? "center" : "flex-start",
              borderRadius: 10,
              background: active ? activeBg : "transparent",
              color: active ? accentBlue : textPrimary,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: active ? 700 : 500,
              transition: "background 0.15s"
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ display: "inline-flex", width: 24, height: 24, alignItems: "center", justifyContent: "center", fontSize: 16 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {!collapsed && (
          <div style={{ marginTop: 24, padding: "12px 14px", background: "#F5F8FB", borderRadius: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: textMuted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Spaces</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fff", borderRadius: 10, border: "1px solid #E4E9F2" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "#E6F0FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>My</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: textPrimary }}>My Space</div>
                <div style={{ fontSize: 11, color: textMuted }}>Summary</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${sidebarBorder}`, padding: collapsed ? "12px 0" : "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10, justifyContent: collapsed ? "center" : "flex-start" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#0052CC,#6554C0)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>{initials}</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>{user?.firstName ?? "Guest"}</div>
              <div style={{ fontSize: 11, color: textMuted }}>{user?.role?.name ?? "Member"}</div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button onClick={logout} style={{ marginTop: 12, width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #D9E1EC", background: "#fff", color: textSecondary, fontSize: 13, cursor: "pointer" }}>Logout</button>
        )}
      </div>
    </aside>
  );
}
