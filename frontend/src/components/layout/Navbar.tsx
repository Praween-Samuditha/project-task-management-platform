"use client";

import Link from "next/link";
import { useEffect, useRef, useState, createContext, useContext, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";

// ── Theme context ─────────────────────────────────────────────────────────────
type Theme = "light" | "dark";
const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("fp-theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("fp-theme", next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Tokens ────────────────────────────────────────────────────────────────────
const LIGHT = {
  navBg:       "#FFFFFF",
  navBorder:   "#E8ECF0",
  logo:        "#172B4D",
  text:        "#44546F",
  textPrimary: "#172B4D",
  inputBg:     "#F8F9FB",
  inputBorder: "#E8ECF0",
  inputText:   "#172B4D",
  iconHover:   "#F1F2F4",
  dropBg:      "#FFFFFF",
  dropBorder:  "#E2E8F0",
  dropHead:    "#F8FAFC",
  dropHeadBorder: "#F1F5F9",
  dropText:    "#0F172A",
  dropSub:     "#475569",
  toggleBg:    "#F1F2F4",
  toggleIcon:  "#44546F",
};

const DARK = {
  navBg:       "#1D2125",
  navBorder:   "#2C333A",
  logo:        "#DFE1E6",
  text:        "#8A94A5",
  textPrimary: "#DFE1E6",
  inputBg:     "#161A1D",
  inputBorder: "#2C333A",
  inputText:   "#DFE1E6",
  iconHover:   "#2C333A",
  dropBg:      "#22272B",
  dropBorder:  "#2C333A",
  dropHead:    "#161A1D",
  dropHeadBorder: "#2C333A",
  dropText:    "#DFE1E6",
  dropSub:     "#8A94A5",
  toggleBg:    "#2C333A",
  toggleIcon:  "#8A94A5",
};


// ── Sun icon ──────────────────────────────────────────────────────────────────
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

// ── Moon icon ─────────────────────────────────────────────────────────────────
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const T = theme === "dark" ? DARK : LIGHT;

  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() : "?";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    if (profileOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  const iconBtn: React.CSSProperties = {
    width: 34, height: 34, borderRadius: "50%",
    background: "none", border: "none",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: T.text, transition: "background 0.1s",
    flexShrink: 0,
  };

  return (
    <header style={{
      height: 56, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: T.navBg, borderBottom: `1px solid ${T.navBorder}`,
      padding: "0 20px",
      fontFamily: "'-apple-system', BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      zIndex: 50, transition: "background 0.2s, border-color 0.2s",
    }}>

      {/* Left: Logo */}
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, background: "#0052CC", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L2 22h20L12 2zm0 4l6 14H6l6-14z"/>
          </svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: T.logo }}>FlowPilot</span>
      </Link>

      {/* Center: Search */}
      <div style={{ flex: 1, maxWidth: 480, margin: "0 20px", position: "relative" }}>
        <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.text, pointerEvents: "none" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <input
          placeholder="Search…"
          style={{
            width: "100%", height: 34,
            border: `1px solid ${T.inputBorder}`,
            borderRadius: 6, paddingLeft: 34, paddingRight: 12,
            fontSize: 13, background: T.inputBg, color: T.inputText,
            outline: "none", fontFamily: "inherit", boxSizing: "border-box",
            transition: "border-color 0.15s, background 0.2s",
          }}
          onFocus={e => (e.target.style.borderColor = "#0052CC")}
          onBlur={e  => (e.target.style.borderColor = T.inputBorder)}
        />
      </div>

      {/* Right: actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>

        {/* Bell */}
        <button
          style={iconBtn}
          onMouseEnter={e => (e.currentTarget.style.background = T.iconHover)}
          onMouseLeave={e => (e.currentTarget.style.background = "none")}
          title="Notifications"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>

        {/* Light / Dark toggle */}
        <button
          onClick={toggle}
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          style={{
            ...iconBtn,
            background: T.toggleBg,
            color: T.toggleIcon,
            borderRadius: 8,
            width: 34, height: 34,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = theme === "dark" ? "#3A4149" : "#E2E6EA")}
          onMouseLeave={e => (e.currentTarget.style.background = T.toggleBg)}
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>

        {/* Avatar + dropdown */}
        <div ref={menuRef} style={{ position: "relative", marginLeft: 4 }}>
          <button
            type="button"
            onClick={() => setProfileOpen(o => !o)}
            style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg,#0052CC,#6554C0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#fff",
              cursor: "pointer", border: "none", outline: "none", flexShrink: 0,
            }}
          >
            {initials}
          </button>

          {profileOpen && (
            <div style={{
              position: "absolute", right: 0, top: 42, minWidth: 220,
              background: T.dropBg, border: `1px solid ${T.dropBorder}`,
              borderRadius: 12, boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
              zIndex: 200, overflow: "hidden",
            }}>
              {/* User info */}
              <div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.dropHeadBorder}`, background: T.dropHead }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.dropText }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: 12, color: T.dropSub, marginTop: 2 }}>{user?.email}</div>
              </div>

              {/* Theme toggle row inside dropdown */}
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${T.dropHeadBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: T.dropText }}>
                  {theme === "light" ? "☀️ Light mode" : "🌙 Dark mode"}
                </span>
                <button
                  onClick={toggle}
                  style={{
                    width: 40, height: 22, borderRadius: 11,
                    background: theme === "dark" ? "#0052CC" : "#D1D5DB",
                    border: "none", cursor: "pointer", position: "relative",
                    transition: "background 0.2s", flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: "absolute", top: 3,
                    left: theme === "dark" ? 21 : 3,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </button>
              </div>

              {[
                { label: "Profile" },
                { label: "Account settings" },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => setProfileOpen(false)}
                  style={{ width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: "transparent", color: T.dropText, fontSize: 13, cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = T.iconHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {item.label}
                </button>
              ))}

              <div style={{ borderTop: `1px solid ${T.dropHeadBorder}` }}>
                <button
                  onClick={() => { logout(); setProfileOpen(false); }}
                  style={{ width: "100%", textAlign: "left", padding: "10px 14px", border: "none", background: "transparent", color: "#EF4444", fontSize: 13, cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#FEE2E2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
