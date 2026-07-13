"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const accentBlue = "#0052CC";
const border = "#DCDFE4";
const textSecondary = "#44546F";
const hoverBg = "#F1F2F4";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/tasks": "Board",
  "/users": "Members",
};

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const title = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? "FlowPilot";
  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "?";

  return (
    <header style={{
      height: 56, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#fff", borderBottom: `1px solid ${border}`,
      padding: "0 16px",
      fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      zIndex: 50
    }}>
      {/* Left: Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 140 }}>
        <div style={{ width: 28, height: 28, background: accentBlue, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 22h20L12 2zm0 4l6 14H6l6-14z" />
          </svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#172B4D" }}>Jira</span>
      </div>

      {/* Center: Search */}
      <div style={{ flex: 1, maxWidth: 500, margin: "0 16px", position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#8590A2" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input placeholder="Search" style={{
          width: "100%", height: 36, border: `1px solid ${border}`,
          borderRadius: 4, paddingLeft: 36, paddingRight: 12,
          fontSize: 14, background: "#fff", color: "#172B4D", outline: "none",
          fontFamily: "inherit", boxSizing: "border-box"
        }}
        onFocus={e => (e.target.style.borderColor = accentBlue)}
        onBlur={e => (e.target.style.borderColor = border)} />
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 140, justifyContent: "flex-end" }}>
        {/* Create button */}
        <button style={{
          display: "flex", alignItems: "center", gap: 4,
          background: accentBlue, color: "#fff",
          border: "none", borderRadius: 4,
          padding: "0 14px", height: 36,
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          fontFamily: "inherit", transition: "background 0.15s"
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "#0065FF")}
        onMouseLeave={e => (e.currentTarget.style.background = accentBlue)}>
          <span style={{ fontSize: 16, fontWeight: 400 }}>+</span> Create
        </button>

        {/* Premium trial badge */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "#FF8B00", background: "#FFF7E6", border: "1px solid #FFE380", borderRadius: 12, padding: "2px 8px", whiteSpace: "nowrap" }}>
          Premium trial
        </div>

        {/* Bell */}
        <button style={{ width: 34, height: 34, borderRadius: "50%", background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: textSecondary, transition: "background 0.1s" }}
          onMouseEnter={e => (e.currentTarget.style.background = hoverBg)} onMouseLeave={e => (e.currentTarget.style.background = "none")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </button>

        {/* Settings */}
        <button style={{ width: 34, height: 34, borderRadius: "50%", background: "none", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: textSecondary, transition: "background 0.1s" }}
          onMouseEnter={e => (e.currentTarget.style.background = hoverBg)} onMouseLeave={e => (e.currentTarget.style.background = "none")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>

        {/* Avatar */}
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#0052CC,#6554C0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", cursor: "pointer", flexShrink: 0 }}>
          {initials}
        </div>
      </div>
    </header>
  );
}
