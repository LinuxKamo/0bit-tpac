"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/context/AuthContext";
import { useTheme } from "@/shared/context/ThemeContext";
import { Bell, ChevronUp, ChevronDown, User, Settings, Moon, Sun, LogOut, ChevronsLeft, ChevronsRight } from "lucide-react";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN:     "Super Admin",
  ADMIN:           "Platform Admin",
  MANAGER:         "Community Manager",
  CORPORATE_ADMIN: "Corporate Admin",
  MENTOR:          "Mentor",
  MEMBER:          "Member",
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN:     "#c0392b",
  ADMIN:           "#5b4fcf",
  MANAGER:         "#1e8c6e",
  CORPORATE_ADMIN: "#1b5ea6",
  MENTOR:          "#b86e00",
  MEMBER:          "#1e8c6e",
};

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export default function TopNav({ collapsed, onToggle }: Props) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

  const isDark    = theme === "dark";
  const role      = user?.role ?? "";
  const roleLabel = ROLE_LABELS[role] ?? role;
  const roleColor = ROLE_COLORS[role] ?? "#5b4fcf";

  const displayName =
    user?.displayName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "User";

  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
  };

  // ── Theme-aware tokens ──────────────────────────────────────────────────────
  const navBg         = "var(--color-topnav-bg)";
  const navBorder     = "var(--color-topnav-border)";
  const toggleColor   = isDark ? "rgba(255,255,255,0.45)"     : "rgba(0,0,0,0.4)";
  const toggleHoverBg = isDark ? "rgba(255,255,255,0.06)"     : "rgba(0,0,0,0.05)";
  const toggleHoverCl = isDark ? "#ffffff"                    : "#000000";
  const bellColor     = isDark ? "rgba(255,255,255,0.5)"      : "rgba(0,0,0,0.45)";
  const bellHoverBg   = isDark ? "rgba(255,255,255,0.06)"     : "rgba(0,0,0,0.05)";
  const bellBorderClr = isDark ? "#1a1a2e"                    : "#ffffff";

  // Pill — always uses the active sidebar item tint
  const pillBg        = "rgba(91,79,207,0.15)";
  const pillHoverBg   = "rgba(91,79,207,0.25)";
  const pillText      = isDark ? "rgba(255,255,255,0.6)"      : "#4b5563";

  // Dropdown card
  const dropBg        = "var(--color-card-bg)";
  const dropBorder    = "var(--color-card-border)";
  const dropShadow    = "var(--color-card-shadow)";
  const dropDivider   = "var(--color-border)";
  const dropNameClr   = "var(--color-text-primary)";
  const dropEmailClr  = "var(--color-text-muted)";
  const dropIconClr   = "var(--color-text-muted)";
  const dropLabelClr  = "var(--color-text-secondary)";
  const dropHoverBg   = isDark ? "rgba(255,255,255,0.05)"     : "#f9fafb";
  const dropBadgeBg   = isDark ? "rgba(255,255,255,0.08)"     : "#f3f4f6";
  const dropBadgeClr  = "var(--color-text-muted)";

  return (
    <header style={{
      height:          "var(--topnav-height)",
      backgroundColor: navBg,
      borderBottom:    `1px dashed ${navBorder}`,
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "space-between",
      padding:         "0 24px 0 16px",
      flexShrink:      0,
      position:        "relative",
      zIndex:          10,
      transition:      "background-color 0.2s ease",
    }}>

      {/* ── Collapse toggle ──────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onToggle}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", color: toggleColor, transition: "background 0.12s, color 0.12s" }}
        onMouseEnter={e => { e.currentTarget.style.background = toggleHoverBg; e.currentTarget.style.color = toggleHoverCl; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = toggleColor; }}
      >
        {collapsed ? <ChevronsRight size={18} strokeWidth={1.8} /> : <ChevronsLeft size={18} strokeWidth={1.8} />}
      </button>

      {/* ── Right side ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        {/* Bell */}
        <Link
          href="/notifications"
          style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, color: bellColor, transition: "background 0.12s, color 0.12s" }}
          onMouseEnter={e => { e.currentTarget.style.background = bellHoverBg; e.currentTarget.style.color = toggleHoverCl; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = bellColor; }}
          title="Notifications"
        >
          <Bell size={18} strokeWidth={1.8} />
          <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, borderRadius: "50%", background: "#5b4fcf", border: `2px solid ${bellBorderClr}` }} />
        </Link>

        {/* Pill trigger */}
        <div ref={ref} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", borderRadius: 999, background: pillBg, border: "none", cursor: "pointer", transition: "background 0.12s" }}
            onMouseEnter={e => (e.currentTarget.style.background = pillHoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = pillBg)}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#5b4fcf", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 12 }}>{initials}</span>
            </div>
            <span style={{ color: pillText, fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>{displayName}</span>
            {open
              ? <ChevronUp   size={14} strokeWidth={2.5} style={{ color: pillText }} />
              : <ChevronDown size={14} strokeWidth={2.5} style={{ color: pillText }} />
            }
          </button>

          {/* Dropdown */}
          {open && (
            <div style={{ position: "absolute", top: "calc(100% + 10px)", right: 0, minWidth: 220, background: dropBg, border: `1px solid ${dropBorder}`, borderRadius: 14, boxShadow: dropShadow, padding: "8px", zIndex: 100 }}>

              {/* User info */}
              <div style={{ padding: "12px 14px 14px" }}>
                <div style={{ color: dropNameClr, fontWeight: 700, fontSize: 14 }}>{displayName}</div>
                <div style={{ color: dropEmailClr, fontSize: 12, marginTop: 2 }}>{user?.email}</div>
                <div style={{ marginTop: 10 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", background: "rgba(91,79,207,0.12)", border: "1.5px solid rgba(91,79,207,0.3)", borderRadius: 999, padding: "3px 12px" }}>
                    <span style={{ color: "#5b4fcf", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em" }}>{role.replace(/_/g, " ")}</span>
                  </span>
                </div>
              </div>

              <div style={{ height: 1, background: dropDivider, margin: "0 4px 4px" }} />

              <MenuItem icon={<User size={15} strokeWidth={1.8} style={{ color: dropIconClr }}/>}     label="Profile"  labelColor={dropLabelClr} hoverBg={dropHoverBg} onClick={() => { setOpen(false); router.push("/profile"); }} />
              <MenuItem icon={<Settings size={15} strokeWidth={1.8} style={{ color: dropIconClr }}/>} label="Settings" labelColor={dropLabelClr} hoverBg={dropHoverBg} onClick={() => { setOpen(false); router.push("/settings"); }} />

              <div style={{ height: 1, background: dropDivider, margin: "4px" }} />

              {/* Dark Mode toggle */}
              <MenuItem
                icon={isDark
                  ? <Sun  size={15} strokeWidth={1.8} style={{ color: dropIconClr }}/>
                  : <Moon size={15} strokeWidth={1.8} style={{ color: dropIconClr }}/>
                }
                label="Dark Mode"
                labelColor={dropLabelClr}
                hoverBg={dropHoverBg}
                badge={isDark ? "ON" : "OFF"}
                badgeBg={dropBadgeBg}
                badgeColor={dropBadgeClr}
                onClick={() => { toggle(); }}
              />

              <div style={{ height: 1, background: dropDivider, margin: "4px" }} />

              <MenuItem icon={<LogOut size={15} strokeWidth={1.8} style={{ color: "#c0392b" }}/>} label="Sign out" labelColor="#c0392b" hoverBg={isDark ? "rgba(192,57,43,0.08)" : "rgba(192,57,43,0.06)"} onClick={handleLogout} />
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

function MenuItem({ icon, label, onClick, badge, labelColor, hoverBg, badgeBg, badgeColor }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: string;
  labelColor?: string;
  hoverBg?: string;
  badgeBg?: string;
  badgeColor?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 8, background: hovered ? (hoverBg ?? "rgba(255,255,255,0.05)") : "transparent", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.1s" }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, color: labelColor ?? "rgba(255,255,255,0.75)", fontSize: 13.5, fontWeight: 500 }}>{label}</span>
      {badge && (
        <span style={{ background: badgeBg ?? "rgba(255,255,255,0.08)", color: badgeColor ?? "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "2px 7px", letterSpacing: "0.04em" }}>
          {badge}
        </span>
      )}
    </button>
  );
}
