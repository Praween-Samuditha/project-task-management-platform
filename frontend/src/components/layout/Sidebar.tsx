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

const SPACES = [
  { href: "/dashboard", label: "Dashboard", icon: "⊞" },
  { href: "/projects", label: "Projects", icon: "📁" },
];

const NAV_TOP = [
  {
    href: "/dashboard", label: "For you",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  },
  {
    href: "#", label: "Recent",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    arrow: true
  },
  {
    href: "#", label: "Starred",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    arrow: true
  },
  {
    href: "#", label: "Apps",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  },
  {
    href: "#", label: "Plans",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
  },
];

interface SidebarProps { collapsed: boolean; onToggle: () => void; }

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "?";

  return (
    <aside style={{
      width: collapsed ? 0 : 240,
      minWidth: collapsed ? 0 : 240,
      height: "100vh",
      background: sidebarBg,
      borderRight: `1px solid ${sidebarBorder}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transition: "width 0.2s, min-width 0.2s",
      fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      flexShrink: 0,
      position: "relative"
    }}>
      {/* Search */}
      <div style={{ padding: "12px 8px 8px" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: textMuted, fontSize: 13 }}>🔍</span>
          <input placeholder="Search" style={{
            width: "100%", height: 36, border: `1px solid ${sidebarBorder}`,
            borderRadius: 4, paddingLeft: 30, paddingRight: 10,
            fontSize: 14, background: "#fff", color: textPrimary, outline: "none",
            fontFamily: "inherit", boxSizing: "border-box"
          }}
          onFocus={e => (e.target.style.borderColor = accentBlue)}
          onBlur={e => (e.target.style.borderColor = sidebarBorder)} />
        </div>
      </div>

      {/* Top nav items */}
      <nav style={{ flex: "none", padding: "4px 0" }}>
        {NAV_TOP.map(({ href, label, icon, arrow }) => {
          const active = pathname === href || (href !== "#" && pathname.startsWith(href));
          return (
            <Link key={label} href={href} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "6px 12px", borderRadius: 4, margin: "1px 8px",
              background: active ? activeBg : "transparent",
              color: active ? accentBlue : textPrimary,
              textDecoration: "none", fontSize: 14, fontWeight: 500,
              transition: "background 0.1s"
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: active ? accentBlue : textSecondary }}>
                {icon}
                <span style={{ color: active ? accentBlue : textPrimary }}>{label}</span>
              </div>
              {arrow && <span style={{ fontSize: 10, color: textMuted }}>›</span>}
            </Link>
          );
        })}
      </nav>

      {/* Spaces section */}
      <div style={{ borderTop: `1px solid ${sidebarBorder}`, paddingTop: 8, margin: "0 0 4px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 12px 6px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: textMuted, letterSpacing: 1, textTransform: "uppercase" }}>Spaces</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, fontSize: 16, padding: 2 }}>+</button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, fontSize: 14, padding: 2 }}>···</button>
          </div>
        </div>

        {/* Recent label */}
        <div style={{ padding: "4px 12px 4px", fontSize: 11, fontWeight: 700, color: textMuted, letterSpacing: 0.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          Recent
        </div>

        {/* Project / Space link */}
        {SPACES.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "6px 12px", margin: "1px 8px", borderRadius: 4,
              background: active ? activeBg : "transparent",
              color: textPrimary, textDecoration: "none", fontSize: 14, fontWeight: 500,
              transition: "background 0.1s"
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ width: 20, height: 20, background: "#FF5630", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 10 }}>FP</span>
              </div>
              <span style={{ color: active ? accentBlue : textPrimary }}>{label === "/dashboard" ? "FlowPilot" : label}</span>
            </Link>
          );
        })}

        {/* Workspace navigation links */}
        {[
          { href: "/tasks", label: "Tasks (Board)", indent: true },
          { href: "/users", label: "Members", indent: true },
        ].map(({ href, label, indent }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "6px 12px", paddingLeft: indent ? 24 : 12,
              margin: "1px 8px", borderRadius: 4,
              background: active ? activeBg : "transparent",
              color: active ? accentBlue : textPrimary,
              textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 400,
              transition: "background 0.1s"
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              {label}
            </Link>
          );
        })}
      </div>

      {/* Bottom links */}
      <div style={{ borderTop: `1px solid ${sidebarBorder}`, marginTop: "auto", padding: "8px 0" }}>
        {[
          { label: "Filters", icon: "⚡" },
          { label: "Dashboards", icon: "⊞" },
          { label: "Teams", icon: "👥" },
          { label: "Customize sidebar", icon: "⚙" },
        ].map(item => (
          <div key={item.label} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "6px 12px", margin: "1px 8px", borderRadius: 4,
            color: textSecondary, fontSize: 14, cursor: "pointer",
            transition: "background 0.1s"
          }}
          onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <span style={{ fontSize: 14 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}

        {/* User + logout */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", margin: "4px 8px 0", borderTop: `1px solid ${sidebarBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#0052CC,#6554C0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
              {initials}
            </div>
            {user && <span style={{ fontSize: 12, color: textSecondary, fontWeight: 500 }}>{user.firstName}</span>}
          </div>
          <button onClick={logout} style={{ background: "none", border: "none", cursor: "pointer", color: textMuted, fontSize: 18, padding: 2 }} title="Logout">→</button>
        </div>
      </div>

      {/* Toggle button */}
      <button onClick={onToggle} style={{
        position: "absolute", right: -12, top: 72,
        width: 24, height: 24, borderRadius: "50%",
        background: "#fff", border: `1px solid ${sidebarBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", color: textSecondary, zIndex: 10, fontSize: 12
      }}>
        {collapsed ? "›" : "‹"}
      </button>
    </aside>
  );
}
